<?php

$custom_statuses = array(
    'wc-awaiting-product' => 'Awaiting product',
    'wc-product-checkin' => 'Product check-in',
    'wc-awaiting-mounting' => 'Awaiting mounting',
    'wc-mounting-balancing' => 'Mounting & Balancing',
    'wc-quality-control' => 'Quality Control',
    'wc-shipping-pickup' => 'Shipping/Pickup',
    'wc-printing-label' => 'Packaging & Printing Label',
);

function register_custom_order_statuses()
{
    global $custom_statuses;

    foreach ($custom_statuses as $slug => $label) {
        $label_count = $label . ' (%s)';
        register_post_status($slug, array(
            'label' => 'Awaiting product',
            'public' => true,
            'exclude_from_search' => false,
            'show_in_admin_all_list' => true,
            'show_in_admin_status_list' => true,
            'label_count' => _n_noop($label_count, $label_count),
        ));
    }
}


function add_custom_order_statuses_to_order_statuses($order_statuses)
{
    global $custom_statuses;

    $new_order_statuses = array();
    foreach ($order_statuses as $key => $status) {
        // add new order statuses after processing
        $new_order_statuses[$key] = $status;
        if ('wc-processing' === $key) {
            foreach ($custom_statuses as $slug => $label) {
                $new_order_statuses[$slug] = $label;
            }
        }
    }
    return $new_order_statuses;
}


add_action('init', 'register_custom_order_statuses');
add_filter('wc_order_statuses', 'add_custom_order_statuses_to_order_statuses');
