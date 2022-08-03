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
     *  price (1)
     *  cost (2)
     */

    $csv_file_name = isset($_GET["file_name"]) ? $_GET["file_name"] : null;
    if ($csv_file_name == null || $csv_file_name == '') {
        error_log(sprintf('file_name parameter was empty, try again by setting the file_name get parameter'));
        return;
    }

    foreach (_read_csv_file('./data/' . $csv_file_name . '.csv') as $i => $wheel) {
        $sku = $wheel[0];
        $price = $wheel[1];
        $cost = $wheel[2];

        if ($sku === null || $sku === '') {
            error_log(sprintf('(' . $i . ') Product SKU is not set, skipping'));
            continue;
        }
        if (!is_numeric($price) || $price === '0.00' || $price === '0') {
            error_log(sprintf('(' . $i . ') Product price is not valid, skipping'));
            continue;
        }
        if (!is_numeric($cost) || $cost === '0.00' || $cost === '0') {
            error_log(sprintf('(' . $i . ') Product cost is not valid, skipping'));
            continue;
        }
        error_log(sprintf('(' . $i . ') Starting to update SKU %s', $sku));

        $product_id = _get_product_id_by_sku($sku);
        if ((bool) $product_id) {
            _update_product_price($product_id, $price);
            _update_product_cost($product_id, $cost);
            error_log(sprintf('(' . $i . ') Successfully updated price & cost for product w/ SKU %s', $sku));
        } else {
            error_log(sprintf('(' . $i . ') Product w/ SKU %s doesn\'t exist, skipping.', $sku));
        }
    }
}

main();
