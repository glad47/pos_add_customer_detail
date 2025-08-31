odoo.define('pos_add_customer_detail.CustomerInputPopup', function (require) {
    'use strict';

    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');
    const { _lt } = require('@web/core/l10n/translation');
    const { parse } = require('web.field_utils');
    const { useValidateCashInput, useAsyncLockedMethod } = require('point_of_sale.custom_hooks');
    const { useService } = require("@web/core/utils/hooks");
    const { Gui } = require('point_of_sale.Gui');
    const { useRef, useState } = owl;

    class CustomerInputPopup extends AbstractAwaitablePopup {
        setup() {
            super.setup();
            this.state = useState({
                phone: this.props.phone || '',
                name: this.props.name || '',
                vat: this.props.vat || '',
                inputHasError: false,
            });
            // this.notification = useService("notification");
            
        }
        confirm() {
            const { phone, name, vat } = this.state;

            // Fallback logic: if name and vat are empty, use phone
            //!name.trim() && !vat.trim()
           
            const saudiPhoneRegex = /^(?:\+966|0)?5\d{8}$/;

            // Always require phone number
            if (!phone || !saudiPhoneRegex.test(phone)) {
                this.state.inputHasError = true;
                this.errorMessage = this.env._t('Please enter a valid Saudi mobile number.');
                return;
            }

            // Optionally auto-fill name if missing
            if (!name.trim()) {
                this.state.name = phone;
                // this.state.vat = phone; // Uncomment if VAT fallback is needed
            }
                return super.confirm();
            }

        onNameInput(ev) {
            this.state.name = ev.target.value;
        }

        onPhoneInput(ev) {
            this.state.phone = ev.target.value;
        }

        onVatInput(ev) {
            this.state.vat = ev.target.value;
        }

        cancel() {
             Gui.showPopup("BlockingLoadingPopup").then(() => {
                console.log("⏳ Done waiting, skipping customer info");
                super.cancel();
            });

            // setTimeout(() => {
            //     console.log("⏳ Skipped customer info after 2 minutes");
            //     super.cancel(); // close the popup after delay
            // }, 2 * 60 * 1000); // 2 minutes in milliseconds
        }

        getPayload() {
            return {
                phone: this.state.phone.trim(),
                name: this.state.name.trim(),
                vat: this.state.vat.trim(),
            };
        }
       
    }
    CustomerInputPopup.template = 'pos_add_customer_detail.CustomerInputPopup';
    CustomerInputPopup.defaultProps = {
        cancelText: _lt('Cancel'),
        confirmText: _lt('Confirm'),
        title: _lt('Customer Info'),
        phone: '',  // default phone value
        name: '',   // default name value
        vat: '',    // default VAT value
    };



    Registries.Component.add(CustomerInputPopup);

    return CustomerInputPopup;
});
