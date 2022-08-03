<?php

define('SOS_DIR', trailingslashit(get_template_directory()));
define('SOS_URI', trailingslashit(get_template_directory_uri()));

if (!function_exists('_serialize_product_metadata')) {
    require_once(SOS_DIR . 'rest_api/utils.php');
}

add_action('admin_enqueue_scripts', static function () {
    wp_enqueue_style(
        'sos-admin',
        SOS_URI . 'css/admin.css',
        [],
        false
    );
});

add_action('woocommerce_before_order_itemmeta', static function ($item_id, $item, $product) {
    $product_meta = _serialize_product_metadata($product);
    $is_wheel = product_is_wheel($product);
    $is_tire = product_is_tire($product);

    if ($is_wheel || $is_tire) {
        $product_meta_html = '';
        $product_meta_template = '<div class="sos-product-meta__item"><div>%s</div><span>%s</span></div>';

        foreach ($product_meta as $label => $value) {
            $product_meta_html .= sprintf( $product_meta_template, $label, $value );
        }

        printf('<div class="sos-product-meta">%s</div>', $product_meta_html);
    }
}, 10, 3);
