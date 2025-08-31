{
    'name': 'pos_add_customer_detail',
    'version': '16.0.1.0.0',
    'category': 'Point of Sale',
    'author': "gladdema",
    'summary': 'Periodic loyalty updates for POS',
    'depends': ['point_of_sale'],
    # 'data': [
    #     'controllers/controllers.py',
    # ],
    'assets': {
        'web.assets_backend': [
            'pos_add_customer_detail/static/src/scss/pos_customer.scss',
        ],

        'point_of_sale.assets': [
            'pos_add_customer_detail/static/src/scss/pos_customer.scss', 
            'pos_add_customer_detail/static/src/js/BlockingLoadingPopup.js',
            'pos_add_customer_detail/static/src/js/CustomerInputPopup.js',
            'pos_add_customer_detail/static/src/js/popup_logic.js',
            'pos_add_customer_detail/static/src/xml/Popups/CustomerInputPopup.xml',
            'pos_add_customer_detail/static/src/xml/Popups/BlockingLoadingPopup.xml',
        ],
    },

    # 'data': [
    #     # 'views/views.xml',
    #     'views/templates.xml',
    # ],
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}