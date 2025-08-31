odoo.define('pos_add_customer_detail.BlockingLoadingPopup', function (require) {
    'use strict';

    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');
    const { _lt } = require('@web/core/l10n/translation');
    const { parse } = require('web.field_utils');
    const { useValidateCashInput, useAsyncLockedMethod } = require('point_of_sale.custom_hooks');

    const { useRef, useState } = owl;

    class BlockingLoadingPopup extends AbstractAwaitablePopup {
        setup() {
            super.setup();
            setTimeout(() => {
                this.props.resolve(); // auto-close after 2 minutes
                super.cancel();
            }, 2 * 60 * 1000);
            
            
        }
        get isEscapable() {
            return false; // disables ESC key
        }

        get hasCancelButton() {
            return false; // hides cancel button
        }
       
    }
    BlockingLoadingPopup.template = 'pos_add_customer_detail.BlockingLoadingPopup';
    


    Registries.Component.add(BlockingLoadingPopup);

    return BlockingLoadingPopup;
});
