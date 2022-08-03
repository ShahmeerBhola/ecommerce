<?php


require_once(__DIR__ . '/pricing.php');
require_once(__DIR__ . '/../shipping.php');
require_once(WP_PLUGIN_DIR . '/sendgrid-email-delivery-simplified/lib/class-sendgrid-nlvx.php');

function sos_debug()
{
    return defined('WP_DEBUG') && WP_DEBUG;
}

function calculate_pagination($wp_query, $page, $per_page)
{
    if ($wp_query === null) {
        $totals = array(
            'total' => 0,
            'total_pages' => 0,
        );
    } else {
        $totals = array(
            'total' => (int) $wp_query->found_posts,
            'total_pages' => (int) $wp_query->max_num_pages,
        );
    }

    return array_merge($totals, array(
        'page' => (int) $page,
        'per_page' => (int) $per_page,
    ));
}


function calculate_empty_pagination($page, $per_page)
{
    return calculate_pagination(null, $page, $per_page);
}


function determine_discounts($wheel_tire_packages, $shipping_method_id)
{
    $discounts = array();
    $is_local_pickup = $shipping_method_id === 'local-pickup';

    if (order_has_wheel_and_tire($wheel_tire_packages) and $is_local_pickup) {
        array_push($discounts, array(
            'name' => 'Wheel & Tire Local Pickup Discount',
            'amount' => 100,
            'tax' => 0,
        ));
    }
    return $discounts;
}


function make_response($data = array(), $pagination = array(), $status_code = 200)
{
    $result = new WP_REST_Response(array(
        'data' => $data,
        'pagination' => $pagination,
    ), $status_code);

    if(!sos_debug()) {
        $result->set_headers(['Cache-Control' => 'max-age=3600']);
    }

    return $result;
}


function _get_product_category_by_id($id)
{
    return get_term_by('id', $id, 'product_cat');
}


function _get_product_category_by_slug($slug)
{
    return get_term_by('slug', $slug, 'product_cat');
}


function _get_uncategorized_product_category()
{
    return _get_product_category_by_slug('uncategorized');
}


function _get_post_title_from_id($id)
{
    return get_post_field('post_title', $id);
}


function _get_post_from_title($title, $post_type)
{
    return get_page_by_title($title, 'OBJECT', $post_type);
}


function _get_post_from_id($id)
{
    return get_post($id, 'OBJECT');
}


function get_post_id_from_title($title, $post_type)
{
    $post = _get_post_from_title($title, $post_type);
    if (!$post) {
        return null;
    }
    return $post->ID;
}


function _get_post_id_from_slug($slug, $post_type)
{
    $post = get_page_by_path($slug, 'OBJECT', $post_type);
    if (!$post) {
        return null;
    }
    return $post->ID;
}


function _is_child_term($term, $taxonomy)
{
    $check = get_ancestors($term->term_id, $taxonomy);
    if (!empty($check)) {
        return true;
    }
    return false;
}


function _get_shipping_method_by_id($shipping_method_id)
{
    foreach (WC()->shipping->get_shipping_methods() as $shipping_method) {
        if ($shipping_method->id === $shipping_method_id) {
            return $shipping_method;
        }
    }
    return null;
}


function get_all_published_posts_by_type($post_type, $other_args = [])
{
    $default_args = [
        'post_type' => $post_type,
        'post_status' => 'publish',
        'posts_per_page' => -1
    ];
    $query_args = array_merge($default_args, $other_args);

    return new WP_Query($query_args);
}


function query_products($posts_per_page = 1, $other_args = [], $tax_query_args = [])
{
    $query_visible_products = [[
        'taxonomy' => 'product_visibility',
        'field' => 'name',
        'terms' => [
            'exclude-from-catalog',
            'exclude-from-search'
        ],
        'operator' => 'NOT IN',
    ]];

    $tax_query_args = wp_parse_args($query_visible_products, $tax_query_args);

    $args = array_merge([
        'posts_per_page' => $posts_per_page,
        'tax_query' => $tax_query_args,
    ], $other_args);

    return get_all_published_posts_by_type('product', $args);
}


function billing_state_is_pennsylvania($billing_state)
{
    return strtoupper($billing_state) === 'PA';
}


function product_is_variable($product)
{
    return $product->is_type('variable');
}


function product_is_variant($product)
{
    return $product->get_parent_id() !== 0;
}


function _product_has_category($product, $category_names)
{
    $product_with_cats = product_is_variant($product) ? wc_get_product($product->get_parent_id()) : $product;
    foreach ($product_with_cats->get_category_ids() as $category_id) {
        $category = _get_product_category_by_id($category_id);
        if ($category && in_array($category->slug, $category_names)) {
            return true;
        }
    }
    return false;
}


function product_is_wheel($product)
{
    return _product_has_category($product, array('wheels'));
}


function product_is_tire($product)
{
    return _product_has_category($product, array('tires'));
}


function product_is_suspension($product)
{
    return _product_has_category($product, array('suspension'));
}


function product_is_apparel($product)
{
    return _product_has_category($product, array('apparel'));
}


function product_is_taxable_apparel($product)
{
    return !_product_has_category($product, array('hats', 'hoodie', 'shirt'));
}


function order_has_wheel_and_tire($wheel_tire_packages)
{
    return !empty($wheel_tire_packages);
}


function subscribe_email_to_newsletter($email)
{
    $sendgrid_client = new Sendgrid_NLVX();
    $response = $sendgrid_client->add_recipient($email); // string if successful otherwise false
    return is_string($response);
}


function _render_email_template($template_filename, $variables)
{
    // https://stackoverflow.com/a/17274461/3902555
    $template = file_get_contents(__DIR__ . '/email_templates/' . $template_filename);
    foreach ($variables as $key => $value) {
        $template = str_replace('{{ ' . $key . ' }}', $value, $template);
    }
    return $template;
}


function send_email($to_emails, $subject, $template_filename, $variables)
{
    // https://sendgrid.com/docs/for-developers/sending-email/v2-php-code-example/#using-sendgrids-php-library
    $html_template = _render_email_template($template_filename, $variables);

    $sendgrid = new Sendgrid_API("apikey", SENDGRID_API_KEY);

    $email = new SendGrid\Email();
    $email->setTos($to_emails);
    $email->setSubject($subject);
    $email->setHtml($html_template);
    $email->setFrom(SENDGRID_FROM_EMAIL);
    $email->setFromName(SENDGRID_FROM_NAME);

    return $sendgrid->send($email);
}


function _get_product_categories()
{
    $data = [];
    $taxonomy = 'product_cat';

    $categories = get_terms([
        'taxonomy' => $taxonomy,
        'hide_empty' => false,
        'hierarchical' => false,
    ]);

    foreach ($categories as $cat) {
        $category = serialize_category_from_id($cat->term_id);
        if ($category && !_is_child_term($cat, $taxonomy)) {
            array_push($data, $category);
        }
    }

    usort($data, function ($a, $b) {
        return $a['menu_order'] > $b['menu_order'];
    });

    return $data;
}


function _get_featured_products()
{
    $data = [];

    $product_query = query_products(20, [], [
        'relation' => 'AND',
        [
            'taxonomy' => 'product_type',
            'field' => 'name',
            'terms' => 'service',
            'operator' => 'NOT IN',
        ],
        [
            'taxonomy' => 'product_visibility',
            'field'    => 'name',
            'terms'    => 'featured',
            'operator' => 'IN',
        ]
    ]);

    foreach ($product_query->posts as $product) {
        try {
            array_push($data, serialize_product_from_post($product));
        } catch (Exception $e) {
            error_log("Caught exception: " .  $e->getMessage() . "\n");
        }
    }

    return $data;
}


function _get_truck_years()
{
    global $wpdb;

    $data = [];
    $query = "
        SELECT
            DISTINCT year AS value
        FROM trucks
        ORDER BY
            year DESC
    ";

    foreach ($wpdb->get_results($query) as $result) {
        array_push($data, $result->value);
    }

    return $data;
}

function serialize_image_from_image_id($image_id, $full_size = false)
{
    $attachment_post = get_post($image_id);
    if (is_null($attachment_post)) {
        return null;
    }

    $attachment = wp_get_attachment_image_src($image_id, $full_size ? 'full' : 'medium_large');
    if (!is_array($attachment)) {
        return null;
    }

    return array(
        'id' => (int) $image_id,
        'src' => current($attachment),
        'name' => get_the_title($image_id),
        'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
    );
}


function serialize_category($category)
{
    if (!$category or $category->slug === 'uncategorized') {
        return null;
    }

    $category_id = (int) $category->term_id;
    $category_thumbnail_id = get_term_meta($category_id, 'thumbnail_id', true);

    return array(
        'id' => $category_id,
        'name' => $category->name,
        'slug' => $category->slug,
        'description' => $category->description,
        'image' => serialize_image_from_image_id($category_thumbnail_id, true),
        'menu_order' => (int) get_term_meta($category_id, 'order', true),
        'count' => (int) $category->count,
    );
}


function serialize_category_from_id($category_id)
{
    return serialize_category(_get_product_category_by_id($category_id));
}


function serialize_brand($brand)
{
    if (!$brand) {
        return null;
    }

    $brand_id = $brand->ID;
    return array(
        'id' => $brand_id,
        'name' => $brand->post_title,
        'description' => $brand->post_content,
        'slug' => $brand->post_name,
        'lead_time' => get_post_meta($brand_id, 'lead_time', true),
        'image' => serialize_image_from_image_id(get_post_thumbnail_id($brand_id)),
    );
}


function serialize_faq($faq)
{
    if (!$faq) {
        return null;
    }

    return array(
        'question' => $faq->post_title,
        'answer' => $faq->post_content,
    );
}


function serialize_brand_ambassador($brand_ambassador)
{
    if (!$brand_ambassador) {
        return null;
    }

    return array(
        'name' => $brand_ambassador->post_title,
    );
}


function serialize_brand_from_brand_id($brand_id)
{
    return serialize_brand(_get_post_from_id($brand_id));
}


function _serialize_product_metadata($product)
{
    $product_id = $product->get_id();
    $meta_map = array();
    $metadata = array();

    if (product_is_wheel($product)) {
        $meta_map = array(
            'Diameter' => 'diameter',
            'Bolt Pattern' => 'bolt_pattern',
            'Style' => 'style',
            'Structure' => 'structure',
            'Offset' => 'offset',
            'Number of Spokes' => 'number_of_spokes',
            'Model' => 'model',
            'Model (Other)' => 'model_other',
            'Exposed Lugs' => 'exposed_lugs',
            'Color' => 'color',
            'Center Bore' => 'center_bore',
            'Backspacing' => 'backspacing',
            'Year Introduced' => 'year_introduced',
            'Width' => 'width',
            'Material' => 'material',
            'Load Rating' => 'load_rating',
        );
    } elseif (product_is_tire($product)) {
        $meta_map = array(
            'Wheel Size' => 'wheel_size',
            'Height' => 'height',
            'Width' => 'width',
            'Max Pressure' => 'max_pressure',
            'Max Load' => 'max_load',
            'Load Range' => 'load_range',
        );
    } elseif (product_is_suspension($product)) {
        $meta_map = array(
            'Lift Size' => 'lift_size',
            'Vehicle Year' => 'vehicle_year',
            'Vehicle Make' => 'vehicle_make',
            'Vehicle Drive' => 'vehicle_drive',
        );
    }

    foreach ($meta_map as $key => $value) {
        $meta_value = get_post_meta($product_id, $value, true);

        if ($meta_value) {
            if (is_array($meta_value)) {
                $meta_value = implode(", ", $meta_value);
            }

            $metadata[$key] = $meta_value;
        }
    }

    return $metadata;
}


function _serialize_product_variation($variation, $add_spare, $selected_wheel_id, $full_size_image)
{
    $attributes = array();
    
    foreach ($variation['attributes'] as $key => $value) {
        $attributes[str_replace('attribute_', '', $key)] = $value;
    }

    $product_data = _serialize_product(wc_get_product(
        $variation['variation_id']
    ), $add_spare, $selected_wheel_id, $full_size_image);
    $product_data['attributes'] = $attributes;

    unset($product_data['_attributes']);
    unset($product_data['default_attributes']);

    return $product_data;
}


function _serialize_product($product, $add_spare = false, $selected_wheel_id = null, $full_size_image = false)
{
    if (!is_object($product)) {
        return;
    }
    $product_id = $product->get_id();
    $product_data = $product->get_data();

    $categories = array();
    $variations = array();
    $default_attributes = array();
    $product_attributes = array();

    if (product_is_variable($product)) {
        foreach ($product->get_available_variations() as $variation) {
            array_push($variations, _serialize_product_variation(
                $variation,
                $add_spare,
                $selected_wheel_id,
                $full_size_image
            ));

        }

        foreach ($product->get_variation_attributes() as $key => $attributes) {
            $id = strtolower(str_replace(' ', '-', $key));
            array_multisort($attributes, SORT_ASC);

            $product_attributes[$id] = array(
                'title' => wc_attribute_label($key),
                'options' => $attributes
            );
        }

        $default_attributes = $product->get_default_attributes();
    }

    if (product_is_variant($product)) {
        $category_ids = wc_get_product($product->get_parent_id())->get_category_ids();
    } else {
        $category_ids = $product->get_category_ids();
    }

    foreach ($category_ids as $category_id) {
        $category = serialize_category_from_id($category_id);
        if ($category) {
            array_push($categories, $category);
        }
    }

    $gallery_images = array();
    foreach ($product->get_gallery_image_ids() as $attachment_id) {
        array_push($gallery_images, serialize_image_from_image_id($attachment_id, $full_size_image));
    }

    $quantity_sold_in = get_quantity_sold_in($product);

    return array(
        'id' => $product_id,
        'name' => $product_data['name'],
        'slug' => $product_data['slug'],
        'description' => $product_data['description'],
        'sku' => get_product_sku($product),
        'price' => (float)get_product_regular_price($product, $add_spare, $quantity_sold_in),
        'sale_price' => (float)calculate_product_sale_price($product, $add_spare, $selected_wheel_id),
        'total_sales' => (int)$product_data['total_sales'],
        'quantity_sold_in' => $quantity_sold_in,
        'sold_as_truck_set' => (bool)get_field('field_5f873fb676100', $product_id),
        'is_purchasable' => product_is_purchasable($product),
        'truck_info_required_for_purchase' => (bool)get_field('field_5f85b3ec7c853', $product_id),
        'categories' => $categories,
        'featured_image' => serialize_image_from_image_id($product->get_image_id(), $full_size_image),
        'gallery_images' => $gallery_images,
        'brand' => serialize_brand(get_field('brand', $product_id)),
        'metadata' => _serialize_product_metadata($product),
        'variations' => $variations,
        'default_attributes' => $default_attributes,
        '_attributes' => $product_attributes
    );
}


function serialize_product_from_post($post, $add_spare = false, $selected_wheel_id = null, $full_size_image = false)
{
    $post_id = $post->ID;
    $product = wc_get_product($post_id);

    // wc_get_product can return false, not sure why
    if (!is_object($product)) {
        return;
    }

    return _serialize_product($product, $add_spare, $selected_wheel_id, $full_size_image);
}


function get_brand_from_product_id($product_id)
{
    return get_post_meta($product_id, 'brand', true);
}


function get_brand_wheel_markup($brand_id)
{
    return (float) get_post_meta($brand_id, 'wheel_package_desired_markup_margin', true);
}


function get_wheel_product_brand_desired_margin_markup($product_id)
{
    $brand_id = get_brand_from_product_id($product_id);
    if (!$brand_id) {
        return null;
    }
    return get_brand_wheel_markup($brand_id);
}


function get_quantity_sold_in($product)
{
    $quantity_sold_in = get_post_meta(get_product_id($product), '_wc_sold_in_qty_product', true);
    if (!$quantity_sold_in) {
        $quantity_sold_in = 1;
    }
    return (int) $quantity_sold_in;
}


function get_product_sku($product)
{
    $product_data = $product->get_data();
    return $product_data['sku'];
}


function get_product_name($product)
{
    $product_data = $product->get_data();
    return $product_data['name'];
}


function get_product_id($product)
{
    return $product->get_id();
}



function product_is_purchasable($product)
{
    if ($product->get_manage_stock() && $product->backorders_allowed()) {
        return true;
    }
    return $product->is_in_stock() && !$product->is_on_backorder();
}


function construct_product_name_sku_string($product)
{
    return sprintf("%s (%s)", get_product_name($product), get_product_sku($product));
}


function construct_truck_name($truck)
{
    return sprintf(
        "%s %s %s %s",
        $truck['year'],
        $truck['make'],
        $truck['model'],
        $truck['trim'],
    );
}


function _get_states_for_country($country)
{
    $country_code = strtoupper($country);
    $disallowed_states = get_disallowed_us_shipping_states();

    $wc_countries = new WC_Countries();
    $states = $wc_countries->get_states($country_code);

    if ($country_code === 'US') {
        foreach ($states as $code => $state) {
            if (in_array($code, $disallowed_states)) {
                unset($states[$code]);
            }
        }
    }

    return $states;
}


function retrieve_compatible_bolt_pattern_size($bolt_pattern)
{
    $bolt_pattern_conversions = array(
        '5x4.5' => '5x114.3',
        '5x5' => '5x127',
        '5x5.31' => '5x135',
        '5x5.5' => '5x139.7',
        '5x5.91' => '5x150',
        '6x4.5' => '6x114.3',
        '6x5.31' => '6x135',
        '6x5.5' => '6x139.7',
        '8x6.5' => '8x165.1',
        '8x6.69' => '8x170',
        '8x7.09' => '8x180',
        '8x7.87' => '8x200',
        '8x8.27' => '8x210',
        '5x114.3' => '5x4.5',
        '5x127' => '5x5',
        '5x135' => '5x5.31',
        '5x139.7' => '5x5.5',
        '5x150' => '5x5.91',
        '6x114.3' => '6x4.5',
        '6x135' => '6x5.31',
        '6x139.7' => '6x5.5',
        '8x165.1' => '8x6.5',
        '8x170' => '8x6.69',
        '8x180' => '8x7.09',
        '8x200' => '8x7.87',
        '8x210' => '8x8.27',
    );
    if (array_key_exists($bolt_pattern, $bolt_pattern_conversions)) {
        return $bolt_pattern_conversions[$bolt_pattern];
    }
    return null;
}


function get_brand_ambassadors()
{
    $data = array();
    foreach (get_all_published_posts_by_type('brand-ambassador')->posts as $brand_ambassador) {
        array_push($data, serialize_brand_ambassador($brand_ambassador));
    }
    return $data;
}


function get_diameters()
{
    $data = get_field_object('field_5ee1668bfa01a')['choices'];
    natcasesort($data);
    return array_values($data);
}


function get_widths()
{
    $data = get_field_object('field_5ee166ecfa01b')['choices'];
    natcasesort($data);
    return array_values($data);
}


function get_bolt_patterns()
{
    $data = get_field_object('field_5ee1673bfa01c')['choices'];
    natcasesort($data);
    return array_values($data);
}


function get_colors()
{
    $data = get_field_object('field_5efa1c2718dd6')['choices'];
    natcasesort($data);
    return array_values($data);
}


function convert_array_to_select_options($values)
{
    $data = array();
    foreach ($values as $value) {
        array_push($data, array(
            'value' => $value,
            'label' => $value,
        ));
    }
    return $data;
}


function _get_product_category_filter_values($category_slug, $key)
{
    global $wpdb;

    $data = array();
    $table_prefix = $wpdb->prefix;

    if ($key === 'brand') {
        $query = "
            SELECT
                d.slug AS value,
                d.name AS label
            FROM (
                SELECT
                    DISTINCT brand.name, brand.slug
                FROM (
                    SELECT
                        *
                    FROM `" . $table_prefix . "postmeta`
                    WHERE
                        meta_key = '" . $key . "'
                ) pm
                INNER JOIN (
                    SELECT
                        ID as id
                    FROM `" . $table_prefix . "posts`
                    WHERE
                        post_type = 'product'
                        AND post_status = 'publish'
                ) p ON p.id = pm.post_id
                INNER JOIN (
                    SELECT
                        object_id,
                        term_taxonomy_id
                    FROM `" . $table_prefix . "term_relationships`
                ) tr ON tr.object_id = p.id
                INNER JOIN (
                    SELECT
                        term_taxonomy_id AS id,
                        term_id
                    FROM `" . $table_prefix . "term_taxonomy`
                    WHERE
                        taxonomy = 'product_cat'
                ) tt ON tt.id = tr.term_taxonomy_id
                INNER JOIN (
                    SELECT
                        term_id AS id
                    FROM `" . $table_prefix . "terms`
                    WHERE
                        slug = '" . $category_slug . "'
                ) t ON t.id = tt.term_id
                INNER JOIN (
                    SELECT
                        ID as id,
                        post_title AS name,
                        post_name AS slug
                    FROM `" . $table_prefix . "posts`
                    WHERE
                        post_type = 'brand'
                        AND post_status = 'publish'
                ) brand ON brand.id = pm.meta_value
            ) d
            WHERE
                TRIM(d.slug) != ''
            ORDER BY
                label ASC
        ";
    } else {
        $query = "
            SELECT
                d.value AS value,
                d.value AS label
            FROM (
                SELECT
                    DISTINCT pm.meta_value AS value
                FROM (
                    SELECT
                        *
                    FROM `" . $table_prefix . "postmeta`
                    WHERE
                        meta_key = '" . $key . "'
                ) pm
                INNER JOIN (
                    SELECT
                        ID as id
                    FROM `" . $table_prefix . "posts`
                    WHERE
                        post_type = 'product'
                        AND post_status = 'publish'
                ) p ON p.id = pm.post_id
                INNER JOIN (
                    SELECT
                        object_id,
                        term_taxonomy_id
                    FROM `" . $table_prefix . "term_relationships`
                ) tr ON tr.object_id = p.id
                INNER JOIN (
                    SELECT
                        term_taxonomy_id AS id,
                        term_id
                    FROM `" . $table_prefix . "term_taxonomy`
                    WHERE
                        taxonomy = 'product_cat'
                ) tt ON tt.id = tr.term_taxonomy_id
                INNER JOIN (
                    SELECT
                        term_id AS id
                    FROM `" . $table_prefix . "terms`
                    WHERE
                        slug = '" . $category_slug . "'
                ) t ON t.id = tt.term_id
            ) d
            WHERE
                TRIM(d.value) != ''
            ORDER BY
                label ASC
        ";
    }

    foreach ($wpdb->get_results($query) as $result) {
        array_push($data, array(
            'value' => $result->value,
            'label' => $result->label,
        ));
    }

    usort($data, function ($a, $b) {
        return strnatcasecmp($a['label'], $b['label']);
    });

    return $data;
}


function get_unique_meta_values($key)
{
    global $wpdb;

    $data = array();
    $table_prefix = $wpdb->prefix;
    $query = "
        SELECT
            DISTINCT pm.meta_value AS value
        FROM `" . $table_prefix . "postmeta` pm
        INNER JOIN `" . $table_prefix . "posts` p
            ON p.id = pm.post_id
            AND p.post_type = 'product'
            AND p.post_status = 'publish'
        WHERE
            pm.meta_key = '" . $key . "'
    ";

    foreach ($wpdb->get_results($query) as $result) {
        array_push($data, $result->value);
    }

    natcasesort($data);
    return array_values($data);
}


function get_product_category_brands($cat_slug)
{
    $cache_key = sprintf('%s_category_brands', $cat_slug);
    $data = get_transient($cache_key);

    if ($data === false) {
        $data = _get_product_category_filter_values($cat_slug, 'brand');
        set_transient($cache_key, $data, MONTH_IN_SECONDS);
    }
    return $data;
}

function _get_truck_bolt($year, $make, $model, $trim)
{
    global $wpdb;

    $query = "
        SELECT
            DISTINCT bolt_pattern AS value
        FROM trucks
        WHERE
            year = '" . $year . "'
            AND make = '" . $make . "'
            AND model = '" . $model . "'
            AND trim = '" . $trim . "'
        ORDER BY
            model ASC
    ";

    $result = $wpdb->get_results($query);

    return !empty($result) && is_array($result) ? $result[0]->value : '';
}

// Product Filters
function _product_filter_by_bolt_pattern($bolt_pattern)
{
    $cross_compatible_bolt_pattern = retrieve_compatible_bolt_pattern_size($bolt_pattern);

    $bolt_patterns_ids = get_terms([
        'name__like' => $bolt_pattern,
        'fields' => 'ids'
    ]);

    return [[
        "relation" => "OR",
        [
            'taxonomy' => 'pa_bolt_pattern',
            'field' => 'id',
            'terms' => $bolt_patterns_ids,
        ],
        [
            'taxonomy' => 'pa_bolt_pattern',
            'field' => 'slug',
            'terms' => [$bolt_pattern, $cross_compatible_bolt_pattern],
        ],
    ]];
}

function _product_filter_by_category($category_slug)
{
    return [[
        'taxonomy' => 'product_cat',
        'field' => 'slug',
        'terms' => [$category_slug],
    ]];
}

function _product_filter_by_attributes($attributes, $request)
{
    $filter_query = [];

    foreach ($attributes as $key) {
        $value = $request[$key];

        if(!empty($value)) {
            $filter_query[] = [
                'taxonomy' => "pa_{$key}",
                'field' => 'slug',
                'terms' => [$value],
            ];
        }
    }

    return $filter_query;
}

function _product_sort_query($sort_type) {
    switch ($sort_type) {
        case 'price-lth':
            return [
                'orderby' => [
                    'meta_value_num' => 'ASC',
                    'id' => 'DESC',
                ],
                'meta_key' => '_price',
            ];

        case 'price-htl':
            return [
                'orderby' => [
                    'meta_value_num' => 'DESC',
                    'id' => 'DESC',
                ],
                'meta_key' => '_price',
            ];

        case 'popular':
            return [
                'orderby' => [
                    'meta_value_num' => 'DESC',
                    'id' => 'DESC',
                ],
                'meta_key' => 'total_sales',
            ];

        case 'newest':
            return [
                'orderby' => [
                    'meta_value_num' => 'DESC',
                    'id' => 'DESC',
                ],
            ];

        default:
            return null;
    }
}
