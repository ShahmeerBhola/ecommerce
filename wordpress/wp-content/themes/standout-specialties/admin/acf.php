<?php


function _update_all_variants($post_id, $field_id, $field_value)
{
    $product = wc_get_product($post_id);

    if ($product->is_type('variable')) {
        foreach ($product->get_available_variations() as $variation) {
            update_field($field_id, $field_value, $variation['variation_id']);
        }
    }
}


function product_sold_as_truck_set_update_value($value, $post_id, $field)
{
    _update_all_variants($post_id, 'field_5f873fb676100', $value);
    return $value;
}


function product_truck_info_required_for_purchase_update_value($value, $post_id, $field)
{
    _update_all_variants($post_id, 'field_5f85b3ec7c853', $value);
    return $value;
}


function wheel_package_markup_update_acf_post_object_field_choices($title, $post, $field, $post_id)
{
    $sku = get_field('_sku', $post->ID);
    if ($sku && !empty($sku)) {
        $title .= ' [' . $sku .  ']';
    }
    return $title;
}


function delete_priority_search_result_if_zero($value, $post_id, $field)
{
    if (!$value) {
        delete_post_meta($post_id, 'prioritized_search_result');
        delete_post_meta($post_id, '_prioritized_search_result');
        return null;
    }
    return $value;
}


// make stripe_customer_id field readonly https://ihatewp.com/easiest-way-to-make-acf-field-read-only/
add_filter('acf/load_field/key=field_5ee7bef8fc1e7', function ($field) {
    $field['readonly'] = 1;
    return $field;
});

add_filter('acf/update_value/key=field_5f873fb676100', 'product_sold_as_truck_set_update_value', 10, 3);
add_filter('acf/update_value/key=field_5f85b3ec7c853', 'product_truck_info_required_for_purchase_update_value', 10, 3);

add_filter('acf/update_value/key=field_5fe35e7d82524', 'delete_priority_search_result_if_zero', 10, 3);

// Wheel Package Markup ACF post object modifications
add_filter('acf/fields/post_object/result/key=field_5fba77c983875', 'wheel_package_markup_update_acf_post_object_field_choices', 10, 4);
add_filter('acf/fields/post_object/result/key=field_5fba782483876', 'wheel_package_markup_update_acf_post_object_field_choices', 10, 4);
