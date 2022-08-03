<?php


require_once(__DIR__ . '/../utils.php');


function newsletter_subscribe($request)
{
    $successful = subscribe_email_to_newsletter($request['email']);
    return make_response(array('successful' => $successful));
}
