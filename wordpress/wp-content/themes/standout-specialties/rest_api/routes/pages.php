<?php


require_once(__DIR__ . '/../utils.php');

function home_page_data($request)
{
    $wheel_brands = get_product_category_brands('wheels');

    $data = [
        'categories' => _get_product_categories(),
        'featured_products' => _get_featured_products(),
        'truck_years' => _get_truck_years(),
        'wheel_diameters' => get_diameters(),
        'wheel_widths' => get_widths(),
        'wheel_bolt_patterns' => get_bolt_patterns(),
        'wheel_brands' => array_column($wheel_brands, 'label')
    ];

    return make_response($data);
}


function checkout_page_data($request)
{
    $wc_countries = new WC_Countries();
    $states = _get_states_for_country($request['country_code']);

    return make_response(array(
        'selling_countries' => $wc_countries->get_allowed_countries(),
        'selling_states' => $states,
        'shipping_countries' => $wc_countries->get_shipping_countries(),
        'shipping_states' => $states,
        'brand_ambassadors' => get_brand_ambassadors(),
    ));
}
