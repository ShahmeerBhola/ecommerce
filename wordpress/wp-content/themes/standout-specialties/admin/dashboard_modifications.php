<?php

$sold_in_quantity_field_name = '_wc_sold_in_qty_product';


function taxonomy_checklist_checked_ontop_filter($args)
{
    // By default, in Add/Edit Post, WordPress moves checked categories to the top of the list and unchecked to the bottom.
    // When you have subcategories that you want to keep below their parents at all times, this makes no sense.
    // This function removes automatic reordering so the categories widget retains its order regardless of checked state.
    // https://stackoverflow.com/a/12586404
    $args['checked_ontop'] = false;
    return $args;
}


function remove_unnecessary_menu_items()
{
    // Only show certain menu items in wp-admin https://stackoverflow.com/a/42934247/3902555
    // https://stackoverflow.com/a/9052494/3902555
    global $user_ID;

    remove_menu_page('index.php'); // Dashboard
    remove_menu_page('edit.php'); // Posts
    remove_menu_page('link-manager.php'); // Links
    remove_menu_page('edit.php?post_type=feedback'); // Feedback

    if ($user_ID != 1) {
        remove_menu_page('themes.php'); // Appearance
        remove_menu_page('tools.php'); // Tools
        remove_menu_page('options-general.php'); // Settings
        remove_menu_page('edit.php?post_type=acf-field-group'); // ACF
    }
}


function direct_access_wp_dashboard_redirect()
{
    // https://businessbloomer.com/woocommerce-set-default-dashboard-login-page-to-products/
    wp_redirect(admin_url('admin.php?page=wc-admin'));
}


function login_wp_dashboard_redirect($redirect_to, $request, $user)
{
    // https://businessbloomer.com/woocommerce-set-default-dashboard-login-page-to-products/
    $redirect_to = admin_url('admin.php?page=wc-admin');
    return $redirect_to;
}


function remove_wp_logo($wp_admin_bar)
{
    // Remove WordPress menu from admin bar
    $wp_admin_bar->remove_node('wp-logo');
    $wp_admin_bar->remove_node('view-site');
    $wp_admin_bar->remove_menu('comments');
}


function remove_unnecessary_product_options($options)
{
    if (isset($options['virtual'])) {
        unset($options['virtual']);
    }
    if (isset($options['downloadable'])) {
        unset($options['downloadable']);
    }
    return $options;
}


function remove_unnecessary_product_types($types)
{
    unset($types['grouped']);
    unset($types['external']);
    return $types;
}


function wp_admin_css_modifications()
{
    // Hide 'Screen Options' & 'Help' dropdowns in wp-admin nav bar
    // Hide the 'Downloadable product permissions section on order page
    // Hide a small border that was showing up on product page

    echo "
    <style type='text/css'>
        #woocommerce-product-data .hndle label:first-child{
            border-right: 0;
        }
        #woocommerce-order-downloads {
            display: none;
        }
        .woocommerce-embed-page .wrap {
            padding: 0px 20px 0;
        }
        #woo-mp .woo-mp-rating-request {
            display: none !important;
        }
    </style>
    ";
}


function hide_woocommerce_menus()
{
    // https://plugintests.com/plugins/woocommerce/tips

    // Hide Analytics → Downloads.
    remove_submenu_page('wc-admin&path=/analytics/revenue', 'wc-admin&path=/analytics/downloads');
}


function hide_certain_product_type_filters($filters)
{
    // https://rudrastyh.com/woocommerce/remove-virtual-and-downloadable.html
    // On Products page, modify the options available in the product type filter select

    function product_type_filter_callback()
    {
        $current_product_type = isset($_REQUEST['product_type']) ? wc_clean(wp_unslash($_REQUEST['product_type'])) : false;
        $output               = '<select name="product_type" id="dropdown_product_type"><option value="">Filter by product type</option>';

        foreach (wc_get_product_types() as $value => $label) {
            $output .= '<option value="' . esc_attr($value) . '" ';
            $output .= selected($value, $current_product_type, false);
            $output .= '>' . esc_html($label) . '</option>';
        }

        $output .= '</select>';
        echo $output;
    }

    if (isset($filters['product_type'])) {
        $filters['product_type'] = 'product_type_filter_callback';
    }
    return $filters;
}


function modify_wp_login_logo()
{
?>
    <style type="text/css">
        body.login div#login h1 a {
            background-image: url(https://storage.googleapis.com/standout-specialties-public-assets/logo.png);
            background-size: contain;
            width: 150px;
        }
    </style>
<?php
}


function add_quantity_sold_in_product_field()
{
    // https://gist.github.com/igorbenic/1106ccf44c1061d80c2738bcbe09181d
    global $sold_in_quantity_field_name;

    echo '<div class="options_group">';
    woocommerce_wp_text_input(
        array(
            'id' => $sold_in_quantity_field_name,
            'label' => 'Quantity Sold In',
            'placeholder' => '1',
            'desc_tip' => 'true',
            'description' => 'Optional. Set the quantity that this product is sold in. Enter a number, 1 or greater.',
        )
    );
    echo '</div>';
}


function save_quantity_sold_in_custom_field($post_id)
{
    // https://gist.github.com/igorbenic/1106ccf44c1061d80c2738bcbe09181d
    global $sold_in_quantity_field_name;

    $custom_field_value = isset($_POST[$sold_in_quantity_field_name]) ? $_POST[$sold_in_quantity_field_name] : '';

    $product = wc_get_product($post_id);
    $product->update_meta_data($sold_in_quantity_field_name, $custom_field_value);
    $product->save();
}


function service_product_type_admin_custom_js()
{

    if ('product' != get_post_type()) :
        return;
    endif;
?>
    <script type='text/javascript'>
        jQuery(document).ready(function() {
            jQuery('.product_data_tabs .general_options').addClass('show_if_service');
            jQuery('#general_product_data').removeClass('hidden');
            jQuery('#general_product_data .pricing').addClass('show_if_service');
            jQuery('#general_product_data .pricing').addClass('show_if_service');
            jQuery('.general_options .general_tab').addClass('active');
            jQuery('.product_data_tabs .shipping_options').addClass('hide_if_service');
            jQuery('.product_data_tabs .linked_product_options').addClass('hide_if_service');
            jQuery('.product_data_tabs .attribute_options').addClass('hide_if_service');
            jQuery('.product_data_tabs .advanced_options').addClass('hide_if_service');
        });
    </script>
<?php
}

function _build_html_select_tag($name, $id, $empty_label, $options)
{
    $output = "<select name='" . $name . "' id='" . $id . "'>";
    $output .= '<option value="">' . $empty_label . '</option>';

    foreach ($options as $value => $label) {
        $output .= "<option value='" . $value . "' ";
        if (isset($_GET[$name])) {
            $output .= selected($value, $_GET[$name], false);
        }
        $output .= ">" . $label . "</option>";
    }

    $output .= "</select>";

    echo $output;
}


function product_admin_filters()
{
    // https://github.com/woocommerce/woocommerce/issues/14883#issuecomment-369270190
    global $typenow, $wpdb;
    $table_prefix = $wpdb->prefix;

    if ($typenow == 'product') {
        // Prioritized Search Result
        _build_html_select_tag(
            'prioritized_result_status',
            'dropdown_prioritized_result_status',
            'Filter by Search Priority',
            array(
                'prioritized' => 'Prioritized Results',
            ),
        );

        // Featured/ Not Featured
        _build_html_select_tag(
            'featured_status',
            'dropdown_featured_status',
            'Filter by Featured Status',
            array(
                'featured' => 'Featured',
            ),
        );

        // Brands
        $brand_id_title_mapping = array();

        $query = "
            SELECT
                DISTINCT brand.meta_value AS id,
                p.post_title AS name,
                brand.num_of_products AS num_of_products
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
            INNER JOIN `" . $table_prefix . "posts` p ON p.id = brand.meta_value
            ORDER BY
                num_of_products DESC
        ";

        $query_result = $wpdb->get_results($query);

        foreach ($query_result as $result) {
            $brand_id_title_mapping[$result->id] = sprintf("%s (%s)", $result->name, number_format($result->num_of_products));
        }

        _build_html_select_tag(
            'product_brand',
            'dropdown_brand',
            'Show All Brands',
            $brand_id_title_mapping,
        );
    }
}


function products_admin_filter_query($query)
{
    // https://github.com/woocommerce/woocommerce/issues/14883#issuecomment-369270190
    global $typenow;

    if ($typenow == 'product') {
        $featured_status_name = 'featured_status';
        $prioritized_result_name = 'prioritized_result_status';
        $brand_name = 'product_brand';

        // Featured product status
        if (!empty($_GET[$featured_status_name])) {
            if ($_GET[$featured_status_name] == 'featured') {
                $query->query_vars['tax_query'][] = array(
                    'taxonomy' => 'product_visibility',
                    'field' => 'slug',
                    'terms' => 'featured',
                );
            }
        }

        // Prioritized Search Result
        if (!empty($_GET[$prioritized_result_name])) {
            if ($_GET[$prioritized_result_name] == 'prioritized') {
                $meta_query = array(
                    'relation' => 'AND',
                    array(
                        'key' => 'prioritized_search_result',
                        'value' => '1',
                    ),
                );

                if (!empty($query->query_vars['meta_query'])) {
                    $meta_query = array_merge($query->query_vars['meta_query'], $meta_query);
                }

                $query->set('meta_query', $meta_query);
            }
        }

        // Brand
        if (!empty($_GET[$brand_name])) {
            $meta_query = array(
                'relation' => 'AND',
                array(
                    'key' => 'brand',
                    'value' => $_GET[$brand_name],
                ),
            );

            if (!empty($query->query_vars['meta_query'])) {
                $meta_query = array_merge($query->query_vars['meta_query'], $meta_query);
            }

            $query->set('meta_query', $meta_query);
        }
    }
    return $query;
}


add_action('restrict_manage_posts', 'product_admin_filters');
add_action('pre_get_posts', 'products_admin_filter_query');
add_filter('wp_terms_checklist_args', 'taxonomy_checklist_checked_ontop_filter');
add_action('admin_menu', 'remove_unnecessary_menu_items');
add_action('load-index.php', 'direct_access_wp_dashboard_redirect');
add_action('admin_bar_menu', 'remove_wp_logo', 999);
add_filter('login_redirect', 'login_wp_dashboard_redirect', 9999, 3);
add_filter('admin_footer_text', '__return_empty_string', 11);
add_filter('update_footer', '__return_empty_string', 11);
add_filter('product_type_options', 'remove_unnecessary_product_options');
add_filter('product_type_selector', 'remove_unnecessary_product_types');
add_action('admin_head', 'wp_admin_css_modifications');
add_action('admin_menu', 'hide_woocommerce_menus', 71);
add_filter('woocommerce_products_admin_list_table_filters', 'hide_certain_product_type_filters');
add_action('login_enqueue_scripts', 'modify_wp_login_logo');
add_action('woocommerce_product_options_inventory_product_data', 'add_quantity_sold_in_product_field');
add_action('woocommerce_process_product_meta', 'save_quantity_sold_in_custom_field');
add_action('admin_footer', 'service_product_type_admin_custom_js'); // https://stackoverflow.com/a/43132481/3902555
