<?php

require_once(__DIR__ . '/utils.php');


/**
 * TAX LOGIC
 * 
 * Aaron: 
 * - all wheel and tire packages will have sales tax, regardless of being picked up or shipped
 * - wheels/products purchased by in state people. sales tax
 * - wheels and products purchased by out of state people. no tax
 *
 * Aaron:
 * - State/country should be based off of billing address
 * 
 * Nov 1, 2020 update
 * Aaron:
 * - Apparel shouldn't be taxed in PA
*/
function is_order_taxable($wheel_tire_packages, $billing_state) {
    return order_has_wheel_and_tire($wheel_tire_packages) || billing_state_is_pennsylvania($billing_state);
}


function is_line_item_taxable($product, $is_part_of_wheel_tire_package, $billing_state)
{
    $is_apparel = product_is_apparel($product);
    $is_taxable_apparel = product_is_taxable_apparel($product);
    $is_pennsylvania = billing_state_is_pennsylvania($billing_state);

    if ($is_pennsylvania) {
        // wheels/products purchased by in state people. sales tax. However, apparel shouldn't be taxed
        // in Pennsylvania
        return $is_apparel ? $is_taxable_apparel : true;
    }
    // all wheel and tire packages will have sales tax, regardless of being picked up or shipped
    // wheels and products purchased by out of state people. no tax
    return $is_part_of_wheel_tire_package;
}


function get_order_tax_rates($wheel_tire_packages, $billing_country, $billing_state)
{
    $rates = array();
    if (is_order_taxable($wheel_tire_packages, $billing_state)) {
        $wc_tax = new WC_Tax();
        $tax_rates = $wc_tax->find_rates(array(
            'country' => $billing_country,
            'state' => $billing_state,
        ));
        foreach ($tax_rates as $tax_rate) {
            array_push($rates, $tax_rate);
        }
    }
    return $rates;
}


function calculate_order_tax_amounts($line_items, $wheel_tire_packages, $billing_country, $billing_state)
{
    $tax_amounts = array();
    $total_taxable_amount = 0;
    $product_mapping = get_product_mapping_for_cart($line_items, $wheel_tire_packages);

    foreach ($line_items as $line_item) {
        $product = $product_mapping[$line_item['id']];

        if (is_line_item_taxable($product, false, $billing_state)) {
            $price = calculate_line_item_price($line_item['quantity'], $product,
                determine_line_item_add_spare($line_item));
            $total_taxable_amount += $price;
        }
    }

    foreach ($wheel_tire_packages as $wheel_tire_package) {
        $wheel_id = $wheel_tire_package['wheel'];
        $tire_id = $wheel_tire_package['tire'];
        $truck = $wheel_tire_package['truck'];
        $add_spare = determine_truck_add_spare($truck);
        $line_item_quantity = 1;

        // Wheel
        $wheel = $product_mapping[$wheel_id];
        $wheel_price = calculate_line_item_price($line_item_quantity, $wheel, $add_spare, $wheel_id);
        $total_taxable_amount += $wheel_price;

        // Tire
        $tire = $product_mapping[$tire_id];
        $tire_price = calculate_line_item_price($line_item_quantity, $tire, $add_spare, $wheel_id);
        $total_taxable_amount += $tire_price;

        // Addons
        foreach ($wheel_tire_package['add_ons'] as $add_on_id) {
            $add_on = $product_mapping[$add_on_id];

            if (is_line_item_taxable($add_on, true, $billing_state)) {
                $add_on_price = calculate_line_item_price($line_item_quantity, $add_on, $add_spare, $wheel_id);
                $total_taxable_amount += $add_on_price;
            }
        }
    }

    foreach (get_order_tax_rates($wheel_tire_packages, $billing_country, $billing_state) as $tax_rate) {
        // 0 <= rate >= 100
        $rate = $tax_rate['rate'];
        array_push($tax_amounts, array(
            'label' => sprintf("%s (%s%%)", $tax_rate['label'], $rate),
            'amount' => round(($rate / 100) * $total_taxable_amount, 2),
        ));
    }

    return $tax_amounts;
}
