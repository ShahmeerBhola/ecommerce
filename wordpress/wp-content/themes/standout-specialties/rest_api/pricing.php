<?php


require_once(__DIR__ . '/utils.php');


function calculate_amount_based_on_add_spare($amount, $add_spare, $quantity_sold_in)
{
    if ($quantity_sold_in === 4 && $add_spare) {
        return $amount * 1.25;
    }
    return $amount;
}


function get_product_regular_price($product, $add_spare, $quantity_sold_in)
{
    $product_data = $product->get_data();
    return calculate_amount_based_on_add_spare($product_data['price'], $add_spare, $quantity_sold_in);
}


function _get_effective_product_price($product, $add_spare, $quantity_sold_in)
{
    $product_data = $product->get_data();
    $price = $product_data['sale_price'] ? $product_data['sale_price'] : $product_data['price'];
    return calculate_amount_based_on_add_spare($price, $add_spare, $quantity_sold_in);
}


function get_product_cost($product_id, $add_spare, $quantity_sold_in)
{
    $cost = (float) get_post_meta($product_id, '_alg_wc_cog_cost', true);
    if ($cost && $cost !== 0) {
        return calculate_amount_based_on_add_spare((float) $cost, $add_spare, $quantity_sold_in);
    }
    return null;
}


function calculate_markup($net_sales, $cogs)
{
    return ($net_sales - $cogs) / $cogs;
}


function calculate_desired_markup_margin($wheel_id, $tire_id)
{
    global $wpdb;
    $table_prefix = $wpdb->prefix;
    $query = "
        SELECT
            m.meta_value AS markup_margin
        FROM (
            SELECT
                *
            FROM  `" . $table_prefix . "postmeta`
            WHERE
                meta_key = 'wheel_id'
                AND meta_value = '" . $wheel_id . "'
        ) w
        INNER JOIN `" . $table_prefix . "postmeta` t
            ON t.post_id = w.post_id
            AND t.meta_key = 'tire_id'
            AND t.meta_value = '" . $tire_id . "'
        INNER JOIN `" . $table_prefix . "postmeta` m
            ON m.post_id = w.post_id
            AND m.meta_key = 'markup_margin'
        INNER JOIN `" . $table_prefix . "posts` p
            ON w.post_id = p.id
            AND p.post_status = 'publish'
    ";

    $results = $wpdb->get_results($query);
    $wheel_brand_desired_margin_markup = get_wheel_product_brand_desired_margin_markup($wheel_id);

    if (!empty($results)) {
        // markup was set at the individual product level
        return (float) $results[0]->markup_margin;
    } elseif ($wheel_brand_desired_margin_markup) {
        // markup was set at the wheel brand level
        return $wheel_brand_desired_margin_markup;
    }
    return 0.25; // default
}


function calculate_product_sale_price($product, $add_spare = false, $selected_wheel_id = null)
{
    if(is_numeric($product)) {
        $product = wc_get_product($product);
    }

    $quantity_sold_in = get_quantity_sold_in($product);
    $price = _get_effective_product_price($product, $add_spare, $quantity_sold_in);

    if ($selected_wheel_id !== null) {
        $wheel = wc_get_product($selected_wheel_id);

        if (product_is_tire($product) && $wheel && product_is_wheel($wheel)) {
            // The current product we are looking at is a part of a wheel and tire package..
            $wheel_id = get_product_id($wheel);
            $tire_id = get_product_id($product);

            $desired_markup_margin = calculate_desired_markup_margin($wheel_id, $tire_id);

            $wheel_cost = get_product_cost($wheel_id, $add_spare, $quantity_sold_in);
            $tire_cost = get_product_cost($tire_id, $add_spare, $quantity_sold_in);

            if ($wheel_cost && $tire_cost) {
                // Costs have been set for both products..
                $wheel_price = _get_effective_product_price($wheel, $add_spare, $quantity_sold_in);

                $net_sales = $price + $wheel_price;
                $cogs = $tire_cost + $wheel_cost;

                if (calculate_markup($net_sales, $cogs) > $desired_markup_margin) {
                    // The markup is higher than the desired, adjust the price of the tire
                    // to match our desired markup margin
                    $price = ($desired_markup_margin * $cogs) + $cogs - $wheel_price;
                }
            }
        }
    }

    return round($price, 2);
}


function calculate_line_item_price($quantity, $product, $add_spare = false, $selected_wheel_id = null)
{
    return $quantity * calculate_product_sale_price($product, $add_spare, $selected_wheel_id);
}
