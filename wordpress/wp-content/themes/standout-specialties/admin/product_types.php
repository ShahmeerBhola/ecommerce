<?php


if (class_exists('WC_Product')) {
    function add_custom_product_type($types)
    {
        $types['service'] = 'Service';
        return $types;
    }


    function create_custom_product_type()
    {
        class WC_Product_Service extends WC_Product
        {
            public function get_type()
            {
                return 'service';
            }
        }
    }


    function woocommerce_product_class($classname, $product_type)
    {
        if ($product_type == 'service') {
            $classname = 'WC_Product_Service';
        }
        return $classname;
    }

    // https://www.businessbloomer.com/woocommerce-how-to-create-a-new-product-type/
    add_filter('product_type_selector', 'add_custom_product_type'); // #1 Add New Product Type to Select Dropdown
    add_action('init', 'create_custom_product_type'); // #2 Add New Product Type Class
    add_filter('woocommerce_product_class', 'woocommerce_product_class', 10, 2); // #3 Load New Product Type Class
}
