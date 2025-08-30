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
        'point_of_sale.assets': [
            'pos_add_customer_detail/static/src/xml/popup_template.xml',
            'pos_add_customer_detail/static/src/js/customer_popup.js',
            'pos_add_customer_detail/static/src/js/popup_logic.js',
           
            
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