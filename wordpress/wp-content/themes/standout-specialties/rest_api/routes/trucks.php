<?php

require_once(__DIR__ . '/../utils.php');

function get_all_truck_years($request)
{
    return make_response(_get_truck_years());
}

function _get_sorted_truck_values($query)
{
    global $wpdb;

    $data = array();
    foreach ($wpdb->get_results($query) as $result) {
        array_push($data, $result->value);
    }

    natsort($data);
    return array_values($data);
}


function get_truck_makes($request)
{
    return make_response(_get_sorted_truck_values("
        SELECT
            DISTINCT make AS value
        FROM trucks
        WHERE
            year = '" . $request['year'] . "'
        ORDER BY
            make ASC
    "));
}

// function get_truck_makes($request)
// {
//     return make_response(_get_sorted_truck_values("
//         SELECT
//             DISTINCT make AS value
//         FROM trucks
//         WHERE
//             year = '" . $request['year'] . "'
//         ORDER BY
//             make ASC
//     "));
// }

function get_truck_models($request)
{
    return make_response(_get_sorted_truck_values("
        SELECT
            DISTINCT model AS value
        FROM trucks
        WHERE
            year = '" . $request['year'] . "'
            AND make = '" . $request['make'] . "'
        ORDER BY
            model ASC
    "));
}


function get_truck_trims($request)
{
    return make_response(_get_sorted_truck_values("
        SELECT
            DISTINCT trim AS value
        FROM trucks
        WHERE
            year = '" . $request['year'] . "'
            AND make = '" . $request['make'] . "'
            AND model = '" . $request['model'] . "'
        ORDER BY
            trim ASC
    "));
}

function validate_truck_wheel($request)
{
    global $wpdb;

    $truck_bolt_pattern_query = "
            SELECT
                bolt_pattern
            FROM trucks
            WHERE
                year = '" . $request['year'] . "'
                AND make = '" . $request['make'] . "'
                AND model = '" . $request['model'] . "'
                AND trim = '" . $request['trim'] . "'
        ";

    $truck_results = $wpdb->get_results($truck_bolt_pattern_query);
    if (empty($truck_results)) {
        return make_response(false);
    }
    $truck_bolt_pattern = $truck_results[0]->bolt_pattern;
    // error_log($truck_bolt_pattern);
    $cross_compatible_bolt_pattern = retrieve_compatible_bolt_pattern_size($truck_bolt_pattern);
    $or_compatible_bolt_pattern_query = empty($cross_compatible_bolt_pattern) ? "" :
        "OR meta_value LIKE '%" . $cross_compatible_bolt_pattern . "%'";
    $query = "
        SELECT
            DISTINCT post_id AS id
        FROM `" . $wpdb->prefix . "postmeta`
        WHERE
            meta_key = 'bolt_pattern'
            AND (
                meta_value LIKE '%" . $truck_bolt_pattern . "%' "
        . $or_compatible_bolt_pattern_query .
        ")";

    $wheel_results = $wpdb->get_results($query);
    // error_log(print_r($wheel_results, true));
    if (empty($wheel_results)) {
        return make_response(false);
    }

    // error_log('wheel_id: ' . $request['wheel_id']);
    foreach ($wheel_results as $wheel) {
        if ($request['wheel_id'] == $wheel->id) {
            // error_log('Found the wheel!');
            return make_response(true);
        }
    }
    return make_response(false);
}

function get_truck_bolt_pattern($request)
{

    $bolt_pattern = _get_truck_bolt($request['year'], $request['make'], $request['model'], $request['trim']);

   return make_response($bolt_pattern);
}

function post_truck($request)
{
    if(isset($_POST['insert']))
    {
        $y=$_POST[.$request['year'],]
        $m=$_POST[.$request['make'].]
        $d=$_POST[.$request['model'].]
        $t=$_POST[.$request['trim'].]
        $h=$_POST[.$request['hub'].]
        $b=$_POST[.$request['bolt_pattern'].]
        global $wpdb;
        $sql=$wpdb->insert('trucks',array("year"=>$y,"make"=>$m,"model"=>$d,"trim"=>$t,"hub"=>$h,"bolt_pattern"=>$b))
        if($sql==true){
            return make_response(array('successful' => $sql));
        }
        else{
            return make_response(array('successful' => $sql));
        }

    }
    
    // successful= "
    // INSERT INTO TRUCKS (year, make, model, trim, hub, bolt_pattern) VALUES
    //     (" . $request['year'] . "," . $request['make'] . "," . $request['model'] . ", " . $request['trim'] . "," . $request['hub'] . "," . $request['bolt_pattern'] . ")"
}
