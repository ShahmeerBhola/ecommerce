<?php


require_once(__DIR__ . '/../utils.php');


function brand_ambassador_form_submission($request)
{
    $successful = send_email(
        array(FORM_SUBMISSION_TO_EMAIL),
        'Brand Ambassador Form Submission',
        'brand_ambassador.html',
        array(
            'first_name' => $request['first_name'],
            'last_name' => $request['last_name'],
            'email' => $request['email'],
            'phone_number' => $request['phone_number'],
            'city' => $request['city'],
            'state' => $request['state'],
            'facebook' => $request['facebook'],
            'instagram' => $request['instagram'],
            'youtube' => $request['youtube'],
            'tiktok' => $request['tiktok'],
            'other_social_media' => $request['other_social_media'],
            'why_good_fit_message' => $request['why_good_fit_message'],
        )
    );
    return make_response(array('successful' => $successful));
}
