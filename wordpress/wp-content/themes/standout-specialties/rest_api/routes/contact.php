<?php


require_once(__DIR__ . '/../utils.php');


function contact_form_submission($request)
{
    $successful = send_email(
        array(FORM_SUBMISSION_TO_EMAIL),
        'Website Contact Form Submission',
        'contact.html',
        array(
            'name' => $request['name'],
            'email' => $request['email'],
            'phone_number' => $request['phone_number'],
            'message' => $request['message'],
        )
    );
    return make_response(array('successful' => $successful));
}
