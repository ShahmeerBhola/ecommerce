<?php


if (class_exists('WC_Shipping_Method')) {
    /**
     * Inspired by
     * https://code.tutsplus.com/tutorials/create-a-custom-shipping-method-for-woocommerce--cms-26098
     */
    class SOS_Shipping_Method extends WC_Shipping_Method
    {
        public function calculate_shipping($package = array())
        {
            /**
             * Currently this will be free for all packages. If we decide to charge shipping later we'll have to change that here
             * Aaron on 18 June 2020: And free shipping on everything I’ll just adjust the prices
             */
            $this->add_rate(array(
                'id' => $this->id,
                'label' => $this->title,
                'cost' => 0,
                'taxes' => false,
            ));
        }

        public function get_rates_for_package($package)
        {
            /**
             * Right now we'll only have 1 rate.. if we decide to change this in the future we'll need to change this
             */
            $this->rates = array();
            $this->calculate_shipping($package);
            if (!empty($this->rates)) {
                return $this->rates[$this->id];
            }
            return $this->rates;
        }
    }


    class SOS_Standard_Shipping_Method extends SOS_Shipping_Method
    {
        public function __construct()
        {
            $this->id = 'standard-shipping';
            $this->method_title = 'Standard Shipping';
            $this->method_description = 'Standard Shipping Method. Free for Wheel & Tire packages.';
            $this->supports = array('shipping-zones');  // Other options.. 'settings', 'instance-settings-modal'
            $this->enabled = 'yes';
            $this->title = 'Standard Shipping';

            $this->init_settings();

            // Save settings in admin if you have any defined
            add_action('woocommerce_update_options_shipping_' . $this->id, array($this, 'process_admin_options'));
        }
    }

    class SOS_Local_Pickup_Shipping_Method extends SOS_Shipping_Method
    {
        public function __construct()
        {
            $this->id = 'local-pickup';
            $this->method_title = 'Local Pickup';
            $this->method_description = 'Local Pickup Method';
            $this->supports = array('shipping-zones');  // Other options.. 'settings', 'instance-settings-modal'
            $this->enabled = 'yes';
            $this->title = 'Local Pickup';

            $this->init_settings();

            // Save settings in admin if you have any defined
            add_action('woocommerce_update_options_shipping_' . $this->id, array($this, 'process_admin_options'));
        }
    }


    function add_shipping_methods($methods)
    {
        // https://www.tychesoftwares.com/creating-a-new-shipping-method-and-exploring-the-shipping-method-api-of-woocommerce/
        return array(
            'standard-shipping' => 'SOS_Standard_Shipping_Method',
            'local-pickup' => 'SOS_Local_Pickup_Shipping_Method',
        );
    }


    function define_continential_us_shipping_zone()
    {
        $zone_name = 'continential-us';
        $disallowed_states = get_disallowed_us_shipping_states();
        $already_exists = false;

        foreach (WC_Shipping_Zones::get_zones() as $key => $zone) {
            if ($zone['zone_name'] === $zone_name) {
                $already_exists = true;
                break;
            }
        }

        if (!$already_exists) {
            $zone = new WC_Shipping_Zone();
            $wc_countries = new WC_Countries();
            $locations = $wc_countries->get_states('US');

            foreach ($locations as $code => $state) {
                if (in_array($code, $disallowed_states)) {
                    unset($locations[$code]);
                }
            }

            $zone->set_zone_name('continential-us');
            $zone->set_locations($locations);
            $zone->add_shipping_method('local-pickup');
            $zone->add_shipping_method('standard-shipping');
            $zone->save();
        }
    }


    add_filter('woocommerce_shipping_methods', 'add_shipping_methods');
    // https://github.com/woocommerce/woocommerce/issues/21279#issuecomment-418708498
    add_action('wp_loaded', 'define_continential_us_shipping_zone');
}


function get_disallowed_us_shipping_states()
{
    // HI = Hawaii
    // AK = Alaska
    // AA = Armed Forces (AA)
    // AE = Armed Forces (AE)
    // AP = Armed Forces (AP)
    return array('HI', 'AK', 'AA', 'AE', 'AP');
}
