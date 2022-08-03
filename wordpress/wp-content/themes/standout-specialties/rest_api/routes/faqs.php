<?php


require_once(__DIR__ . '/../utils.php');


function get_frequently_asked_questions($request)
{
    $data = array();
    foreach (get_all_published_posts_by_type('faq')->posts as $faq) {
        array_push($data, serialize_faq($faq));
    }
    return make_response($data);
}
