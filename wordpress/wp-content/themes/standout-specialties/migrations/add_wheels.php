<?php

require_once(dirname(__FILE__) . '/index.php');

require_once(dirname(__DIR__) . '/../../../wp-admin/includes/taxonomy.php');

// removing time limit to avoid timeouts
ignore_user_abort(true);
set_time_limit(0);

function main()
{
    /**
     * header
     *  sku (0)
     *  brand (1)
     *  name (2)
     *  photo (3)
     *  price (4)
     *  cost (5)
     *  diameter (6)
     *  width (7)
     *  bolt_pattern (8)
     *  model (9)
     *  model_other (10)
     *  color (11)
     *  back_spacing (12)
     *  offset (13)
     *  center_bore (14)
     *  load_rating (15)
     *  exposed_lugs (16)
     *  material (17)
     *  structure (18)
     *  style (19)
     *  number_of_spokes (20)
     *  year_introduced (21)
     *  variation_group (22)
     */
    global $acf_field_ids;

    $wheel_cat = get_term_by('name', 'Wheels', 'product_cat')->term_id;
    $brand_field_id = $acf_field_ids['brand']['brand'];

    $csv_file_name = isset($_GET["file_name"]) ? $_GET["file_name"] : null;
    if ($csv_file_name == null || $csv_file_name == '') {
        error_log(sprintf('file_name parameter was empty, try again by setting the file_name get parameter'));
        return;
    }
    $update = True;
    $update_param = isset($_GET["update"]) ? $_GET["update"] : null;
    if ($update_param != null && $update_param != '') {
        $update = filter_var($update_param, FILTER_VALIDATE_BOOLEAN);
    }

    foreach (_read_csv_file('./data/' . $csv_file_name . '.csv') as $i => $wheel) {
        $sku = $wheel[0];
        $brand = $wheel[1];
        $name = $wheel[2];
        $photo_url = $wheel[3];
        $price = $wheel[4];
        $cost = $wheel[5];
        $full_name = $brand . ' ' . $name;

        if ($sku === null || $sku === '') {
            error_log(sprintf('(' . $i . ') Product SKU is not set, skipping'));
            continue;
        }
        if (!is_numeric($price) || $price === '0.00' || $price === '0') {
            error_log(sprintf('(' . $i . ') Product price is not valid, skipping'));
            continue;
        }
        error_log(sprintf('(' . $i . ') Starting to import SKU %s', $sku));

        $product_exists = _product_with_title_exists($full_name);
        $photo_exists = !empty($photo_url) && _check_photo_exists($photo_url);

        // attempting to get photo url from prod DB backup
        if (!$photo_exists) {
            $prod_photo_url = _get_prod_image_url_for_product_sku($sku);
            if (!empty($prod_photo_url)) {
                $photo_exists = true;
                $photo_url = $prod_photo_url;
            }
        }

        // creating product post
        $product_post_id = _idempotently_insert_variable_product_by_title(
            $full_name,
            array(
                '_visibility' => 'visible',
                '_stock_status' => 'instock',
                'total_sales' => '0',
                '_downloadable' => 'no',
                '_virtual' => 'no',
                '_featured' => 'no',
                '_sold_individually' => 'no',
                '_manage_stock' => 'no',
                '_backorders' => 'no',
                '_wc_sold_in_qty_product' => 4
            ),
            $photo_exists ? 'publish' : 'draft'
        );

        if (!$product_exists) {
            if ($photo_exists) {
                _attach_product_featured_image($product_post_id, $photo_url, $name);
            }

            // Set product category
            wp_set_object_terms($product_post_id, $wheel_cat, 'product_cat');

            // Set brand
            $brand_post = _get_post_by_title($brand, 'brand');
            $brand_id = null;
            if ($brand_post == null) {
                $brand_id = _insert_brand_post($brand);
            } else {
                $brand_id = $brand_post->ID;
                error_log(sprintf('Brand %s already exists', $brand));
            }
            update_field($brand_field_id, $brand_id, $product_post_id);
        }

        // standardizing the bolt pattern property
        $bolt_pattern = $wheel[8];
        _standardize_bolt_pattern_value($bolt_pattern);

        $product_variation_data =  array(
            'attributes' => array(
                'diameter'     => is_numeric(substr($wheel[6], 0, -1)) ? $wheel[6] : '',
                'width'        => is_numeric(substr($wheel[7], 0, -1)) ? $wheel[7] : '',
                'bolt_pattern' => $bolt_pattern,
                'color'        => $wheel[11],
                'backspacing'  => is_numeric($wheel[12]) ? $wheel[12] : '',
                // offset is a reserved keyword, so attribute saved as 'wheel offset'
                'wheel_offset' => is_numeric($wheel[13]) ? $wheel[13] : '',
                'center_bore'  => is_numeric($wheel[14]) ? $wheel[14] : '',
                'load_rating'  => is_numeric($wheel[15]) ? $wheel[15] : ''
            ),
            'full_name' => $full_name,
            'sku'   => $sku,
            'price' => $price,
            'cost'  => $cost,
            'photo_url' => $photo_exists ? $photo_url : null
        );

        $variation_id = _create_variable_product_variation($product_post_id, $product_variation_data, $update);

        if ((bool) $variation_id) {
            error_log(sprintf('(' . $i . ') Successfully imported product variation w/ SKU %s', $sku));
        }
    }
    _close_prod_backup_db_connection();
}

main();
