<?php

if (is_admin()) {
    // This would be either a request to the homepage
    // or a request to any other page besides an API endpoint
    // we infer this by whether or not the URL contains 'wp-json', if it does than it must be an API request)
    require_once(dirname(__FILE__) . '/admin/index.php');
}
// TODO remove true from the if statement below
if(true || wp_is_json_request()) {
    // Request to the REST API
    require_once(dirname(__FILE__) . '/rest_api/index.php');
}

require_once(dirname(__FILE__) . '/shipping.php');
require_once(dirname(__FILE__) . '/product_search_wp_query_filters.php');