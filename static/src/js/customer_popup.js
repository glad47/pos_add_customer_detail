odoo.define('pos_add_customer_detail.CustomerInputPopup2', function (require) {
    'use strict';


    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const { useState } = require('owl');


    class CustomerInputPopup extends PosComponent {
        setup() {
            super.setup();
            this.state = useState({
                name: '',
                phone: '',
                vat: '',
            });
        }

        confirm() {
            this.resolve({
                confirmed: true,
                payload: {
                    name: this.state.name,
                    phone: this.state.phone,
                    vat: this.state.vat,
                },
            });
        }

        cancel() {
            this.resolve({ confirmed: false });
        }
    }

    CustomerInputPopup.template = 'CustomerInputPopup';
    Registries.Component.add(CustomerInputPopup);

    return CustomerInputPopup;
});
