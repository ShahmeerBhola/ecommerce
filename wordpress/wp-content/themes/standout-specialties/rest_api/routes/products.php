<?php

require_once(__DIR__ . '/../utils.php');


function product_search($request)
{
    global $wpdb;

    $data = array(
        'products' => array(),
    );

    $page = $request['page'];
    $per_page = $request['per_page'];
    $sort = $request['sort'];
    $add_spare = $request['add_spare'];
    $selected_wheel_id = $request['selected_wheel'];
    $category_slug = $request['category'];
    $brand_slug = $request['brand'];
    $search_term = $request['s'];
    $forged_wheels = $request['forged'];

    $truck_year = $request['year'];
    $truck_make = $request['make'];
    $truck_model = $request['model'];
    $truck_trim = $request['trim'];
    $truck_bolt = $request['bolt_pattern'];

    $is_wheels = $category_slug == 'wheels';

    $wheel_attributes = [
        'diameter',
        'wheel_offset',
        'bolt_pattern',
        'color',
        'width',
    ];

    $meta_keys = [
        'wheel_size',
        'height',
        'max_pressure',
        'max_load',
        'load_range',
        'width',
    ];

    $args = array(
        'paged' => $page,
        'meta_query' => array(
            'relation' => 'AND',
        ),
    );
    $tax_query_args = array(
        'relation' => 'AND',
        array(
            'taxonomy' => 'product_type',
            'field' => 'name',
            'terms' => 'service',
            'operator' => 'NOT IN',
        ),
    );

    if ($search_term) {
        $args['_like_post_title'] = $search_term;  // will do LIKE '%title%' query
    }

    // Check bolt pattern
    if ($truck_year && $truck_make && $truck_model && $truck_trim) {
        $truck_bolt = _get_truck_bolt($truck_year, $truck_make, $truck_model, $truck_trim);

        if (empty($truck_bolt)) {
            return make_response($data, calculate_empty_pagination($page, $per_page));
        }
    }

    // Truck based search
    if(!empty($truck_bolt)) {
        $bolt_filter = _product_filter_by_bolt_pattern($truck_bolt);
        $tax_query_args = wp_parse_args($bolt_filter, $tax_query_args);
    }

    if ($forged_wheels !== null) {
        $forged_brand_ids = array();
        $forged_brands_query = get_all_published_posts_by_type('brand', array(
            'meta_key' => 'forged_products',
            'meta_value' => true,
        ));

        foreach ($forged_brands_query->posts as $brand) {
            array_push($forged_brand_ids, $brand->ID);
        }

        array_push($args['meta_query'], array(
            'key' => 'brand',
            'value' => $forged_brand_ids,
            'compare' => $forged_wheels ? 'IN' : 'NOT IN',
        ));
    }

    if ($category_slug) {
        $category = _get_product_category_by_slug($category_slug);

        if ($category) {
            $data['category'] = serialize_category($category);
            $category_filter = _product_filter_by_category($category_slug);
            $tax_query_args = wp_parse_args($category_filter, $tax_query_args);
        } else {
            // category provided doesn't exist...
            $data['category'] = new ArrayObject();
            return make_response($data, [], 400);
        }
    }

    if ($brand_slug) {
        $brand_id = _get_post_id_from_slug($brand_slug, 'brand');
        if ($brand_id) {
            $data['brand'] = serialize_brand_from_brand_id($brand_id);

            array_push($args['meta_query'], array(
                'key' => 'brand',
                'value' => $brand_id,
            ));
        } else {
            // brand provided doesn't exist..
            $data['brand'] = new ArrayObject();
            return make_response($data, array(), 400);
        }
    }

    // should either provide selected_wheel_id or meta keys.. not both
    if ($selected_wheel_id && !$is_wheels) {
        $wheel = wc_get_product($selected_wheel_id);

        if ($wheel && product_is_wheel($wheel)) {
            $wheel_diameter = get_post_meta($wheel->get_id(), 'diameter', true);

            if ($wheel_diameter) {
                // Get tires where wheel size is equal to the diameter of the selected wheel
                array_push($args['meta_query'], [
                    'key' => 'wheel_size',
                    'value' => $wheel_diameter,
                ]);
            }
        }
    }

    if($is_wheels) {
        $attributes_filter = _product_filter_by_attributes($wheel_attributes, $request);
        $tax_query_args = wp_parse_args($attributes_filter, $tax_query_args);
    } else {
        foreach ($meta_keys as $meta_key) {
            if ($request->has_param($meta_key)) {
                $value = $request[$meta_key];
    
                if ($meta_key === 'color') {
                    // a color may either be stored as a string or a serialized PHP array, depending on whether multiple values were/weren't selected
                    array_push($args['meta_query'], array(
                        'key' => $meta_key,
                        'value' => $value,
                        'compare' => 'LIKE',
                    ));
                } else if ($meta_key === 'bolt_pattern') {
                    // a bolt pattern may either be stored as a string or a serialized PHP array, depending on whether multiple values were/weren't selected
                    // in addition we should cross-search for both the metric, and standard size of the bolt pattern
                    array_push($args['meta_query'], array(
                        'relation' => 'OR',
                        array(
                            'key' => $meta_key,
                            'value' => $value,
                            'compare' => 'LIKE',
                        ),
                        array(
                            'key' => $meta_key,
                            'value' => retrieve_compatible_bolt_pattern_size($value),
                            'compare' => 'LIKE',
                        ),
                    ));
                } else {
                    array_push($args['meta_query'], array(
                        'key' => $meta_key,
                        'value' => $request[$meta_key],
                    ));
                }
            }
        }
    }
    


    $sort_args = _product_sort_query($sort);

    if(empty($sort_args)) {
        // https://wordpress.stackexchange.com/a/285012/189608
        // prioritized_search_result then newest

        $args['meta_query'] = wp_parse_args([
            [
                'relation' => 'OR',
                'priority_sort_order_not_exists' => [
                    'key' => 'prioritized_search_result',
                    'compare' => 'NOT EXISTS',
                ],
                'priority_sort_order' => [
                    'key' => 'prioritized_search_result',
                    'compare' => 'EXISTS',
                ],
            ]
        ], $args['meta_query']);

        $sort_args = [
            'orderby' => [
                'meta_value_num' => 'DESC',
                'date' => 'DESC',
                'id' => 'DESC',
            ],
        ];
    }

    $query_args = array_merge($args, $sort_args);
    $product_query = query_products($per_page, $query_args, $tax_query_args);

    foreach ($product_query->posts as $product) {
        $serialized_product = serialize_product_from_post($product, $add_spare, $selected_wheel_id);
        if (!is_null($serialized_product)) {
            array_push($data['products'], serialize_product_from_post($product, $add_spare, $selected_wheel_id));
        }
    }

    return make_response($data, calculate_pagination($product_query, $page, $per_page));
}


function get_product_slugs($request)
{
    global $wpdb;
    $table_prefix = $wpdb->prefix;
    $data = array();

    $query = "
        SELECT
            DISTINCT post_name AS value
        FROM `" . $table_prefix . "posts`
        WHERE
            post_status = 'publish'
            AND post_type = 'product'
            AND post_name != ''
    ";

    foreach ($wpdb->get_results($query) as $result) {
        array_push($data, $result->value);
    }

    return make_response($data);
}


function get_product_by_slug($request)
{
    // TODO investigate product variation issue
    $product_query = query_products(1, array(
        'name' => $request['slug'],
        'post_type' => array('product', '_product_variation'),
    ));
    $products = $product_query->posts;

    if (empty($products)) {
        return make_response(array(), array(), 404);
    }
    return make_response(serialize_product_from_post(
        $products[0],
        $request['add_spare'],
        $request['selected_wheel'],
        true
    ));
}


function get_product_by_id($request)
{
    $post = get_post($request['id']);
    if (!$post) {
        return make_response(array(), array(), 404);
    }
    return make_response(serialize_product_from_post(
        $post,
        $request['add_spare'],
        $request['selected_wheel'],
        true
    ));
}


function get_wheel_tire_package_add_ons($request)
{
    $data = array();
    $product_query = query_products(-1, array(
        'tax_query' => array(
            array(
                'taxonomy' => 'product_tag',
                'field' => 'slug',
                'terms' => 'wheel-tire-package-add-on',
                'include_children' => false
            ),
        ),
        'post_type' => array('product'),
        'meta_key' => 'wheel_tire_package_add_on_order',
        'orderby' => 'meta_value_num',
        'order' => 'ASC',
    ));

    foreach ($product_query->posts as $product) {
        array_push($data, serialize_product_from_post($product, $request['add_spare']));
    }

    return make_response($data);
}


function get_product_categories($request)
{
    return make_response(_get_product_categories());
}


function get_product_category($request)
{
    $product_cat = _get_product_category_by_slug($request['slug']);
    if (!$product_cat) {
        return make_response(array(), array(), 404);
    }
    return make_response(serialize_category($product_cat));
}


function get_brands_grouped_by_category($query)
{
    global $wpdb;

    $query_result = $wpdb->get_results($query);

    $final_data = array();
    $cat_id_brand_ids_map = array();
    $brand_objects = array();
    $category_objects = array();

    # get unique cat ids
    $unique_cat_ids = array_unique(array_map(function ($result) {
        return $result->category_id;
    }, $query_result));

    # get unique brand ids
    $unique_brand_ids = array_unique(array_map(function ($result) {
        return $result->brand_id;
    }, $query_result));

    # for each cat id, store the brand ids
    foreach ($query_result as $result) {
        $cat_id = $result->category_id;
        $brand_id = $result->brand_id;

        if (key_exists($cat_id, $cat_id_brand_ids_map) && !in_array($brand_id, $cat_id_brand_ids_map[$cat_id])) {
            array_push($cat_id_brand_ids_map[$cat_id], $brand_id);
        } else {
            $cat_id_brand_ids_map[$cat_id] = array($brand_id);
        }
    }

    # Fetch all brands
    $brand_query = query_products(-1, array(
        'post_type' => 'brand',
        'post__in' => $unique_brand_ids,
    ));

    # Fetch all categories
    $cat_terms = get_terms('product_cat', array(
        'include' => $unique_cat_ids
    ));

    # Serialize brand data
    foreach ($brand_query->posts as $brand) {
        $brand_objects[$brand->ID] = serialize_brand($brand);
    }

    # Serialize category data
    foreach ($cat_terms as $cat_term) {
        $category_objects[$cat_term->term_id] = serialize_category($cat_term);
    }

    # Package up response data
    foreach ($unique_cat_ids as $cat_id) {
        $cat_brands = array();

        foreach ($cat_id_brand_ids_map[$cat_id] as $brand_id) {
            array_push($cat_brands, $brand_objects[$brand_id]);
        }

        array_push($final_data, array(
            'category' => $category_objects[$cat_id],
            'brands' => $cat_brands,
        ));
    }

    return $final_data;
}


function get_product_brands_grouped_by_category($request)
{
    global $wpdb;
    $table_prefix = $wpdb->prefix;
    $query = "
        SELECT
            DISTINCT brand.id AS brand_id,
            cat.id AS category_id,
            cat.ordering AS category_order,
            brand.num_of_products AS brand_order
        FROM (
            SELECT
                post_id,
                meta_value AS id,
                COUNT(post_id) OVER (PARTITION BY meta_value) AS num_of_products
            FROM `" . $table_prefix . "postmeta`
            WHERE
                meta_key = 'brand'
                AND meta_value IS NOT NULL
                AND meta_value != '0'
                AND meta_value != ''
        ) brand
        INNER JOIN (
            SELECT
                t.name AS name,
                t.term_id AS id,
                tr.object_id AS post_id,
                tm.meta_value AS ordering
            FROM (
                SELECT
                *
                FROM `" . $table_prefix . "terms`
                WHERE
                name != 'Uncategorized'
        ) t
        INNER JOIN (
            SELECT
                *
            FROM `" . $table_prefix . "term_taxonomy`
            WHERE
                taxonomy = 'product_cat'
                AND parent = '0' -- dont get child categories
                AND count > 0 -- only get categories that have products
        ) tt ON tt.term_id = t.term_id
        INNER JOIN (
            SELECT
                *
            FROM `" . $table_prefix . "termmeta`
            WHERE
                meta_key = 'order'
        ) tm ON tm.term_id = t.term_id
        INNER JOIN `" . $table_prefix . "term_relationships` tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
        ) cat ON cat.post_id = brand.post_id
        ORDER BY
            category_order ASC,
            brand_order DESC
    ";

    return make_response(get_brands_grouped_by_category($query));
}


function get_brands_for_category($request)
{
    global $wpdb;
    $table_prefix = $wpdb->prefix;
    $query = "
        SELECT
            DISTINCT brand.meta_value AS brand_id,
            cat.cat_id AS category_id,
            brand.num_of_products AS brand_order
        FROM (
            SELECT
                post_id,
                meta_value,
                COUNT(post_id) OVER (PARTITION BY meta_value) AS num_of_products
            FROM `" . $table_prefix . "postmeta`
            WHERE
                meta_key = 'brand'
                AND meta_value IS NOT NULL
                AND meta_value != '0'
                AND meta_value != ''
        ) brand
        INNER JOIN (
            SELECT
                t.name AS name,
                t.term_id AS cat_id,
                tr.object_id AS post_id
            FROM (
                SELECT
                    *
                FROM `" . $table_prefix . "terms`
                WHERE
                    name != 'Uncategorized'
                    AND slug = '" . $request['slug'] . "'
        ) t
        INNER JOIN (
            SELECT
                *
            FROM `" . $table_prefix . "term_taxonomy`
            WHERE
                taxonomy = 'product_cat'
                AND parent = '0' -- dont get child categories
                AND count > 0 -- only get categories that have products
        ) tt ON tt.term_id = t.term_id
        INNER JOIN `" . $table_prefix . "term_relationships` tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
        ) cat ON cat.post_id = brand.post_id
        ORDER BY
            brand_order DESC
    ";

    $result = get_brands_grouped_by_category($query);
    if (empty($result)) {
        $data = array(
            'category' => json_encode(array(), JSON_FORCE_OBJECT),
            'brands' => array(),
        );
    } else {
        $data = $result[0];
    }

    return make_response($data);
}


/**
 * Note: _get_product_category_filter_values is not the most efficient SQL query
 * I have yet to figure out a more efficient way to gather all DISTINCT postmeta meta_value values
 * for a given product category
 * 
 * Instead, I am using get/set transient from the WP core as a caching strategy
 * https://developer.wordpress.org/apis/handbook/transients/
 */
function get_product_category_filter_values($request)
{
    $cat_slug = $request['slug'];
    $cache_key = sprintf('%s_filter_values', $cat_slug);
    $data = get_transient($cache_key);

    if ($data === false) {
        $data = array(
            'brands' => get_product_category_brands($cat_slug),
        );

        if ($cat_slug === 'wheels') {
            $data = array_merge($data, array(
                'diameters' => convert_array_to_select_options(get_diameters()),
                'widths' => convert_array_to_select_options(get_widths()),
                'bolt_patterns' => convert_array_to_select_options(get_bolt_patterns()),
                'colors' => convert_array_to_select_options(get_colors()),
                'offsets' => _get_product_category_filter_values($cat_slug, 'offset'),
                'forged' => array(
                    array(
                        'value' => 1,
                        'label' => 'Forged',
                    ),
                    array(
                        'value' => 0,
                        'label' => 'Not Forged',
                    ),
                )
            ));
        } else if ($cat_slug === 'tires') {
            $data = array_merge($data, array(
                'diameters' => convert_array_to_select_options(get_diameters()),
                'heights' => convert_array_to_select_options(get_unique_meta_values('height')),
                'widths' => _get_product_category_filter_values($cat_slug, 'width'),
                'max_pressures' => convert_array_to_select_options(get_unique_meta_values('max_pressure')),
                'max_loads' => convert_array_to_select_options(get_unique_meta_values('max_load')),
                'load_ranges' => convert_array_to_select_options(get_unique_meta_values('load_range')),
            ));
        }

        set_transient($cache_key, $data, MONTH_IN_SECONDS);
    }
    return make_response($data);
}
