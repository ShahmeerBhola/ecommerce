<?php


require_once(__DIR__ . '/../utils.php');


function quote_request_form_submission($request)
{
    $successful = send_email(
        array(FORM_SUBMISSION_TO_EMAIL),
        'Website Quote Request',
        'request_quote.html',
        array(
            'first_name' => $request['first_name'],
            'last_name' => $request['last_name'],
            'email' => $request['email'],
            'phone_number' => $request['phone_number'],
            'year' => $request['year'],
            'make' => $request['make'],
            'model' => $request['model'],
            'trim' => $request['trim'],
            'message' => $request['message'],
        )
    );
    return make_response(array('successful' => $successful));
}
