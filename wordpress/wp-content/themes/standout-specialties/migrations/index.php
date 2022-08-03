<?php

require_once(dirname(__DIR__) . '/../../../wp-load.php');
require_once(dirname(__DIR__) . '/../../../wp-admin/includes/image.php');
require_once(dirname(__DIR__) . '/../../../wp-admin/includes/taxonomy.php');

$acf_field_ids = array(
    'brand' => array(
        'brand' => 'field_5ebd2367dcfbe',
    ),
    'wheel' => array(
        'diameter' => 'field_5ee1668bfa01a',
        'width' => 'field_5ee166ecfa01b',
        'bolt_pattern' => 'field_5ee1673bfa01c',
        'model' => 'field_5efa1c1518dd4',
        'model_other' => 'field_5efa1c1f18dd5',
        'color' => 'field_5efa1c2718dd6',
        'backspacing' => 'field_5efa1c2d18dd7',
        'offset' => 'field_5efa1c4618dd8',
        'center_bore' => 'field_5efa1c5418dd9',
        'load_rating' => 'field_5efa1c8518dda',
        'exposed_lugs' => 'field_5efa1c9118ddb',
        'material' => 'field_5efa1ca618ddc',
        'structure' => 'field_5efa1cb818ddd',
        'style' => 'field_5efa23f3dffb2',
        'number_of_spokes' => 'field_5efa1ccc18dde',
        'year_introduced' => 'field_5efa1cde18ddf',
    ),
    'tire' => array(
        'wheel_size' => 'field_5f24282563a5f',
        'height' => 'field_5f58c9861eb25',
        'width' => 'field_5f58c9911eb26',
        'max_pressure' => 'field_5f58c99c1eb27',
        'max_load' => 'field_5f58c9aa1eb28',
        'load_range' => 'field_5f58c9b21eb29',
    ),
    'suspension' => array(
        'lift_size' => 'field_5f580f546b2fc',
        'vehicle_year' => 'field_5f580f906b2fd',
        'vehicle_make' => 'field_5f580f9d6b2fe',
        'vehicle_drive' => 'field_5f580fb56b2ff',
    ),
);

$prod_backup_db_connection = null;


function _read_csv_file($file_name)
{
    $handle = fopen($file_name, 'r');
    fgets($handle); //Ignore the first line (header)

    // only reads one line at a time into memory
    while (($raw_string = fgets($handle)) !== false) {
        yield str_getcsv($raw_string);
    }

    fclose($handle);
}

/**
 * Create a product variation for a defined variable product ID.
 * https://stackoverflow.com/a/47766413/3902555
 */
function _create_product_variation($product_id, $meta_data, $variation_data)
{
    // Get the Variable product object (parent)
    $product = wc_get_product($product_id);
    $variation_attributes = $variation_data['attributes'];
    $variation_attribute_options = $variation_data['attribute_options'];

    $variation_post = array(
        'post_title' => $product->get_name(),
        'post_name' => 'product-' . $product_id . '-variation',
        'post_status' => 'publish',
        'post_parent' => $product_id,
        'post_type' => 'product_variation',
        'guid' => $product->get_permalink(),
        'meta_input' => $meta_data,
    );

    // Creating the product variation
    $variation_id = wp_insert_post($variation_post);

    // Get an instance of the WC_Product_Variation object
    $variation = new WC_Product_Variation($variation_id);

    // Iterating through the variations attributes
    $product_attributes = array();

    foreach ($variation_attributes as $attribute_name => $term_name) {
        // If taxonomy doesn't exists we create it
        if (!taxonomy_exists('pa_' . $attribute_name)) {
            // https://stackoverflow.com/a/58751713/3902555
            error_log(sprintf('Taxonomy %s doesnt exist, creating it', $attribute_name));

            //Create the attribute object
            $attribute = new WC_Product_Attribute();

            //pa_size tax id
            $attribute->set_id(0); // -> SET to 0

            //pa_size slug
            $attribute->set_name($attribute_name); // -> removed 'pa_' prefix

            //Set terms slugs
            $attribute->set_options($variation_attribute_options[$attribute_name]);

            $attribute->set_position(0);

            // If enabled
            $attribute->set_visible(1);

            // If we are going to use attribute in order to generate variations
            $attribute->set_variation(1);

            array_push($product_attributes, $attribute);
        }
    }

    $product->set_attributes($product_attributes);

    // Set/save all other data
    $variation->set_attributes($variation_attributes);

    // SKU
    if (!empty($variation_data['sku'])) {
        $variation->set_sku($variation_data['sku']);
    }

    // Prices
    if (empty($variation_data['sale_price'])) {
        $variation->set_price($variation_data['regular_price']);
    } else {
        $variation->set_price($variation_data['sale_price']);
        $variation->set_sale_price($variation_data['sale_price']);
    }
    $variation->set_regular_price($variation_data['regular_price']);

    // Stock
    if (!empty($variation_data['stock_qty'])) {
        $variation->set_stock_quantity($variation_data['stock_qty']);
        $variation->set_manage_stock(true);
        $variation->set_stock_status('');
    } else {
        $variation->set_manage_stock(false);
    }

    $variation->set_weight(''); // weight (reseting)
    $variation->save(); // Save the data

    return $variation_id;
}

function _get_global_product_attributes()
{
    return wc_get_attribute_taxonomies();
}

function _get_attribute_terms($attribute_taxonomy)
{
    return get_terms($attribute_taxonomy, 'hide_empty=0');
}

function _product_with_title_exists($title)
{
    $post = get_page_by_title($title, OBJECT, 'product');
    return $post != null;
}

function _idempotently_insert_variable_product_by_title($title, $meta, $status = 'publish')
{
    error_log(sprintf('Checking to see if product w/ title %s exists', $title));

    $product_post = get_page_by_title($title, OBJECT, 'product');
    if ($product_post != null) {
        error_log(sprintf('Product w/ title %s already exists', $title));
        return $product_post->ID;
    }
    // Creating new product
    $product_id = _insert_post($title, 'product', $meta, $status);
    // turn product into a variable product
    wp_set_object_terms($product_id, 'variable', 'product_type');

    // an other way to achieve this:
    // $product = new WC_Product_Variable($product_id);
    // $product->save();
    return $product_id;
}

function _create_variable_product_variation($product_post_id, $variation_data, $update = true)
{
    $variation_sku = $variation_data['sku'];
    $variation_id = _get_product_id_by_sku($variation_sku);
    if ((bool) $variation_id) {
        error_log(sprintf('Product variation w/ SKU %s already exists', $variation_sku));
        if ($update) {
            error_log(sprintf('Updating product variation %s price & cost.', $variation_sku));
            _update_product_cost($variation_id, $variation_data['cost']);
            _update_product_price($variation_id, $variation_data['price']);
        }
        return null;
    }

    // Get the Variable product object (parent)
    $product = wc_get_product($product_post_id);

    $variation_post = array(
        'post_title' => $product->get_name(),
        'post_name' => 'product-' . $product_post_id . '-variation',
        'post_status' => 'publish',
        'post_parent' => $product_post_id,
        'post_type' => 'product_variation',
        'guid' => $product->get_permalink(),
    );

    // Creating the product variation
    $variation_id = wp_insert_post($variation_post);

    // Get an instance of the WC_Product_Variation object
    $variation = new WC_Product_Variation($variation_id);
    $product_attributes = array();
    // attribute taxonomy => term slug pairs
    $variation_attribute_pairs = array();

    $existing_product_attributes = $product->get_attributes();
    $variation_attributes = $variation_data['attributes'];

    // Iterating through the variations attributes
    foreach ($variation_attributes as $attribute_name => $term_name) {
        $attribute_id = wc_attribute_taxonomy_id_by_name($attribute_name);
        $attribute = wc_get_attribute($attribute_id);
        $attribute_term = null;

        // creating attribute term if it doesnt already exist
        if (isset($term_name) && strlen($term_name) > 0) {
            $create_term_result = _create_attribute_term($term_name, $attribute->slug);
            $attribute_term = get_term_by('name', $term_name, $attribute->slug);
        }

        $attribute_object = isset($existing_product_attributes[$attribute->slug]) ?
            $existing_product_attributes[$attribute->slug] : null;
        $attribute_options = array();

        // checking if product attribute already existis
        if ($attribute_object == null) {
            if (!empty($attribute_term)) {
                $attribute_options[] = $attribute_term->term_id;
            }
            $attribute_object = new WC_Product_Attribute();
            $attribute_object->set_id($attribute_id);
            $attribute_object->set_name($attribute->slug);
            $attribute_object->set_options($attribute_options);
            $attribute_object->set_position(0);
            $attribute_object->set_visible(1);
            $attribute_object->set_variation(1);
        } else if (!empty($attribute_term)) {
            $attribute_options = $attribute_object->get_options();
            $attribute_key = array_search($attribute_term->term_id, $attribute_options);
            // adding new attribute term option
            if ($attribute_key === false) {
                $attribute_options[] = $attribute_term->term_id;
                $attribute_object->set_options($attribute_options);
            }
        }
        $product_attributes[] = $attribute_object;

        if (!empty($attribute_term)) {
            $variation_attribute_pairs[$attribute->slug] = $attribute_term->slug;
        }
    }

    // DO NOT REMOVE, needed to refresh attributes and add new attribute option(s)
    $product->set_attributes([]);
    $product->save();

    $product->set_attributes($product_attributes);
    $product->save();

    // Save variation data
    $variation->set_attributes($variation_attribute_pairs);

    // Setting sku
    if (!empty($variation_sku)) {
        $variation->set_sku($variation_sku);
    }

    // Setting price
    $variation->set_regular_price($variation_data['price']);
    $variation->save();

    // Setting cost
    _update_product_cost($variation_id, $variation_data['cost']);

    // Setting photo
    if (isset($variation_data['photo_url'])) {
        $name = $variation_data['full_name'] . ' ' . $variation_sku;
        _attach_product_featured_image($variation_id, $variation_data['photo_url'], $name);
    }

    return $variation_id;
}

function _create_attribute_term($term, $taxonomy)
{
    $slug = $term;
    if (is_numeric($term) && substr($term, 0, 1) == '-') {
        $slug = 'neg' . substr($term, 1);
    }
    # trying to get term by slug
    $existing_term = get_term_by('slug', $slug, $taxonomy);
    if ($existing_term != false) {
        return $existing_term;
    }
    $args = array('slug' => $slug);
    return wp_insert_term($term, $taxonomy, $args);
}

function _insert_post($title, $type, $meta, $status = 'publish', $content = '')
{
    $post_id = wp_insert_post(array(
        'post_status' => $status,
        'post_title' => $title,
        'post_parent' => '',
        'post_content' => $content,
        'post_type' => $type,
        'meta_input' => $meta,
    ));

    error_log(sprintf('Inserted post w/ ID %s', $post_id));
    return $post_id;
}

function _update_post_title($id, $title)
{
    $post_id = wp_update_post(array(
        'ID' => $id,
        'post_title' => $title
    ));

    error_log(sprintf('Updated post title w/ ID %s', $post_id));
    return $post_id;
}

function _insert_brand_post($title, $status = 'publish')
{
    error_log('Inserting brand post');
    $post_id = wp_insert_post(array(
        'post_status' => $status,
        'post_title' => $title,
        'post_parent' => '',
        'post_type' => 'brand'
    ));

    error_log(sprintf('Inserted brand post w/ ID %s', $post_id));
    return $post_id;
}


function _get_product_id_by_sku($sku)
{
    global $wpdb;
    $query = $wpdb->prepare(
        "
				SELECT post_id
				FROM {$wpdb->postmeta}
				WHERE
                    meta_value = %s
				LIMIT 1
			",
        $sku
    );
    return $wpdb->get_var($query);
}

function _connect_to_prod_backup_db($db_name = 'wordpress_production_backup')
{
    global $prod_backup_db_connection;
    // new wpdb('root', DB_PASSWORD, 'wordpress_production', DB_HOST)
    $prod_backup_db_connection = new wpdb(DB_USER, DB_PASSWORD, $db_name, DB_HOST);
}

function _close_prod_backup_db_connection()
{
    global $prod_backup_db_connection;
    if (isset($prod_backup_db_connection)) {
        $prod_backup_db_connection->close();
    }
}

function _get_prod_image_url_for_product_sku($sku)
{
    global $prod_backup_db_connection;
    if (!isset($prod_backup_db_connection)) {
        _connect_to_prod_backup_db();
    }
    $prod_db_prefix = 'wp_ZDgsgVR2_';
    $query = $prod_backup_db_connection->prepare(
        "
				SELECT pm_file.meta_value
                FROM {$prod_db_prefix}postmeta pm_sku
                LEFT JOIN {$prod_db_prefix}postmeta pm_thumb 
                    ON pm_thumb.post_id = pm_sku.post_id AND pm_thumb.meta_key = '_thumbnail_id' 
                LEFT JOIN {$prod_db_prefix}postmeta pm_file 
                    ON pm_file.post_id = pm_thumb.meta_value AND pm_file.meta_key = '_wp_attached_file' 
                WHERE pm_sku.meta_key = '_sku' AND pm_sku.meta_value = %s
				LIMIT 1
			",
        $sku
    );
    $file_url = $prod_backup_db_connection->get_var($query);
    if (empty($file_url)) {
        return null;
    }
    return 'https://wordpress.standoutspecialties.com/wp-content/uploads/' . $file_url;
}


function _idempotently_insert_product_based_on_sku($sku, $title, $type, $meta, $status = 'publish', $content = '')
{
    error_log(sprintf('Checking to see if product w/ SKU %s exists', $sku));

    if ((bool) _get_product_id_by_sku($sku)) {
        error_log(sprintf('Product w/ SKU %s already exists', $sku));
        return null;
    }
    return _insert_post($title, $type, $meta, $status, $content);
}


function _idempotently_insert_post_based_on_title($title, $type, $meta, $status = 'publish')
{
    error_log(sprintf('Checking to see if post w/ title %s exists', $title));

    if (get_page_by_title($title, OBJECT, $type)) {
        error_log(sprintf('Post w/ title %s already exists', $title));
        return null;
    }
    return _insert_post($title, $type, $meta, $status);
}


function _attach_product_featured_image($post_id, $url, $image_post_name)
{
    // https://devnetwork.io/add-woocommerce-product-programmatically/
    error_log(sprintf('Attaching featured product image for product ID %s', $post_id));

    $image_url = $url;
    $url_array = explode('/', $url);
    $image_name = $url_array[count($url_array) - 1];
    $image_data = file_get_contents($image_url);

    $upload_dir = wp_upload_dir(); // Set upload folder
    $filename = basename($image_name);

    // Check folder permission and define file location
    if (wp_mkdir_p($upload_dir['path'])) {
        $file = $upload_dir['path'] . '/' . $filename;
    } else {
        $file = $upload_dir['basedir'] . '/' . $filename;
    }

    // Create the image file on the server
    file_put_contents($file, $image_data);

    $attach_id = wp_insert_attachment(array(
        'post_mime_type' => wp_check_filetype($filename, null)['type'], // Check image file type
        'post_title' => $image_post_name,
        'post_content' => '',
        'guid' => 'https://storage.googleapis.com/standout-specialties-wp-uploads-prd/2020/10/' . $filename,
        'post_status' => 'inherit'
    ), $file, $post_id); // Create the attachment
    $attach_data = wp_generate_attachment_metadata($attach_id, $file); // Define attachment metadata
    wp_update_attachment_metadata($attach_id, $attach_data); // Assign metadata to attachment

    // Add alt tag
    update_post_meta($attach_id, '_wp_attachment_image_alt', $image_post_name);

    // And finally assign featured image to post
    set_post_thumbnail($post_id, $attach_id);

    error_log(sprintf('Attached featured product image for product ID %s', $post_id));
}


function _photo_exists($url)
{
    error_log(sprintf('Checking if photo exists for %s', $url));

    $handle = curl_init($url);

    curl_setopt($handle,  CURLOPT_RETURNTRANSFER, TRUE);

    $response = curl_exec($handle);
    $photo_exists = curl_getinfo($handle, CURLINFO_HTTP_CODE) !== 404;

    curl_close($handle);

    error_log($photo_exists ? 'Photo exists' : 'Photo doesn\'t exist');

    return $photo_exists;
}

function _check_photo_exists($url)
{
    error_log(sprintf('Checking if photo exists for %s', $url));

    $headers = get_headers($url);
    $response_code = substr($headers[0], 9, 3);
    $photo_exists = $response_code === '200';

    error_log($photo_exists ? 'Photo exists' : 'Photo doesn\'t exist');
    return $photo_exists;
}

function _add_acf_data_from_csv_row($post_id, $csv_data, $col_idx_field_id_mapping)
{
    global $acf_field_ids;

    foreach ($col_idx_field_id_mapping as $col_idx => $field_id) {
        $value = $csv_data[$col_idx];
        if ($value) {
            if ($field_id === $acf_field_ids['wheel']['bolt_pattern'] || $field_id === $acf_field_ids['wheel']['color']) {
                $values = array();
                foreach (explode(",", $value) as $single_value) {
                    array_push($values, trim($single_value));
                }
                update_field($field_id, $values, $post_id);
            } else {
                update_field($field_id, $value, $post_id);
            }
        }
    }
}

function _standardize_bolt_pattern_value(&$bolt_pattern)
{
    $values = array();
    foreach (explode(",", $bolt_pattern) as $single_value) {
        array_push($values, trim($single_value));
    }
    sort($values);
    $bolt_pattern = implode(', ', $values);
}

function _get_post_by_title($title, $post_type)
{
    return get_page_by_title($title, 'OBJECT', $post_type);
}

function _update_product_price($post_id, $price)
{
    update_post_meta($post_id, '_price', $price);
    update_post_meta($post_id, '_regular_price', $price);
}

function _update_product_cost($post_id, $cost)
{
    update_post_meta($post_id, '_alg_wc_cog_cost', $cost);
}
