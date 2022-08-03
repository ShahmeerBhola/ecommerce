<?php

/**
 * Allow to remove method for an hook when, it's a class method used and class don't have variable, but you know the class name :)
 */
function remove_filters_for_anonymous_class($hook_name = '', $class_name = '', $method_name = '', $priority = 0)
{
    global $wp_filter;
    // Take only filters on right hook name and priority
    if (!isset($wp_filter[$hook_name][$priority]) || !is_array($wp_filter[$hook_name][$priority]))
        return false;

    // Loop on filters registered
    foreach ((array) $wp_filter[$hook_name][$priority] as $unique_id => $filter_array) {
        // Test if filter is an array ! (always for class/method)
        if (isset($filter_array['function']) && is_array($filter_array['function'])) {
            // Test if object is a class, class and method is equal to param !
            if (is_object($filter_array['function'][0]) && get_class($filter_array['function'][0]) && get_class($filter_array['function'][0]) == $class_name && $filter_array['function'][1] == $method_name) {
                unset($wp_filter[$hook_name][$priority][$unique_id]);
            }
        }
    }

    return false;
}


/**
 * A drop in replacement of WC_Admin_Post_Types::product_search()
 */
function product_search_sku($where)
{
    global $pagenow, $wpdb;

    $table_prefix = $wpdb->prefix;
    $post_type = key_exists('post_type', $_GET) ? $_GET['post_type'] : null;
    $search_term = key_exists('s', $_GET) ? strtolower($_GET['s']) : null;

    if ((is_admin() && 'edit.php' != $pagenow)
        || !$search_term
        //post_types can also be arrays..
        || ('product' != $post_type)
        || (is_array($post_type) && !in_array('product', $post_type))
    ) {
        return $where;
    }

    $search_ids = array();
    $terms = explode(',', $search_term);

    foreach ($terms as $term) {
        $term = trim($term);

        //Include the search by id if admin area.
        if (is_admin() && is_numeric($term)) {
            $search_ids[] = $term;
        }

        // search for variations with a matching sku and return the parent.
        $sku_to_parent_id = $wpdb->get_col("
            SELECT
                p.id AS post_id
            FROM `" . $table_prefix . "posts` p
            JOIN `" . $table_prefix . "postmeta` pm
                ON p.ID = pm.post_id
                AND pm.meta_key='_sku'
                AND LOWER(pm.meta_value) LIKE '%" . $search_term . "%'
            WHERE
                p.post_parent != 0
        ");

        //Search for a regular product that matches the sku.
        $sku_to_id = $wpdb->get_col("
            SELECT
                post_id
            FROM `" . $table_prefix . "postmeta`
            WHERE
                meta_key='_sku'
                AND LOWER(meta_value) LIKE '%" . $search_term . "%'
        ");

        $search_ids = array_merge($search_ids, $sku_to_id, $sku_to_parent_id);
    }

    $search_ids = array_unique(array_filter(array_map('absint', $search_ids)));

    if (sizeof($search_ids) > 0) {
        $where = str_replace('))', ") OR ({$wpdb->posts}.ID IN (" . implode(',', $search_ids) . ")))", $where);
    }

    remove_filters_for_anonymous_class(
        'posts_search',
        'WC_Admin_Post_Types',
        'product_search',
        10
    );

    return $where;
}


add_filter('posts_search', 'product_search_sku', 9, 1);
