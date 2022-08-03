<?php

require_once(dirname(__FILE__) . '/index.php');


function import_tires()
{
    /**
     * header
     *  brand (0)
     *  model (1)
     *  height (2)
     *  width (3)
     *  diameter (4)
     *  sku (5)
     *  max_pressure (6)
     *  max_load (7)
     *  load_range (8)
     *  photo_url (9)
     *  cost (10)
     *  price (11)
     */
    global $acf_field_ids;

    $tire_cat = get_term_by('name', 'Tires', 'product_cat')->term_id;
    $brand_field_id = $acf_field_ids['brand']['brand'];
    $tire_field_ids = $acf_field_ids['tire'];


    foreach (_read_csv_file('./data/tire_data.csv') as $tire) {
        $sku = $tire[5];
        $brand = $tire[0];
        $name = $brand . " " . $tire[1];
        $price = $tire[11];
        $cost = $tire[10];

        error_log(printf('Starting to import %s', $sku));

        $photo_url = $tire[9];
        $photo_exists = _photo_exists($photo_url);

        // create post, first checking to see if a product w/ this sku already exists
        $post_id = _idempotently_insert_product_based_on_sku(
            $sku,
            $name,
            'product',
            array(
                '_visibility' => 'visible',
                '_stock_status' => 'instock',
                'total_sales' => '0',
                '_downloadable' => 'no',
                '_virtual' => 'no',
                '_regular_price' => $price,
                '_sale_price' => '',
                '_purchase_note' => '',
                '_featured' => 'no',
                '_weight' => '',
                '_length' => '',
                '_width' => '',
                '_height' => '',
                '_sku' => $sku,
                '_product_attributes' => array(),
                '_sale_price_dates_from' => '',
                '_sale_price_dates_to' => '',
                '_price' => $price,
                '_sold_individually' => 'no',
                '_manage_stock' => 'no',
                '_backorders' => 'no',
                '_wc_sold_in_qty_product' => 4,
            ),
            $photo_exists ? 'publish' : 'draft'
        );

        if ($post_id !== null) {
            if ($photo_exists) {
                _attach_product_featured_image($post_id, $photo_url, $name);
            }

            // Set product category
            wp_set_object_terms($post_id, $tire_cat, 'product_cat');

            // add ACF data
            _add_acf_data_from_csv_row($post_id, $tire, array(
                2 => $tire_field_ids['height'],
                3 => $tire_field_ids['width'],
                6 => $tire_field_ids['max_pressure'],
                7 => $tire_field_ids['max_load'],
                8 => $tire_field_ids['load_range'],
                4 => $tire_field_ids['wheel_size'],
            ));

            // Set cost
            _update_product_cost($post_id, $cost);

            // Set brand
            $brand_id = _get_post_by_title($brand, 'brand');
            update_field($brand_field_id, $brand_id, $post_id);

            error_log(sprintf('Successfully imported %s', $sku));
        } else {
            error_log(sprintf('Updating product %s', $sku));
            $post_id = _get_product_id_by_sku($sku);
            _update_product_cost($post_id, $cost);
            _update_product_price($post_id, $price);
        }
    }
}

import_tires();
