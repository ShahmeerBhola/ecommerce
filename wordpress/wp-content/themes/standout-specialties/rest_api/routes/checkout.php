<?php


require_once(__DIR__ . '/../utils.php');
require_once(__DIR__ . '/../pricing.php');
require_once(__DIR__ . '/../taxes.php');
require_once(ABSPATH . 'vendor/stripe/stripe-php/init.php');


$order_error_msg = 'There was an error processing your order';
$order_success_msg = 'Order created successfully';


function make_create_order_response(
    $successful,
    $customer_message,
    $internal_message = '',
    $order_id = null,
    $requires_ui_action = null
) {
    return make_response(array(
        'successful' => $successful,
        'customer_message' => $customer_message,
        'internal_message' => $internal_message,
        'order_id' => $order_id,
        'requires_ui_action' => $requires_ui_action,
    ));
}


function update_order_status_and_leave_note($woocommerce_order, $status, $note)
{
    $woocommerce_order->update_status($status);
    $woocommerce_order->add_order_note($note);
}


function mark_order_processing($woocommerce_order, $payment_intent)
{
    $woocommerce_order->set_date_paid(gmdate('Y-m-d\TH:i:s\Z'));
    update_order_status_and_leave_note(
        $woocommerce_order,
        'wc-processing',
        'Payment processed successfully. PaymentIntent ID: ' . $payment_intent->id
    );
}


function calculate_taxes_handler($request)
{
    return make_response(calculate_order_tax_amounts($request['line_items'], $request['wheel_tire_packages'],
        $request['billing_country'], $request['billing_state']));
}


function get_discounts($request)
{
    return make_response(determine_discounts($request['wheel_tire_packages'], $request['shipping_method_id']));
}


function get_shipping_methods($request)
{
    $wc_shipping = new WC_Shipping_Zones();
    $shipping_zone = $wc_shipping->get_zone_matching_package(array(
        'destination' => array(
            'state' => $request['shipping_state'],
            'country' => $request['shipping_country'],
        ),
    ));

    $data = array();

    $shipping_methods = $shipping_zone->get_shipping_methods(true); // true will only return enabled methods
    foreach ($shipping_methods as $shipping_method) {
        // NOTE: right now each shipping method only has 1 rate.. if we change this in the future we'll need to 
        // change here
        $shipping_rate = $shipping_method->get_rates_for_package($request['wheel_tire_packages']);
        array_push($data, array(
            'id' => $shipping_method->id,
            'title' => $shipping_method->title,
            'description' => $shipping_method->method_description,
            'price' => (int) $shipping_rate->get_cost(),
        ));
    }

    return make_response($data);
}


function get_states_for_country($request)
{
    return make_response(_get_states_for_country($request['country_code']));
}


function get_product_mapping_for_cart($line_items, $wheel_tire_packages)
{
    $product_ids = array();
    $products = array();

    foreach ($line_items as $line_item) {
        array_push($product_ids, $line_item['id']);
    }

    foreach ($wheel_tire_packages as $package) {
        array_push($product_ids, $package['wheel']);
        array_push($product_ids, $package['tire']);

        foreach ($package['add_ons'] as $add_on) {
            array_push($product_ids, $add_on);
        }
    }

    $posts_query = query_products(-1, array(
        'post__in' => $product_ids,
        'post_type' => array('product', 'product_variation'),
    ));

    foreach ($posts_query->posts as $post) {
        $post_id = $post->ID;
        $products[$post_id] = wc_get_product($post_id);
    }
    return $products;
}


function determine_truck_add_spare($truck)
{
    return $truck['add_spare'];
}


function determine_line_item_add_spare($line_item)
{

    return empty($line_item['truck']) ? false : determine_truck_add_spare($line_item['truck']);
}


function hydrate_cart($request)
{
    $line_items = $request['line_items'];
    $wheel_tire_packages = $request['wheel_tire_packages'];
    $products = get_product_mapping_for_cart($line_items, $wheel_tire_packages);

    $output_line_items = array();
    $output_wheel_tire_packages = array();

    foreach ($line_items as $line_item) {
        $product = $products[$line_item['id']];
        if (product_is_purchasable($product)) {
            $add_spare = determine_line_item_add_spare($line_item);
            $serialized_product = _serialize_product($product, $add_spare);

            if(product_is_variant($product)) {
                $parent_product = wc_get_product($product->get_parent_id());
                $variant_product = $parent_product->get_available_variation($line_item['id']);

                $serialized_product = _serialize_product_variation($variant_product, $add_spare, null, false);

                $serialized_product = array_merge($serialized_product, array(
                    'parent' => _serialize_product($parent_product, $add_spare),
                ));
            }

            $line_item_data = array_merge($serialized_product, array(
                'truck' => $line_item['truck'],
            ));

            array_push($output_line_items, $line_item_data);
        }
    }

    foreach ($wheel_tire_packages as $package) {
        $wheel_id = $package['wheel'];
        $wheel = $products[$wheel_id];
        $tire = $products[$package['tire']];
        $truck = $package['truck'];

        if (!product_is_purchasable($wheel) || !product_is_purchasable($tire)) {
            continue;
        }

        $add_spare = determine_truck_add_spare($truck);
        $add_ons = array();

        foreach ($package['add_ons'] as $add_on) {
            $product = $products[$add_on];

            if (product_is_purchasable($product)) {
                array_push($add_ons, _serialize_product($products[$add_on], $add_spare));
            }
        }

        array_push(
            $output_wheel_tire_packages,
            array(
                'wheel' => _serialize_product($wheel, $add_spare),
                'tire' => _serialize_product($tire, $add_spare, $wheel_id),
                'add_ons' => $add_ons,
                'truck' => $truck,
            ),
        );
    }

    return make_response(array(
        'line_items' => $output_line_items,
        'wheel_tire_packages' => $output_wheel_tire_packages,
    ));
}


function finish_order_validation($request)
{
    /*
        https://stripe.com/docs/payments/accept-a-payment-synchronously#web-handle-next-actions
    */
    global $order_success_msg, $order_error_msg;

    $stripe = new \Stripe\StripeClient(STRIPE_API_SECRET_KEY);

    $woocommerce_order_id = $request['order_id'];
    $stripe_payment_intent_id = $request['payment_intent_id'];

    $woocommerce_order = wc_get_order($woocommerce_order_id);
    if (!$woocommerce_order) {
        // this would only happen if the ID specified isn't an actual order.. which should probably never occur
        return make_create_order_response(
            false,
            $order_error_msg,
            'Order ID ' . $woocommerce_order_id . ' does not exist',
            $woocommerce_order_id
        );
    }

    try {
        $payment_intent = $stripe->paymentIntents->retrieve($stripe_payment_intent_id, array());
        if ($payment_intent->status !== 'succeeded') {
            $payment_intent->confirm();
        }
    } catch (\Stripe\Exception\ApiErrorException $e) {
        // this would occur if stripe_payment_intent_id is not valid
        $error_msg = $e->getMessage();
        update_order_status_and_leave_note(
            $woocommerce_order,
            'wc-failed',
            'Error from Stripe while performing further action: ' . $error_msg
        );

        return make_create_order_response(false, $order_error_msg, $error_msg, $woocommerce_order_id);
    }

    if ($payment_intent->status === 'succeeded') {
        // Everything went smoothly..
        mark_order_processing($woocommerce_order, $payment_intent);
        return make_create_order_response(true, $order_success_msg, '', $woocommerce_order_id);
    }

    // Not sure if this condition would ever be triggered but doesn't hurt to have this here...
    // this would occur if the payment_intent.status were not succeeded..
    $error_msg = 'Stripe further action validation failed';
    update_order_status_and_leave_note($woocommerce_order, 'wc-failed', $error_msg);
    return make_create_order_response(false, $order_error_msg, $error_msg, $woocommerce_order_id);
}


function add_order_note_for_add_spare($order, $product_name_sku)
{
    $order->add_order_note(sprintf("Customer requested a spare for %s", $product_name_sku));
}


function add_order_note_for_truck($order, $product_name_sku, $truck)
{
    $order->add_order_note(sprintf("Truck for %s is a %s", $product_name_sku, construct_truck_name($truck)));
}


function add_product_to_order($order, $product, $total, $part_of_wheel_tire_package, $billing_state, $quantity = 1)
{
    $is_taxable = is_line_item_taxable($product, $part_of_wheel_tire_package, $billing_state);
    $order->add_product($product, $quantity, array(
        'total' => $total,
        'subtotal' => $total,
        'tax_class' => $is_taxable ? 'standard-rate' : 'zero-rate',
    ));
}


function create_order($request)
{
    /*
        Useful resources
        https://gist.github.com/stormwild/7f914183fc18458f6ab78e055538dcf0
        http://stackoverflow.com/questions/26581467/creating-woocommerce-order-with-line-item-programatically
        https://stripe.com/docs/payments/accept-a-payment#web-fulfillment
        https://stripe.com/docs/api

        Notes on the payment amount that is sent to Stripe
        A positive integer representing how much to charge in the smallest currency unit
        (e.g., 100 cents to charge $1.00 or 100 to charge ¥100, a zero-decimal currency).
        The minimum amount is $0.50 US or equivalent in charge currency.
        The amount value supports up to eight digits (e.g., a value of 99999999 for a USD charge of $999,999.99).

        https://stripe.com/docs/api/payment_intents/create#create_payment_intent-amount
    */
    global $order_success_msg, $order_error_msg;

    $stripe = new \Stripe\StripeClient(STRIPE_API_SECRET_KEY);
    $stripe_customer_id_meta_key = 'stripe_customer_id';
    $currency_code = $request['currency'];
    $line_items = $request['line_items'];
    $wheel_tire_packages = $request['wheel_tire_packages'];

    $product_mapping = get_product_mapping_for_cart($line_items, $wheel_tire_packages);

    $shipping_method_id = $request['shipping_method_id'];
    $customer_info = $request['customer_information'];
    $shipping_address = $request['shipping_address'];

    $billing_address = $request['billing_address'];
    $billing_line1 = $billing_address['line1'];
    $billing_line2 = $billing_address['line2'];
    $billing_city = $billing_address['city'];
    $billing_state = $billing_address['state'];
    $billing_country = $billing_address['country'];
    $billing_postal_code = $billing_address['postal_code'];

    $stripe_payment_method_id = $request['stripe_payment_method_id'];

    $customer_first_name = $customer_info['first_name'];
    $customer_last_name = $customer_info['last_name'];
    $customer_email = $customer_info['email'];
    $customer_phone_number = $customer_info['phone_number'];

    $shipping_method = _get_shipping_method_by_id($shipping_method_id);
    if (!$shipping_method) {
        return make_create_order_response(
            false,
            'The provided shipping method does not exist',
            'Shipping method ID ' . $shipping_method_id . ' does not exist'
        );
    }

    // Step 0. If user wants to be subscribed to newsleter.. subscribe them..
    if ($request['signup_for_newsletter']) {
        // would normally return boolean representing success.. we won't fail checkout if newsletter subscribe fails though...
        subscribe_email_to_newsletter($customer_email);
    }

    // Step 1. Fetch the Stripe PaymentMethod object
    try {
        $payment_method = $stripe->paymentMethods->retrieve($stripe_payment_method_id, array());
        $payment_method_id = $payment_method->id;
    } catch (\Stripe\Exception\ApiErrorException $e) {
        // this would occur if stripe_payment_method_id is not valid
        return make_create_order_response(false, $order_error_msg, $e->getMessage());
    }

    // Step 2. See if a WordPress customer exists by this e-mail.. if not, create one
    $wp_customer = get_user_by('email', $customer_email);
    if (!$wp_customer) {
        $wp_customer_id = wp_insert_user(array(
            'user_login' => wc_create_new_customer_username($customer_email, array(
                'first_name' => $customer_first_name,
                'last_name' => $customer_last_name,
            )),
            'user_email' => $customer_email,
            'user_pass' => wp_generate_password(25),
            'first_name' => $customer_first_name,
            'last_name' => $customer_last_name,
            'role' => 'customer',
        ));
        $wp_customer = get_user_by('id', $wp_customer_id);
    }

    // Step 3. See if the WordPress customer has a Stripe Customer ID saved as user metadata
    // if not, create a Stripe Customer object, and persist the stripe customer ID as user metadata in WordPress
    $wp_customer_id = $wp_customer->ID;
    $wp_customer_stripe_id = get_user_meta($wp_customer_id, $stripe_customer_id_meta_key, true);

    if ($wp_customer_stripe_id) {
        $stripe_customer = $stripe->customers->retrieve($wp_customer_stripe_id, array());
    } else {
        $stripe_customer = null;
    }

    if (!$stripe_customer) {
        try {
            $stripe_customer = $stripe->customers->create(array(
                'address' => array(
                    'line1' => $billing_line1,
                    'line2' => $billing_line2,
                    'city' => $billing_city,
                    'state' => $billing_state,
                    'country' => $billing_country,
                    'postal_code' => $billing_postal_code,
                ),
                'email' => $customer_email,
                'name' => $customer_first_name . ' ' . $customer_last_name,
                'phone' => $customer_phone_number,
                'payment_method' => $payment_method_id,
                'metadata' => array(
                    'woocommerce_customer_id' => $wp_customer_id,
                ),
            ));
        } catch (\Stripe\Exception\ApiErrorException $e) {
            // TODO:
            // this case can happen for example if the WordPress user has a stripe_customer_id saved in their metadata
            // but for some reason that Stripe Customer object was deleted (probably manually) in Stripe
            // best bet here would probably be to just create another Stripe user for this Customer and update
            // the WordPress stripe_customer_id metadata to reflect the new stripe_customer_id
            return make_create_order_response(false, $order_error_msg, $e->getMessage());
        }

        $stripe_customer_id = $stripe_customer->id;
        update_user_meta($wp_customer_id, $stripe_customer_id_meta_key, $stripe_customer_id);
    } else {
        // They already have a Stripe Customer object.. attach the Stripe PaymentMethod to the Stripe Customer
        // if it doesn't already exist
        $stripe_customer_id = $stripe_customer->id;
        $payment_method_already_exists_on_stripe_customer = false;

        $stripe_customer_payment_methods = $stripe->paymentMethods->all(array(
            'customer' => $stripe_customer_id,
            'type' => 'card',
        ));

        foreach ($stripe_customer_payment_methods->data as $payment_method) {
            if ($payment_method->id === $stripe_payment_method_id) {
                $payment_method_already_exists_on_stripe_customer = true;
            }
        }

        if (!$payment_method_already_exists_on_stripe_customer) {
            try {
                $stripe->paymentMethods->attach($stripe_payment_method_id, array(
                    'customer' => $stripe_customer_id,
                ));
            } catch (\Stripe\Exception\ApiErrorException $e) {
                return make_create_order_response(false, $order_error_msg, $e->getMessage());
            }
        }
    }

    // Step 4. Create the Order object in WooCommerce.. set status as 'pending' to start
    $payment_card_details = ucfirst($payment_method->card->brand) . ' ending in ' . $payment_method->card->last4;
    $woocommerce_order = wc_create_order();
    $woocommerce_order_id = $woocommerce_order->get_id();
    $woocommerce_order->set_currency($currency_code);
    update_order_status_and_leave_note(
        $woocommerce_order,
        'wc-pending',
        'Processing order using ' . $payment_card_details
    );

    $woocommerce_order->set_customer_id($wp_customer_id);
    $woocommerce_order->set_customer_ip_address($_SERVER['REMOTE_ADDR']);
    $woocommerce_order->set_customer_user_agent($_SERVER['HTTP_USER_AGENT']);
    $woocommerce_order->set_payment_method($payment_card_details);
    $woocommerce_order->set_created_via('Website');
    $woocommerce_order->set_payment_method_title($payment_card_details);
    $woocommerce_order->set_address(array(
        'first_name' => $billing_address['first_name'],
        'last_name'  => $billing_address['last_name'],
        'email'      => $customer_email,
        'phone'      => $customer_phone_number,
        'address_1'  => $billing_line1,
        'address_2'  => $billing_line2,
        'city'       => $billing_city,
        'state'      => $billing_state,
        'postcode'   => $billing_postal_code,
        'country'    => $billing_country,
    ), 'billing');
    $woocommerce_order->set_address(array(
        'first_name' => $shipping_address['first_name'],
        'last_name'  => $shipping_address['last_name'],
        'address_1'  => $shipping_address['line1'],
        'address_2'  => $shipping_address['line2'],
        'city'       => $shipping_address['city'],
        'state'      => $shipping_address['state'],
        'postcode'   => $shipping_address['postal_code'],
        'country'    => $shipping_address['country'],
    ), 'shipping');

    foreach ($line_items as $line_item) {
        $product = $product_mapping[$line_item['id']];
        $product_name_sku = construct_product_name_sku_string($product);

        $truck = $line_item['truck'];
        $add_spare = determine_line_item_add_spare($line_item);
        $quantity = $line_item['quantity'];
        $price = calculate_line_item_price($quantity, $product, $add_spare);
        add_product_to_order($woocommerce_order, $product, $price, false, $billing_state, $quantity);

        if ($truck !== null) {
            add_order_note_for_truck($woocommerce_order, $product_name_sku, $truck);
        }
        if ($add_spare) {
            add_order_note_for_add_spare($woocommerce_order, $product_name_sku);
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
        add_product_to_order($woocommerce_order, $wheel, $wheel_price, true, $billing_state);

        // Tire
        $tire = $product_mapping[$tire_id];
        $tire_price = calculate_line_item_price($line_item_quantity, $tire, $add_spare, $wheel_id);
        add_product_to_order($woocommerce_order, $tire, $tire_price, true, $billing_state);

        $wheel_name_sku = construct_product_name_sku_string($wheel);
        $tire_name_sku = construct_product_name_sku_string($tire);
        $wheel_tire_bundle_name = sprintf("%s - %s package", $wheel_name_sku, $tire_name_sku);

        // Add note about which wheel and tire go together
        $woocommerce_order->add_order_note(sprintf("%s is paired with %s", $wheel_name_sku, $tire_name_sku));

        if ($add_spare) {
            add_order_note_for_add_spare($woocommerce_order, $wheel_tire_bundle_name);
        }
        add_order_note_for_truck($woocommerce_order, $wheel_tire_bundle_name, $truck);

        // Addons
        foreach ($wheel_tire_package['add_ons'] as $add_on_id) {
            $add_on = $product_mapping[$add_on_id];

            $add_on_price = calculate_line_item_price($line_item_quantity, $add_on, $add_spare, $wheel_id);
            $add_on_name_sku = construct_product_name_sku_string($add_on);
            add_product_to_order($woocommerce_order, $add_on, $add_on_price, true, $billing_state);

            // Add note as to which wheel tire package this add-on belongs to
            $woocommerce_order->add_order_note(sprintf("%s is paired with %s", $add_on_name_sku, $wheel_tire_bundle_name));
        }
    }

    // Step 6. Add shipping to the order
    // https://stackoverflow.com/a/53673366/3902555
    $order_shipping = new WC_Order_Item_Shipping();
    $shipping_rate = $shipping_method->get_rates_for_package($wheel_tire_packages);
    $order_shipping->set_shipping_rate($shipping_rate);
    $woocommerce_order->add_item($order_shipping);

    // Step 7. Add tax rates to order
    foreach (get_order_tax_rates($wheel_tire_packages, $billing_country, $billing_state) as $tax_rate_id => $tax_rate) {
        $order_tax = new WC_Order_Item_Tax();
        $order_tax->set_rate($tax_rate_id);
        $woocommerce_order->add_item($order_tax);
    }

    // calculate total including taxes before we add any applicable discount(s)
    $woocommerce_order->calculate_totals(true);

    // Step 8. Calculate discounts
    $discounts = determine_discounts($wheel_tire_packages, $shipping_method_id);
    foreach ($discounts as $discount) {
        // https://stackoverflow.com/a/52657462/3902555
        $order_discount = new WC_Order_Item_Fee();
        $order_discount->set_name($discount['name']);
        $order_discount->set_amount(-$discount['amount']);
        $order_discount->set_total(-$discount['amount']);

        // Discounts are not taxable
        $order_discount->set_taxes(false);
        $order_discount->set_tax_status('none');

        $woocommerce_order->add_item($order_discount);
    }

    // recalculate total after we added any applicable discount(s), exclusive of taxes this time, as discounts should not be affected by taxes,
    $order_total = $woocommerce_order->calculate_totals(false);

    // Step 9. Create a Stripe PaymentIntent object
    try {
        $payment_intent = $stripe->paymentIntents->create(array(
            'amount' => $order_total * 100,
            'currency' => $currency_code,
            'confirm' => true,
            'customer' => $stripe_customer_id,
            'description' => 'WooCommerce Order ID # ' . $woocommerce_order_id,
            'payment_method' => $payment_method_id,
            'payment_method_types' => ['card'],
        ));
    } catch (\Stripe\Exception\ApiErrorException $e) {
        // there was a failure with the card.. delete the order so that we don't have duplicate orders showing up in Woocommerce if the user retries
        $woocommerce_order->delete();

        return make_create_order_response(false, $order_error_msg, $e->getMessage(), null);
    }

    // Step 10. Check if the PaymentIntent requires further action on the client side
    // https://stripe.com/docs/payments/accept-a-payment-synchronously#web-handle-next-actions
    if ($payment_intent->status === 'requires_action' && $payment_intent->next_action->type == 'use_stripe_sdk') {
        update_order_status_and_leave_note(
            $woocommerce_order,
            'wc-pending',
            'Stripe requires further validation from user'
        );

        $msg = 'Payment processing requires further verification';
        return make_create_order_response(false, $msg, $msg, $woocommerce_order_id, array(
            'payment_intent_client_secret' => $payment_intent->client_secret,
        ));
    }

    // Step 11. Update the WooCommerce Object status as finalized depending on the PaymentIntent
    mark_order_processing($woocommerce_order, $payment_intent);

    // Step 12. If a brand ambassador was chosen, add it to the order
    $brand_ambassador_referral = $request['brand_ambassador_referral'];
    if ($brand_ambassador_referral) {
        $brand_ambassador = _get_post_from_title($brand_ambassador_referral, 'brand-ambassador');
        if ($brand_ambassador) {
            add_post_meta($woocommerce_order_id, 'brand_ambassador_referral', $brand_ambassador->ID);
        }
    }

    return make_create_order_response(true, $order_success_msg, '', $woocommerce_order_id);
}

function package_price($request) {
    $tire_price = calculate_line_item_price($request['quantity'], $request['tire_id'], $request['add_spire'], $request['wheel_id']);

    $price = $tire_price;

    return new WP_REST_Response(array('data' => array('price' => $price)), 200);
}
