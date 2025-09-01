odoo.define('point_of_sale.popup_logic', function (require) {
    'use strict';
 
    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const Registries = require('point_of_sale.Registries');
    
  
    // console.log("working ....................................")
    // console.log(CustomPopup)
    const OrderWithCustomerValidation = (PaymentScreen) =>
        class extends PaymentScreen {
            async validateOrder() {
                    const currentPartner = this.currentOrder.get_partner();

                    let popupProps = {
                        title: 'Customer Info',
                        cancelText: 'Cancel',
                        confirmText: 'Confirm',
                    };

                    // Step 1: If partner exists, pre-fill popup
                    if (currentPartner) {
                        popupProps = {
                            ...popupProps,
                            phone: currentPartner.phone || '',
                            name: currentPartner.name || '',
                            vat: currentPartner.vat || '',
                        };
                    }

                    // Step 2: Show popup with or without pre-filled data
                    const { confirmed, payload } = await this.showPopup('CustomerInputPopup', popupProps);

                    if (confirmed) {
                        const { phone, name, vat } = payload;
                        // Step 3: If no partner, create one and assign to order
                        if (!currentPartner) {
                           const newPartnerData = {
                            name: name,
                            phone: phone,
                            vat: vat,
                            supplier_rank: 0,
                        }; 

                       
                        

                        try {

                            const existingPartners = await this.rpc({
                                model: 'res.partner',
                                method: 'search_read',
                                domain: [['phone', '=', phone],['customer_rank', '>', 0]],
                                limit: 1,
                            });
                            if(!existingPartners || existingPartners.length == 0){
                                const newPartnerId = await this.rpc({
                                    model: 'res.partner',
                                    method: 'create',
                                    args: [newPartnerData],
                                    context: {
                                        res_partner_search_mode: 'customer',  
                                    },
                                });


                                const [newPartner] = await this.rpc({
                                    model: 'res.partner',
                                    method: 'read',
                                    args: [[newPartnerId], ['id', 'name', 'phone', 'vat']],
                                });


                                this.env.pos.db.add_partners([newPartner]);
                                this.currentOrder.set_partner(newPartner);
                            }else{
                                this.env.pos.db.add_partners([existingPartners]);
                                this.currentOrder.set_partner(existingPartners[0]);
                            }
                            

                        } catch (error) {
                            console.error('Error during partner creation or assignment:', error);
                        }

                        } 

                    }

                   
                
                return super.validateOrder(false);
            }


            async _isOrderValid(isForceValidate) {
            if (this.currentOrder.get_orderlines().length === 0 && this.currentOrder.is_to_invoice()) {
                this.showPopup('ErrorPopup', {
                    title: this.env._t('Empty Order'),
                    body: this.env._t(
                        'There must be at least one product in your order before it can be validated and invoiced.'
                    ),
                });
                return false;
            }

            if (this.currentOrder.electronic_payment_in_progress()) {
                this.showPopup('ErrorPopup', {
                    title: this.env._t('Pending Electronic Payments'),
                    body: this.env._t(
                        'There is at least one pending electronic payment.\n' +
                        'Please finish the payment with the terminal or ' +
                        'cancel it then remove the payment line.'
                    ),
                });
                return false;
            }

            const splitPayments = this.paymentLines.filter(payment => payment.payment_method.split_transactions)
            // if (splitPayments.length && !this.currentOrder.get_partner()) {
            //     const paymentMethod = splitPayments[0].payment_method
            //     const { confirmed } = await this.showPopup('ConfirmPopup', {
            //         title: this.env._t('Customer Required'),
            //         body: _.str.sprintf(this.env._t('Customer is required for %s payment method.'), paymentMethod.name),
            //     });
            //     if (confirmed) {
            //         this.selectPartner();
            //     }
            //     return false;
            // }

            // if ((this.currentOrder.is_to_invoice() || this.currentOrder.is_to_ship()) && !this.currentOrder.get_partner()) {
            //     const { confirmed } = await this.showPopup('ConfirmPopup', {
            //         title: this.env._t('Please select the Customer'),
            //         body: this.env._t(
            //             'You need to select the customer before you can invoice or ship an order.'
            //         ),
            //     });
            //     if (confirmed) {
            //         this.selectPartner();
            //     }
            //     return false;
            // }

            // let partner = this.currentOrder.get_partner()
            // if (this.currentOrder.is_to_ship() && !(partner.name && partner.street && partner.city && partner.country_id)) {
            //     this.showPopup('ErrorPopup', {
            //         title: this.env._t('Incorrect address for shipping'),
            //         body: this.env._t('The selected customer needs an address.'),
            //     });
            //     return false;
            // }

            if (this.currentOrder.get_total_with_tax() != 0 && this.currentOrder.get_paymentlines().length === 0) {
                this.showNotification(this.env._t('Select a payment method to validate the order.'));
                return false;
            }

            if (!this.currentOrder.is_paid() || this.invoicing) {
                return false;
            }

            if (this.currentOrder.has_not_valid_rounding()) {
                var line = this.currentOrder.has_not_valid_rounding();
                this.showPopup('ErrorPopup', {
                    title: this.env._t('Incorrect rounding'),
                    body: this.env._t(
                        'You have to round your payments lines.' + line.amount + ' is not rounded.'
                    ),
                });
                return false;
            }

            // The exact amount must be paid if there is no cash payment method defined.
            if (
                Math.abs(
                    this.currentOrder.get_total_with_tax() - this.currentOrder.get_total_paid()  + this.currentOrder.get_rounding_applied()
                ) > 0.00001
            ) {
                var cash = false;
                for (var i = 0; i < this.env.pos.payment_methods.length; i++) {
                    cash = cash || this.env.pos.payment_methods[i].is_cash_count;
                }
                if (!cash) {
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('Cannot return change without a cash payment method'),
                        body: this.env._t(
                            'There is no cash payment method available in this point of sale to handle the change.\n\n Please pay the exact amount or add a cash payment method in the point of sale configuration'
                        ),
                    });
                    return false;
                }
            }

            // if the change is too large, it's probably an input error, make the user confirm.
            if (
                !isForceValidate &&
                this.currentOrder.get_total_with_tax() > 0 &&
                this.currentOrder.get_total_with_tax() * 1000 < this.currentOrder.get_total_paid()
            ) {
                this.showPopup('ConfirmPopup', {
                    title: this.env._t('Please Confirm Large Amount'),
                    body:
                        this.env._t('Are you sure that the customer wants to  pay') +
                        ' ' +
                        this.env.pos.format_currency(this.currentOrder.get_total_paid()) +
                        ' ' +
                        this.env._t('for an order of') +
                        ' ' +
                        this.env.pos.format_currency(this.currentOrder.get_total_with_tax()) +
                        ' ' +
                        this.env._t('? Clicking "Confirm" will validate the payment.'),
                }).then(({ confirmed }) => {
                    if (confirmed) this.validateOrder(true);
                });
                return false;
            }

            if (!this.currentOrder._isValidEmptyOrder()) return false;

            return true;
        }
        };

    Registries.Component.extend(PaymentScreen, OrderWithCustomerValidation);

    return OrderWithCustomerValidation;
});
