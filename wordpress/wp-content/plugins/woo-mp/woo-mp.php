<?php

/**
 * Plugin Name: WooCommerce Manual Payment
 * Description: Process payments from the WooCommerce Edit Order screen.
 * Version: 2.6.8
 * Author: bfl
 * Text Domain: woo-mp
 * WC requires at least: 3.0
 * WC tested up to: 5
 */

defined( 'ABSPATH' ) || die;

if ( ( ! is_admin() && ( ! defined( 'DOING_CRON' ) || ! DOING_CRON ) ) || is_network_admin() ) {
    return;
}

define( 'WOO_MP_VERSION', '2.6.8' );
define( 'WOO_MP_PRO_COMPAT_VERSION', 7 );
define( 'WOO_MP_PATH', dirname( __FILE__ ) );
define( 'WOO_MP_URL', plugins_url( '', __FILE__ ) );
define( 'WOO_MP_BASENAME', basename( dirname( __FILE__ ) ) . '/' . basename( __FILE__ ) );

require WOO_MP_PATH . '/includes/woo-mp-requirement-checks.php';

if ( ! Woo_MP_Requirement_Checks::run() ) {
    return;
}

require WOO_MP_PATH . '/includes/bootstrap.php';
