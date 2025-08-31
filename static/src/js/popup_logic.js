odoo.define('point_of_sale.popup_logic', function (require) {
    'use strict';
 
    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const Registries = require('point_of_sale.Registries');
    
  
    console.log("working ....................................")
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
                            phone: currentPartner.mobile || '',
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
                            mobile: phone,
                            vat: vat,
                        };

                        try {
                            const newPartnerId = await this.rpc({
                                model: 'res.partner',
                                method: 'create',
                                args: [newPartnerData],
                            });

                            console.log(`🟢 Partner created with ID: ${newPartnerId}`);

                            const [newPartner] = await this.rpc({
                                model: 'res.partner',
                                method: 'read',
                                args: [[newPartnerId], ['id', 'name', 'mobile', 'vat']],
                            });


                            this.env.pos.db.add_partners([newPartner]);
                            
                            this.currentOrder.set_partner(newPartner);

                        } catch (error) {
                            console.error('❌ Error during partner creation or assignment:', error);
                        }

                        } 

                        // console.log('✅ Customer info saved to order:', this.currentOrder.get_partner());
                    }

                    //   console.log(confirmed)
                    //    if (confirmed) {
                    //     // Create a new partner object
                    //     const newPartner = {
                    //         id: this.env.pos.db.next_partner_id++, // or use a temp ID
                    //         name: payload.name,
                    //         phone: payload.phone,
                    //         vat: payload.vat,
                    //     };

                    //     // Add to POS DB
                    //     this.env.pos.db.add_partner(newPartner);

                    //     // Set on current order
                    //     this.currentOrder.set_partner(newPartner);
                    //     this.currentOrder.updatePricelist(newPartner);

                        // console.log(`✅ Partner set: ${newPartner.name}`);
                    // } else {
                    //     console.log("❌ Customer entry cancelled");
                    // }
                    
                    // const confirmed = await this.env.services.popup.add(CustomPopup, {
                    //     title: "Confirm Customer Info",
                    //     partner: partner,
                    // });
                    // if (!confirmed) {
                    //     console.log("❌ Order validation cancelled by user");
                    //     return;
                    // }
                
                return super.validateOrder(false);
            }
        };

    Registries.Component.extend(PaymentScreen, OrderWithCustomerValidation);

    return OrderWithCustomerValidation;
});
