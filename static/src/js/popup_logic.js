odoo.define('pos_add_customer_detail.popup_logic', function (require) {
    'use strict';
 
    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const Registries = require('point_of_sale.Registries');
 
  
    console.log("working ....................................")
    // console.log(CustomPopup)
    const OrderWithCustomerValidation = (PaymentScreen) =>
        class extends PaymentScreen {
            async validateOrder() {
                    console.log(" Showing customer confirmation popup");
                    // const currentPartner = this.currentOrder.get_partner();
                    // console.log(currentPartner)
                    
                      const { confirmed, payload } = await this.showPopup('CustomerInputPopup');
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
