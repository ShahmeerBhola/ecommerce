<?php

require_once(dirname(__FILE__) . '/routes/index.php');

$API_NAMESPACE = 'api/v1';

function allow_cors()
{
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter(
        'rest_pre_serve_request',
        function ($value) {
            header('Access-Control-Allow-Origin: ' . HEADLESS_FRONTEND_ORIGIN);
            header('Access-Control-Allow-Methods: GET');
            header('Access-Control-Allow-Credentials: true');
            return $value;
        }
    );
}

function register_custom_endpoints()
{
    // Useful resources
    // https://www.shawnhooper.ca/2017/02/15/wp-rest-secrets-found-reading-core-code/

    global $API_NAMESPACE;

    $truck_query_arg_items = array(
        'year' => array(
            'type' => 'string',
            'required' => true,
        ),
        'make' => array(
            'type' => 'string',
            'required' => true,
        ),
        'model' => array(
            'type' => 'string',
            'required' => true,
        ),
        'trim' => array(
            'type' => 'string',
            'required' => true,
        ),
        'add_spare' => array(
            'required' => true,
            'type' => 'boolean',
            'description' => 'Whether or not a spare is needed.',
        ),
    );

    $line_items_arg = array(
        'required' => true,
        'type' => 'array',
        'items' => array(
            'type' => 'object',
            'items' => array(
                'id' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Product ID',
                ),
                'quantity' => array(
                    'required' => true,
                    'type' => 'integer',
                    'description' => 'How many of the product to purchase',
                    'minimum' => 1,
                ),
                'truck' => array(
                    'type' => 'object',
                    'required' => false,
                    'description' => 'Truck that the product will be used for',
                    'items' => $truck_query_arg_items,
                ),
            ),
        ),
    );

    $wheel_tire_packages_arg = array(
        'required' => true,
        'type' => 'array',
        'items' => array(
            'type' => 'object',
            'items' => array(
                'wheel' => array(
                    'type' => 'integer',
                    'required' => true,
                    'description' => 'Product ID of wheel',
                ),
                'tire' => array(
                    'type' => 'integer',
                    'required' => true,
                    'description' => 'Product ID of tire',
                ),
                'truck' => array(
                    'type' => 'object',
                    'required' => true,
                    'description' => 'Truck that the wheel tire package will be put on',
                    'items' => $truck_query_arg_items,
                ),
                'add_ons' => array(
                    'type' => 'array',
                    'required' => true,
                    'items' => array(
                        'type' => 'string',
                        'description' => 'Product ID of add ons',
                    ),
                ),
            ),
        ),
    );

    $shipping_method_arg = array(
        'required' => true,
        'type' => 'string',
        'description' => 'WordPress ID of the shipping method to use',
    );
    $country_code_arg = array(
        'required' => true,
        'type' => 'string',
        'description' => 'Country code to fetch states for',
    );

    $truck_year_arg = array(
        'required' => true,
        'type' => 'integer',
        'minimum' => 1990,
        'maximum' => date('Y') + 1,
        'description' => 'Year of the truck',
    );
    $truck_make_arg = array(
        'required' => true,
        'type' => 'string',
        'description' => 'Make of the truck',
    );
    $truck_model_arg = array(
        'required' => true,
        'type' => 'string',
        'description' => 'Model of the truck',
    );
    $truck_trim_arg = array(
        'required' => true,
        'type' => 'string',
        'description' => 'Trim of the truck',
    );

    $selected_wheel_arg = array(
        'required' => false,
        'type' => 'integer',
        'description' => 'Used during the tire/wheel package building flow to return compatible tires. Represents the product ID of the selected wheel.',
    );
    $add_spare_arg = array(
        'required' => false,
        'default' => false,
        'type' => 'boolean',
        'description' => 'Whether or not a spare wheel + tire is needed.',
    );

    $routes = array(
        '/products' => array(
            'methods' => 'GET',
            'callback' => 'product_search',
            'args' => array(
                's' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Search term that will be matched against product names and skus',
                ),
                'category' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Only return products that belong to this category',
                ),
                // wheel
                'diameter' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Diameter of the wheel',
                ),
                'offset' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Offset of the wheel',
                ),
                'bolt_pattern' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Bolt pattern of the wheel',
                ),
                'color' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Color of the wheel',
                ),
                // tire
                'wheel_size' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Diameter of the tire',
                ),
                'height' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Height of the tire',
                ),
                'max_pressure' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Max pressure of the tire',
                ),
                'max_load' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Max load of the tire',
                ),
                'load_range' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Load range of the tire',
                ),

                // both tire and wheel
                'width' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Width of the wheel or tire',
                ),
                'brand' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Slug of the brand',
                ),

                'forged' => array(
                    'required' => false,
                    'type' => 'boolean',
                    'description' => 'Whether or not to only show products from brands which are marked as "forged"',
                ),
                'selected_wheel' => $selected_wheel_arg,
                'add_spare' => $add_spare_arg,
                'year' => array(
                    'required' => false,
                    'type' => 'integer',
                    'minimum' => 1990,
                    'maximum' => date('Y') + 1,
                    'description' => 'Year of the truck',
                ),
                'make' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Make of the truck',
                ),
                'model' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Model of the truck',
                ),
                'trim' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Trim of the truck',
                ),
                'sort' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'How to sort searched products.',
                    'enum' => array(
                        'price-lth',
                        'price-htl',
                        'popular',
                        'newest',
                    ),
                ),
                'page' => array(
                    'required' => false,
                    'default' => 1,
                    'type' => 'integer',
                    'minimum' => 1,
                    'description' => 'Page number to fetch',
                ),
                'per_page' => array(
                    'required' => false,
                    'default' => 40,
                    'type' => 'integer',
                    'minimum' => 1,
                    'maximum' => 50,
                    'description' => 'Number of items to return per page',
                ),
            ),
        ),
        '/products/slugs' => array(
            'methods' => 'GET',
            'callback' => 'get_product_slugs',
        ),
        '/products/wheel_tire_package_add_ons' => array(
            'methods' => 'GET',
            'callback' => 'get_wheel_tire_package_add_ons',
            'args' => array(
                'add_spare' => $add_spare_arg,
            ),
        ),
        '/products/categories' => array(
            'methods' => 'GET',
            'callback' => 'get_product_categories',
        ),
        '/products/categories/(?P<slug>[a-zA-Z0-9-]+)' => array(
            'methods' => 'GET',
            'callback' => 'get_product_category',
        ),
        '/products/categories/(?P<slug>[a-zA-Z0-9-]+)/filter_values' => array(
            'methods' => 'GET',
            'callback' => 'get_product_category_filter_values',
        ),
        '/products/categories/(?P<slug>[a-zA-Z0-9-]+)/brands' => array(
            'methods' => 'GET',
            'callback' => 'get_brands_for_category',
        ),
        '/products/brands' => array(
            'methods' => 'GET',
            'callback' => 'get_product_brands_grouped_by_category',
        ),
        '/products/(?P<id>\\d+)' => array(
            'methods' => 'GET',
            'callback' => 'get_product_by_id',
            'args' => array(
                'add_spare' => $add_spare_arg,
                'selected_wheel' => $selected_wheel_arg,
            ),
        ),
        '/products/(?P<slug>[a-zA-Z0-9-]+)' => array(
            'methods' => 'GET',
            'callback' => 'get_product_by_slug',
            'args' => array(
                'add_spare' => $add_spare_arg,
                'selected_wheel' => $selected_wheel_arg,
            ),
        ),
        '/trucks/validate_wheel' => array(
            'methods' => 'POST',
            'callback' => 'validate_truck_wheel',
            'args' => array(
                'wheel_id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'description' => 'The id of the selected wheel'
                ),
                'year' => $truck_year_arg,
                'make' => $truck_make_arg,
                'model' => $truck_model_arg,
                'trim' => $truck_trim_arg,
            ),
        ),
        '/trucks/years' => array(
            'methods' => 'GET',
            'callback' => 'get_all_truck_years',
        ),
        '/trucks/makes' => array(
            'methods' => 'GET',
            'callback' => 'get_truck_makes',
            'args' => array(
                'year' => $truck_year_arg
            ),
        ),
        '/trucks/models' => array(
            'methods' => 'GET',
            'callback' => 'get_truck_models',
            'args' => array(
                'year' => $truck_year_arg,
                'make' => $truck_make_arg,
            ),
        ),
        '/trucks/trims' => array(
            'methods' => 'GET',
            'callback' => 'get_truck_trims',
            'args' => array(
                'year' => $truck_year_arg,
                'make' => $truck_make_arg,
                'model' => $truck_model_arg,
            ),
        ),
        '/trucks/model_bolt_pattern' => array(
            'methods' => 'GET',
            'callback' => 'get_truck_bolt_pattern',
            'args' => array(
                'year' => $truck_year_arg,
                'make' => $truck_make_arg,
                'model' => $truck_model_arg,
                'trim' => $truck_trim_arg,
            ),
        ),
        '/trucks/addTruck' => array(
            'methods' => 'POST',
            'callback' => 'post_truck',
            'args' => array(
                'year' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The user\'s name',
                ),
                'make' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The user\'s email address',
                    'format' => 'email',
                ),
                'model' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'The user\'s phone number',
                ),
                'trim' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The message',
                ),
                'hub' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'The user\'s phone number',
                ),
                'bolt_pattern' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The message',
                ),
            ),
        ),
        '/contact' => array(
            'methods' => 'POST',
            'callback' => 'contact_form_submission',
            'args' => array(
                'name' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The user\'s name',
                ),
                'email' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The user\'s email address',
                    'format' => 'email',
                ),
                'phone_number' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'The user\'s phone number',
                ),
                'message' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The message',
                ),
            ),
        ),
        '/brand_ambassador' => array(
            'methods' => 'POST',
            'callback' => 'brand_ambassador_form_submission',
            'args' => array(
                'first_name' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The applicant\'s first name',
                ),
                'last_name' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The applicant\'s last name',
                ),
                'email' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The applicant\'s email address',
                    'format' => 'email',
                ),
                'phone_number' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The applicant\'s phone number',
                ),
                'city' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The applicant\'s city',
                ),
                'state' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The applicant\'s state',
                ),
                'facebook' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'The applicant\'s Facebook',
                ),
                'instagram' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'The applicant\'s Instagram',
                ),
                'youtube' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'The applicant\'s YouTube',
                ),
                'tiktok' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'The applicant\'s TikTok',
                ),
                'other_social_media' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'The applicant\'s other social media profile(s)',
                ),
                'why_good_fit_message' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Why the applicant thinks they would be a good fit',
                ),
            ),
        ),
        '/quote_request' => array(
            'methods' => 'POST',
            'callback' => 'quote_request_form_submission',
            'args' => array(
                'first_name' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The user\'s first name',
                ),
                'last_name' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The user\'s last name',
                ),
                'email' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The user\'s email address',
                    'format' => 'email',
                ),
                'phone_number' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'The user\'s phone number',
                ),
                'year' => $truck_year_arg,
                'make' => $truck_make_arg,
                'model' => $truck_model_arg,
                'trim' => $truck_trim_arg,
                'message' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The message',
                ),
            ),
        ),
        '/newsletter/subscribe' => array(
            'methods' => 'POST',
            'callback' => 'newsletter_subscribe',
            'args' => array(
                'email' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'The user\'s email address',
                    'format' => 'email',
                ),
            ),
        ),
        '/hydrate_cart' => array(
            'methods' => 'POST',
            'callback' => 'hydrate_cart',
            'args' => array(
                'line_items' => $line_items_arg,
                'wheel_tire_packages' => $wheel_tire_packages_arg,
            ),
        ),
        '/pages/home' => array(
            'methods' => 'GET',
            'callback' => 'home_page_data',
        ),
        '/pages/checkout' => array(
            'methods' => 'GET',
            'callback' => 'checkout_page_data',
            'args' => array(
                'country_code' => $country_code_arg,
            ),
        ),
        '/faqs' => array(
            'methods' => 'GET',
            'callback' => 'get_frequently_asked_questions',
        ),
        '/checkout/shipping_methods' => array(
            'methods' => 'POST',
            'callback' => 'get_shipping_methods',
            'args' => array(
                'wheel_tire_packages' => $wheel_tire_packages_arg,
                'shipping_country' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Shipping address country',
                ),
                'shipping_state' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Shipping address state',
                ),
            ),
        ),
        '/checkout/taxes' => array(
            'methods' => 'POST',
            'callback' => 'calculate_taxes_handler',
            'args' => array(
                'line_items' => $line_items_arg,
                'wheel_tire_packages' => $wheel_tire_packages_arg,
                'billing_country' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Billing address country',
                ),
                'billing_state' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Billing address state',
                ),
            ),
        ),
        '/checkout/discounts' => array(
            'methods' => 'POST',
            'callback' => 'get_discounts',
            'args' => array(
                'wheel_tire_packages' => $wheel_tire_packages_arg,
                'shipping_method_id' => $shipping_method_arg,
            ),
        ),
        '/checkout/states' => array(
            'methods' => 'GET',
            'callback' => 'get_states_for_country',
            'args' => array(
                'country_code' => $country_code_arg,
            ),
        ),
        '/checkout/finish_order_validation' => array(
            'methods' => 'POST',
            'callback' => 'finish_order_validation',
            'args' => array(
                'payment_intent_id' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'ID of the Stripe PaymentIntent for which to finish validation',
                ),
                'order_id' => array(
                    'required' => true,
                    'type' => 'number',
                    'description' => 'ID of the WooCommerce ID for which to finish validation',
                ),
            ),
        ),
        '/checkout/order' => array(
            'methods' => 'POST',
            'callback' => 'create_order',
            'args' => array(
                'currency' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'ISO currency code for order',
                    'enum' => array('USD'),
                ),
                'stripe_payment_method_id' => array(
                    'required' => true,
                    'type' => 'string',
                    'description' => 'ID of the Stripe PaymentMethod to be used',
                ),
                'signup_for_newsletter' => array(
                    'required' => false,
                    'default' => false,
                    'type' => 'boolean',
                    'description' => 'Whether or not to subscribe them to the mailing list',
                ),
                'brand_ambassador_referral' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Name of which brand ambassador this order was referred by',
                ),
                'shipping_method_id' => $shipping_method_arg,
                'line_items' => $line_items_arg,
                'wheel_tire_packages' => $wheel_tire_packages_arg,
                'customer_information' => array(
                    'required' => true,
                    'type' => 'object',
                    'items' => array(
                        'first_name' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'First name of the customer',
                        ),
                        'last_name' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Last name of the customer',
                        ),
                        'email' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Email of the customer',
                        ),
                        'phone_number' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Phone number of the customer',
                        ),
                    ),
                ),
                'billing_address' => array(
                    'required' => true,
                    'type' => 'object',
                    'items' => array(
                        'first_name' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Billing first name',
                        ),
                        'last_name' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Billing last name',
                        ),
                        'line1' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Billing address line 1',
                        ),
                        'line2' => array(
                            'required' => false,
                            'type' => 'string',
                            'default' => '',
                            'description' => 'Billing address line 2',
                        ),
                        'city' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Billing address city',
                        ),
                        'state' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Billing address state',
                        ),
                        'postal_code' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Billing address postal code',
                        ),
                        'country' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Billing address country',
                        ),
                    ),
                ),
                'shipping_address' => array(
                    'required' => true,
                    'type' => 'object',
                    'items' => array(
                        'first_name' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Shipping first name',
                        ),
                        'last_name' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Shipping last name',
                        ),
                        'line1' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Shipping address line 1',
                        ),
                        'line2' => array(
                            'required' => false,
                            'type' => 'string',
                            'default' => '',
                            'description' => 'Shipping address line 2',
                        ),
                        'city' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Shipping address city',
                        ),
                        'state' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Shipping address state',
                        ),
                        'postal_code' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Shipping address postal code',
                        ),
                        'country' => array(
                            'required' => true,
                            'type' => 'string',
                            'description' => 'Shipping address country',
                        ),
                    ),
                ),
            ),
        ),
        '/checkout/package_price' => array(
            'methods' => 'POST',
            'callback' => 'package_price',
            'args' => array(
                'quantity' => array(
                    'required' => false,
                    'type' => 'number',
                    'description' => 'Package quantity',
                    'default' => 1
                ),
                'wheel_id' => array(
                    'required' => true,
                    'type' => 'number',
                    'description' => 'Wheel Product ID',
                ),
                'tire_id' => array(
                    'required' => true,
                    'type' => 'number',
                    'description' => 'Tire Product ID',
                ),
                'add_spire' => array(
                    'required' => false,
                    'type' => 'boolean',
                    'description' => 'Add spire to package',
                    'default' => false
                ),
            ),
        ),
    );

    foreach ($routes as $route => $args) {
        register_rest_route($API_NAMESPACE, $route, $args);
    }
}

add_action('rest_api_init', 'allow_cors', 15);
add_action('rest_api_init', 'register_custom_endpoints');
