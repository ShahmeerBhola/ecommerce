<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_ADMIN_Webhooks' ) ) {
	class S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_ADMIN_Webhooks {
		protected $settings;
		protected $process;
		protected $process_for_update;

		public function __construct() {
			$this->settings = new VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA();
			add_action( 'admin_menu', array( $this, 'admin_menu' ), 16 );
			add_action( 'admin_init', array( $this, 'save_options' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
			add_action( 'rest_api_init', array( $this, 'register_api' ) );
		}

		public function save_options() {
			global $s2w_settings;
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}
			if ( ! isset( $_POST['s2w_save_webhooks_options'] ) || ! $_POST['s2w_save_webhooks_options'] ) {
				return;
			}
			if ( ! isset( $_POST['_s2w_nonce'] ) || ! wp_verify_nonce( $_POST['_s2w_nonce'], 's2w_action_nonce' ) ) {
				return;
			}
			$args = array(
				'webhooks_shared_secret'    => isset( $_POST['s2w_webhooks_shared_secret'] ) ? sanitize_text_field( $_POST['s2w_webhooks_shared_secret'] ) : '',
				'webhooks_orders_enable'    => isset( $_POST['s2w_webhooks_orders_enable'] ) ? sanitize_text_field( $_POST['s2w_webhooks_orders_enable'] ) : '',
				'webhooks_products_enable'  => isset( $_POST['s2w_webhooks_products_enable'] ) ? sanitize_text_field( $_POST['s2w_webhooks_products_enable'] ) : '',
				'webhooks_customers_enable' => isset( $_POST['s2w_webhooks_customers_enable'] ) ? sanitize_text_field( $_POST['s2w_webhooks_customers_enable'] ) : '',
				'webhooks_orders_options'   => isset( $_POST['s2w_webhooks_orders_options'] ) ? array_map( 'stripslashes', $_POST['s2w_webhooks_orders_options'] ) : array(),
				'webhooks_products_options' => isset( $_POST['s2w_webhooks_products_options'] ) ? array_map( 'stripslashes', $_POST['s2w_webhooks_products_options'] ) : array(),
			);
			VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::update_option( 's2w_params', array_merge( $this->settings->get_params(), $args ) );
			$s2w_settings   = $args;
			$this->settings = new VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA();
		}

		public function admin_enqueue_scripts() {
			global $pagenow;
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}
			$page = isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : '';
			if ( $pagenow === 'admin.php' && $page === 's2w-import-shopify-to-woocommerce-webhooks' ) {
				$this->enqueue_semantic();
				wp_enqueue_style( 's2w-import-shopify-to-woocommerce-webhooks', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'webhooks.css' );
				wp_enqueue_script( 's2w-import-shopify-to-woocommerce-webhooks', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_JS . 'webhooks.js', array( 'jquery' ), VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_VERSION );
			}
		}

		public function enqueue_semantic() {
			/*Stylesheet*/
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-form', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'form.min.css' );
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-table', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'table.min.css' );
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-icon', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'icon.min.css' );
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-segment', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'segment.min.css' );
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-button', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'button.min.css' );
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-label', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'label.min.css' );
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-input', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'input.min.css' );
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-checkbox', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'checkbox.min.css' );
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-transition', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'transition.min.css' );
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-dropdown', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'dropdown.min.css' );
			wp_enqueue_style( 's2w-import-shopify-to-woocommerce-message', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'message.min.css' );
			wp_enqueue_style( 'select2', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'select2.min.css' );
			wp_enqueue_script( 'select2-v4', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_JS . 'select2.js', array( 'jquery' ) );
			wp_enqueue_script( 's2w-import-shopify-to-woocommerce-transition', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_JS . 'transition.min.js' );
			wp_enqueue_script( 's2w-import-shopify-to-woocommerce-dropdown', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_JS . 'dropdown.min.js' );
		}

		public function admin_menu() {
			add_submenu_page( 's2w-import-shopify-to-woocommerce', esc_html__( 'Webhooks', 's2w-import-shopify-to-woocommerce' ), esc_html__( 'Webhooks', 's2w-import-shopify-to-woocommerce' ), 'manage_options', 's2w-import-shopify-to-woocommerce-webhooks', array(
				$this,
				'page_callback'
			) );
		}

		public function page_callback() {
			?>
            <div class="wrap">
                <h2><?php esc_html_e( 'Webhooks', 's2w-import-shopify-to-woocommerce' ) ?></h2>
				<?php S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE::security_recommendation_html(); ?>
                <p></p>
                <form class="vi-ui form" method="post">
					<?php wp_nonce_field( 's2w_action_nonce', '_s2w_nonce' ); ?>
                    <div class="vi-ui segment">
                        <table class="form-table">
                            <tbody>
                            <tr>
                                <th>
                                    <label for="<?php echo esc_attr( self::set( 'webhooks_shared_secret' ) ) ?>"><?php esc_html_e( 'Webhooks shared secret', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                </th>
                                <td>
                                    <input type="text"
                                           class="<?php echo esc_attr( self::set( 'webhooks_shared_secret' ) ) ?>"
                                           name="<?php echo esc_attr( self::set( 'webhooks_shared_secret', true ) ) ?>"
                                           id="<?php echo esc_attr( self::set( 'webhooks_shared_secret' ) ) ?>"
                                           value="<?php echo esc_attr( htmlentities( $this->settings->get_params( 'webhooks_shared_secret' ) ) ) ?>">
                                    <div class="vi-ui positive message">
                                        <ul class="list">
                                            <li><?php echo wp_kses_post( __( 'You can find your shared secret within the message at the bottom of Notifications settings in your Shopify admin: "All your webhooks will be signed with <strong>{your_shared_secret}</strong> so you can verify their integrity."', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                                            <li><?php echo wp_kses_post( __( 'You must create at least 1 webhook to see the shared secret', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                                            <li><?php echo wp_kses_post( __( 'Please read the <a href="http://docs.villatheme.com/import-shopify-to-woocommerce/#set_up_child_menu_4124" target="_blank">docs</a> for more details', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <div class="vi-ui segment">
                            <table class="form-table">
                                <tbody>
                                <tr>
                                    <th>
                                        <label for="<?php echo esc_attr( self::set( 'webhooks_orders_enable' ) ) ?>"><?php esc_html_e( 'Orders', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                    </th>
                                    <td>
                                        <div class="vi-ui toggle checkbox">
                                            <input type="checkbox"
                                                   name="<?php echo esc_attr( self::set( 'webhooks_orders_enable', true ) ) ?>"
                                                   id="<?php echo esc_attr( self::set( 'webhooks_orders_enable' ) ) ?>"
                                                   value="1" <?php checked( $this->settings->get_params( 'webhooks_orders_enable' ), '1' ) ?>>
                                            <label for="<?php echo esc_attr( self::set( 'webhooks_orders_enable' ) ) ?>"><?php esc_html_e( 'Enable', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <label for="<?php echo esc_attr( self::set( 'webhooks_orders_options' ) ) ?>"><?php esc_html_e( 'Update which?', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                    </th>
                                    <td>
										<?php
										$all_options             = array(
											'order_status'     => esc_html__( 'Order status', 's2w-import-shopify-to-woocommerce' ),
											'order_date'       => esc_html__( 'Order date', 's2w-import-shopify-to-woocommerce' ),
											'fulfillments'     => esc_html__( 'Order fulfillments', 's2w-import-shopify-to-woocommerce' ),
											'billing_address'  => esc_html__( 'Billing address', 's2w-import-shopify-to-woocommerce' ),
											'shipping_address' => esc_html__( 'Shipping address', 's2w-import-shopify-to-woocommerce' ),
											'line_items'       => esc_html__( 'Line items', 's2w-import-shopify-to-woocommerce' ),
										);
										$webhooks_orders_options = $this->settings->get_params( 'webhooks_orders_options' );
										?>
                                        <select id="<?php echo esc_attr( self::set( 'webhooks_orders_options' ) ) ?>"
                                                class="vi-ui fluid dropdown"
                                                name="<?php echo esc_attr( self::set( 'webhooks_orders_options', true ) ) ?>[]"
                                                multiple="multiple">
											<?php
											foreach ( $all_options as $all_option_k => $all_option_v ) {
												?>
                                                <option value="<?php echo esc_attr( $all_option_k ) ?>" <?php if ( in_array( $all_option_k, $webhooks_orders_options ) ) {
													echo esc_attr( 'selected' );
												} ?>><?php echo esc_html( $all_option_v ) ?></option>
												<?php
											}
											?>
                                        </select>
                                        <div class="description"><?php esc_html_e( 'This option is used for updating order via webhook', 's2w-import-shopify-to-woocommerce' ) ?></div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <label><?php esc_html_e( 'Orders Webhook URL', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                    </th>
                                    <td>
                                        <div class="vi-ui fluid right labeled input <?php echo esc_attr( self::set( 'webhooks-url-container' ) ) ?>">
                                            <input type="text" readonly
                                                   class="<?php echo esc_attr( self::set( 'webhooks-url' ) ) ?>"
                                                   value="<?php echo esc_url( get_site_url( null, 'wp-json/s2w-import-shopify-to-woocommerce/orders' ) ) ?>">
                                            <i class="check green icon"></i>
                                            <label class="vi-ui label"><span
                                                        class="vi-ui tiny positive button <?php echo esc_attr( self::set( 'webhooks-url-copy' ) ) ?>"><?php esc_html_e( 'Copy', 's2w-import-shopify-to-woocommerce' ) ?></span></label>
                                        </div>
                                        <div class="vi-ui positive message">
                                            <ul class="list">
                                                <li><?php echo wp_kses_post( __( 'If you want to <strong>only import new order when one is created</strong> at your Shopify store, create a webhook with event <strong>Order Creation</strong> and use this URL for the webhook URL.', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                                                <li><?php echo wp_kses_post( __( 'If you want to both <strong>create new order when one is created and update existing order when one is updated</strong> at your Shopify store, create a webhook with event <strong>Order Update</strong> and use this URL for the webhook URL.', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="vi-ui segment">
                            <table class="form-table">
                                <tbody>
                                <tr>
                                    <th>
                                        <label for="<?php echo esc_attr( self::set( 'webhooks_products_enable' ) ) ?>"><?php esc_html_e( 'Products', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                    </th>
                                    <td>
                                        <div class="vi-ui toggle checkbox">
                                            <input type="checkbox"
                                                   name="<?php echo esc_attr( self::set( 'webhooks_products_enable', true ) ) ?>"
                                                   id="<?php echo esc_attr( self::set( 'webhooks_products_enable' ) ) ?>"
                                                   value="1" <?php checked( $this->settings->get_params( 'webhooks_products_enable' ), '1' ) ?>>
                                            <label for="<?php echo esc_attr( self::set( 'webhooks_products_enable' ) ) ?>"><?php esc_html_e( 'Enable', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <label for="<?php echo esc_attr( self::set( 'webhooks_products_options' ) ) ?>"><?php esc_html_e( 'Update which?', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                    </th>
                                    <td>
										<?php
										$all_options               = array(
											'title'                => esc_html__( 'Product title', 's2w-import-shopify-to-woocommerce' ),
											'price'                => esc_html__( 'Product price', 's2w-import-shopify-to-woocommerce' ),
											'inventory'            => esc_html__( 'Product inventory', 's2w-import-shopify-to-woocommerce' ),
											'description'          => esc_html__( 'Product description', 's2w-import-shopify-to-woocommerce' ),
											'images'               => esc_html__( 'Product images', 's2w-import-shopify-to-woocommerce' ),
											'variation_attributes' => esc_html__( 'Variation attributes', 's2w-import-shopify-to-woocommerce' ),
											'variation_sku'        => esc_html__( 'Variation SKU', 's2w-import-shopify-to-woocommerce' ),
											'product_url'          => esc_html__( 'Product slug', 's2w-import-shopify-to-woocommerce' ),
										);
										$webhooks_products_options = $this->settings->get_params( 'webhooks_products_options' );
										?>
                                        <select id="<?php echo esc_attr( self::set( 'webhooks_products_options' ) ) ?>"
                                                class="vi-ui fluid dropdown"
                                                name="<?php echo esc_attr( self::set( 'webhooks_products_options', true ) ) ?>[]"
                                                multiple="multiple">
											<?php
											foreach ( $all_options as $all_option_k => $all_option_v ) {
												?>
                                                <option value="<?php echo esc_attr( $all_option_k ) ?>" <?php if ( in_array( $all_option_k, $webhooks_products_options ) ) {
													echo esc_attr( 'selected' );
												} ?>><?php echo esc_html( $all_option_v ) ?></option>
												<?php
											}
											?>
                                        </select>
                                        <div class="description"><?php esc_html_e( 'This option is used for updating product via webhook', 's2w-import-shopify-to-woocommerce' ) ?></div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <label><?php esc_html_e( 'Products Webhook URL', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                    </th>
                                    <td>
                                        <div class="vi-ui fluid right labeled input <?php echo esc_attr( self::set( 'webhooks-url-container' ) ) ?>">
                                            <input type="text" readonly
                                                   class="<?php echo esc_attr( self::set( 'webhooks-url' ) ) ?>"
                                                   value="<?php echo esc_url( get_site_url( null, 'wp-json/s2w-import-shopify-to-woocommerce/products' ) ) ?>">
                                            <i class="check green icon"></i>
                                            <label class="vi-ui label"><span
                                                        class="vi-ui tiny positive button <?php echo esc_attr( self::set( 'webhooks-url-copy' ) ) ?>"><?php esc_html_e( 'Copy', 's2w-import-shopify-to-woocommerce' ) ?></span></label>
                                        </div>
                                        <div class="vi-ui positive message">
                                            <ul class="list">
                                                <li><?php echo wp_kses_post( __( 'If you want to <strong>only import new product when one is created</strong> at your Shopify store, create a webhook with event <strong>Product Creation</strong> and use this URL for the webhook URL.', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                                                <li><?php echo wp_kses_post( __( 'If you want to both <strong>create new product when one is created and update existing product when one is updated</strong> at your Shopify store, create a webhook with event <strong>Product Update</strong> and use this URL for the webhook URL.', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="vi-ui segment">
                            <table class="form-table">
                                <tbody>
                                <tr>
                                    <th>
                                        <label for="<?php echo esc_attr( self::set( 'webhooks_customers_enable' ) ) ?>"><?php esc_html_e( 'Customers', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                    </th>
                                    <td>
                                        <div class="vi-ui toggle checkbox">
                                            <input type="checkbox"
                                                   name="<?php echo esc_attr( self::set( 'webhooks_customers_enable', true ) ) ?>"
                                                   id="<?php echo esc_attr( self::set( 'webhooks_customers_enable' ) ) ?>"
                                                   value="1" <?php checked( $this->settings->get_params( 'webhooks_customers_enable' ), '1' ) ?>>
                                            <label for="<?php echo esc_attr( self::set( 'webhooks_customers_enable' ) ) ?>"><?php esc_html_e( 'Enable', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>
                                        <label><?php esc_html_e( 'Customers Webhook URL', 's2w-import-shopify-to-woocommerce' ) ?></label>
                                    </th>
                                    <td>
                                        <div class="vi-ui fluid right labeled input <?php echo esc_attr( self::set( 'webhooks-url-container' ) ) ?>">
                                            <input type="text" readonly
                                                   class="<?php echo esc_attr( self::set( 'webhooks-url' ) ) ?>"
                                                   value="<?php echo esc_url( get_site_url( null, 'wp-json/s2w-import-shopify-to-woocommerce/customers' ) ) ?>">
                                            <i class="check green icon"></i>
                                            <label class="vi-ui label"><span
                                                        class="vi-ui tiny positive button <?php echo esc_attr( self::set( 'webhooks-url-copy' ) ) ?>"><?php esc_html_e( 'Copy', 's2w-import-shopify-to-woocommerce' ) ?></span></label>
                                        </div>
                                        <div class="vi-ui positive message">
                                            <ul class="list">
                                                <li><?php echo wp_kses_post( __( 'If you want to <strong>only import new customer when one is created</strong> at your Shopify store, create a webhook with event <strong>Customer Creation</strong> and use this URL for the webhook URL.', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                                                <li><?php echo wp_kses_post( __( 'If you want to both <strong>create new customer when one is created and update existing customer when one is updated</strong> at your Shopify store, create a webhook with event <strong>Customer Update</strong> and use this URL for the webhook URL.', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <p>
                        <input type="submit" class="vi-ui button primary" name="s2w_save_webhooks_options"
                               value="<?php esc_html_e( 'Save', 's2w-import-shopify-to-woocommerce' ) ?> "/>
                    </p>
                </form>
            </div>
			<?php
		}

		public function register_api() {
			register_rest_route(
				's2w-import-shopify-to-woocommerce', '/orders', array(
					'methods'  => 'POST',
					'callback' => array( $this, 'process_orders' ),
				)
			);
			register_rest_route(
				's2w-import-shopify-to-woocommerce', '/products', array(
					'methods'  => 'POST',
					'callback' => array( $this, 'process_products' ),
				)
			);
			register_rest_route(
				's2w-import-shopify-to-woocommerce', '/customers', array(
					'methods'  => 'POST',
					'callback' => array( $this, 'process_customers' ),
				)
			);
		}

		/**
		 * @param $request WP_REST_Request
		 *
		 * @throws Exception
		 */
		public function process_customers( $request ) {
			$domain                    = $this->settings->get_params( 'domain' );
			$api_key                   = $this->settings->get_params( 'api_key' );
			$api_secret                = $this->settings->get_params( 'api_secret' );
			$shared_secret             = $this->settings->get_params( 'webhooks_shared_secret' );
			$webhooks_customers_enable = $this->settings->get_params( 'webhooks_customers_enable' );
			$hmac_header               = $request->get_header( 'x_shopify_hmac_sha256' );
			$topic_header              = $request->get_header( 'x_shopify_topic' );
			$user_agent                = $request->get_header( 'user_agent' );
			$data                      = file_get_contents( 'php://input' );
			$path                      = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::get_cache_path( $domain, $api_key, $api_secret ) . '/';
			if ( self::verify_webhook( $data, $hmac_header, $shared_secret ) ) {
				if ( ! $webhooks_customers_enable ) {
					self::log( $path, 'Customers webhook is currently disabled' );
				} else {
					$customer_data = vi_s2w_json_decode( $data );
					if ( ! empty( $customer_data['id'] ) ) {
						switch ( $topic_header ) {
							case 'customers/create':
								if ( strtolower( $user_agent ) === 'ruby' ) {
									self::log( $path, 'Test Customer creation webhook: Successful' );
								} else {
									$this->create_customer( $customer_data, $path );
								}
								break;
							case 'customers/update':
								if ( strtolower( $user_agent ) === 'ruby' ) {
									self::log( $path, 'Test Customer update webhook: Successful' );
								} else {
									$this->update_customer( $customer_data, $path );
								}
								break;
							default:
								self::log( $path, "Wrong webhook request to customers: {$topic_header}" );
						}
					}
				}
			} else {

				self::log( $path, 'Unverified Webhook call' );
			}
		}

		/**
		 * @param $customer_data
		 * @param $path
		 *
		 * @throws Exception
		 */
		public function update_customer( $customer_data, $path ) {
			$existing_id = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::customer_get_id_by_shopify_id( $customer_data['id'] );
			if ( $existing_id ) {
				$default_address = empty( $customer['default_address'] ) ? $customer['address'] : $customer['default_address'];
				$customer        = wp_parse_args( array(
					'first_name' => $customer_data['first_name'],
					'last_name'  => $customer_data['last_name'],
					'phone'      => $customer_data['phone'],
				), $default_address );
				$wc_customer     = new WC_Customer( $existing_id );
				$wc_customer->set_first_name( $customer['first_name'] );
				$wc_customer->set_shipping_first_name( $customer['first_name'] );
				$wc_customer->set_last_name( $customer['last_name'] );
				$wc_customer->set_shipping_last_name( $customer['last_name'] );
				$wc_customer->set_billing_phone( $customer['phone'] );
				$wc_customer->set_billing_company( $customer['company'] );
				$wc_customer->set_shipping_company( $customer['company'] );
				$wc_customer->set_billing_address_1( $customer['address1'] );
				$wc_customer->set_shipping_address_1( $customer['address1'] );
				$wc_customer->set_billing_address_2( $customer['address2'] );
				$wc_customer->set_shipping_address_2( $customer['address2'] );
				$wc_customer->set_billing_city( $customer['city'] );
				$wc_customer->set_shipping_city( $customer['city'] );
				$wc_customer->set_billing_state( $customer['province'] );
				$wc_customer->set_shipping_state( $customer['province'] );
				$wc_customer->set_billing_country( $customer['country'] );
				$wc_customer->set_shipping_country( $customer['country'] );
				$wc_customer->set_billing_postcode( $customer['zip'] );
				$wc_customer->set_shipping_postcode( $customer['zip'] );
				$wc_customer->save();
				self::log( $path, "Customer #{$existing_id} was successfully synced" );
			} else {
				$this->create_customer( $customer_data, $path );
			}
		}

		/**
		 * @param $customer_data
		 * @param $path
		 *
		 * @throws Exception
		 */
		public function create_customer( $customer_data, $path ) {
			$email = sanitize_email( $customer_data['email'] );
			if ( $email && ! isset( $customers_emails[ $customer_data['id'] ] ) ) {
				$customers_emails[ strval( $customer_data['id'] ) ] = $email;
			}
			$default_address = empty( $customer['default_address'] ) ? $customer['address'] : $customer['default_address'];
			$customer        = wp_parse_args( array(
				'first_name' => $customer_data['first_name'],
				'last_name'  => $customer_data['last_name'],
				'phone'      => $customer_data['phone'],
			), $default_address );
			$new_user_args   = array( 'role' => $this->settings->get_params( 'customers_role' ) );
			if ( ! empty( $customer_data['first_name'] ) ) {
				$new_user_args['first_name'] = $customer_data['first_name'];
			}
			if ( ! empty( $customer_data['last_name'] ) ) {
				$new_user_args['last_name'] = $customer_data['last_name'];
			}
			$user_id = S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE::wc_create_new_customer( $email, $customer_data['id'], '', '', $new_user_args );
			if ( ! is_wp_error( $user_id ) ) {
				$wc_customer = new WC_Customer( $user_id );
				$wc_customer->set_first_name( $customer['first_name'] );
				$wc_customer->set_shipping_first_name( $customer['first_name'] );
				$wc_customer->set_last_name( $customer['last_name'] );
				$wc_customer->set_shipping_last_name( $customer['last_name'] );
				$wc_customer->set_billing_phone( $customer['phone'] );
				$wc_customer->set_billing_company( $customer['company'] );
				$wc_customer->set_shipping_company( $customer['company'] );
				$wc_customer->set_billing_address_1( $customer['address1'] );
				$wc_customer->set_shipping_address_1( $customer['address1'] );
				$wc_customer->set_billing_address_2( $customer['address2'] );
				$wc_customer->set_shipping_address_2( $customer['address2'] );
				$wc_customer->set_billing_city( $customer['city'] );
				$wc_customer->set_shipping_city( $customer['city'] );
				$wc_customer->set_billing_state( $customer['province'] );
				$wc_customer->set_shipping_state( $customer['province'] );
				$wc_customer->set_billing_country( $customer['country'] );
				$wc_customer->set_shipping_country( $customer['country'] );
				$wc_customer->set_billing_postcode( $customer['zip'] );
				$wc_customer->set_shipping_postcode( $customer['zip'] );
				$wc_customer->save();
				self::log( $path, "Customer #{$user_id} was imported from Shopify #{$customer_data['id']}" );
			} else {
				self::log( $path, "Failed importing customer from Shopify #{$customer_data['id']}, {$user_id->get_error_message()}" );
			}
		}

		/**
		 * @param $request WP_REST_Request
		 *
		 * @throws WC_Data_Exception
		 */
		public function process_orders( $request ) {
			$domain                 = $this->settings->get_params( 'domain' );
			$api_key                = $this->settings->get_params( 'api_key' );
			$api_secret             = $this->settings->get_params( 'api_secret' );
			$shared_secret          = $this->settings->get_params( 'webhooks_shared_secret' );
			$webhooks_orders_enable = $this->settings->get_params( 'webhooks_orders_enable' );
			$hmac_header            = $request->get_header( 'x_shopify_hmac_sha256' );
			$topic_header           = $request->get_header( 'x_shopify_topic' );
			$user_agent             = $request->get_header( 'user_agent' );
			$data                   = file_get_contents( 'php://input' );
			$path                   = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::get_cache_path( $domain, $api_key, $api_secret ) . '/';
			if ( self::verify_webhook( $data, $hmac_header, $shared_secret ) ) {
				if ( ! $webhooks_orders_enable ) {
					self::log( $path, 'Orders webhook is currently disabled' );
				} else {
					$order_data = vi_s2w_json_decode( $data );
					if ( ! empty( $order_data['id'] ) ) {
						switch ( $topic_header ) {
							case 'orders/create':
								if ( strtolower( $user_agent ) === 'ruby' ) {
									self::log( $path, 'Test Order creation webhook: Successful' );
								} else {
									$this->create_order( $order_data, $path );
								}
								break;
							case 'orders/updated':
								if ( strtolower( $user_agent ) === 'ruby' ) {
									self::log( $path, 'Test Order update webhook: Successful' );
								} else {
									$this->update_order( $order_data, $path );
								}
								break;
							default:
								self::log( $path, "Wrong webhook request to orders: {$topic_header}" );
						}
					}
				}
			} else {

				self::log( $path, 'Unverified Webhook call' );
			}
		}

		/**
		 * @param $order_data
		 * @param $path
		 *
		 * @throws WC_Data_Exception
		 */
		public function create_order( $order_data, $path ) {
			$fulfillments     = isset( $order_data['fulfillments'] ) ? $order_data['fulfillments'] : array();
			$billing_address  = isset( $order_data['billing_address'] ) ? $order_data['billing_address'] : array();
			$shipping_address = isset( $order_data['shipping_address'] ) ? $order_data['shipping_address'] : array();
			$data             = array(
				'payment_method'      => isset( $order_data['payment_gateway_names'][0] ) ? $order_data['payment_gateway_names'][0] : '',
				/*Billing*/
				'billing_first_name'  => isset( $billing_address['first_name'] ) ? $billing_address['first_name'] : '',
				'billing_last_name'   => isset( $billing_address['last_name'] ) ? $billing_address['last_name'] : '',
				'billing_company'     => isset( $billing_address['company'] ) ? $billing_address['company'] : '',
				'billing_country'     => isset( $billing_address['country'] ) ? $billing_address['country'] : '',
				'billing_address_1'   => isset( $billing_address['address1'] ) ? $billing_address['address1'] : '',
				'billing_address_2'   => isset( $billing_address['address2'] ) ? $billing_address['address2'] : '',
				'billing_postcode'    => isset( $billing_address['zip'] ) ? $billing_address['zip'] : '',
				'billing_city'        => isset( $billing_address['city'] ) ? $billing_address['city'] : '',
				'billing_state'       => isset( $billing_address['province'] ) ? $billing_address['province'] : '',
				'billing_phone'       => isset( $billing_address['phone'] ) ? $billing_address['phone'] : '',
				'billing_email'       => isset( $order_data['email'] ) ? sanitize_email( $order_data['email'] ) : '',
				/*Shipping*/
				'shipping_first_name' => isset( $shipping_address['first_name'] ) ? $shipping_address['first_name'] : '',
				'shipping_last_name'  => isset( $shipping_address['last_name'] ) ? $shipping_address['last_name'] : '',
				'shipping_company'    => isset( $shipping_address['company'] ) ? $shipping_address['company'] : '',
				'shipping_country'    => isset( $shipping_address['country'] ) ? $shipping_address['country'] : '',
				'shipping_address_1'  => isset( $shipping_address['address1'] ) ? $shipping_address['address1'] : '',
				'shipping_address_2'  => isset( $shipping_address['address2'] ) ? $shipping_address['address2'] : '',
				'shipping_postcode'   => isset( $shipping_address['zip'] ) ? $shipping_address['zip'] : '',
				'shipping_city'       => isset( $shipping_address['city'] ) ? $shipping_address['city'] : '',
				'shipping_state'      => isset( $shipping_address['province'] ) ? $shipping_address['province'] : '',
			);
			$order_total      = $order_data['total_price'];
			$order_total_tax  = $order_data['total_tax'];
			$total_discounts  = $order_data['total_discounts'];
			$total_shipping   = isset( $order_data['total_shipping_price_set']['shop_money']['amount'] ) ? floatval( $order_data['total_shipping_price_set']['shop_money']['amount'] ) : 0;
			$shipping_lines   = $order_data['shipping_lines'];
			$discount_codes   = $order_data['discount_codes'];
			$financial_status = $order_data['financial_status'];
			$customer_note    = $order_data['note'];
			$order            = new WC_Order();
			$fields_prefix    = array(
				'shipping' => true,
				'billing'  => true,
			);
			$shipping_fields  = array(
				'shipping_method' => true,
				'shipping_total'  => true,
				'shipping_tax'    => true,
			);
			foreach ( $data as $key => $value ) {
				if ( is_callable( array( $order, "set_{$key}" ) ) && $value ) {
					$order->{"set_{$key}"}( $value );
					// Store custom fields prefixed with wither shipping_ or billing_. This is for backwards compatibility with 2.6.x.
				} elseif ( isset( $fields_prefix[ current( explode( '_', $key ) ) ] ) ) {
					if ( ! isset( $shipping_fields[ $key ] ) ) {
						$order->update_meta_data( '_' . $key, $value );
					}
				}
			}

			$order->set_created_via( 's2w_import' );
			$order->set_customer_id( email_exists( $data['billing_email'] ) );
			$order->set_currency( ! empty( $order_data['currency'] ) ? $order_data['currency'] : get_woocommerce_currency() );
			$order->set_prices_include_tax( $order_data['taxes_included'] );
			$order->set_customer_ip_address( $order_data['browser_ip'] );
			$order->set_customer_user_agent( isset( $order_data['client_details']['user_agent'] ) ? $order_data['client_details']['user_agent'] : '' );
			$order->set_payment_method_title( $data['payment_method'] );
			$order->set_shipping_total( $total_shipping );
			$order->set_discount_total( $total_discounts );
			//      set discount tax
			$order->set_cart_tax( $order_total_tax );
			if ( isset( $shipping_lines['tax_lines']['price'] ) && $shipping_lines['tax_lines']['price'] ) {
				$order->set_shipping_tax( $shipping_lines['tax_lines']['price'] );
			}
			$order->set_total( $order_total );
			//		create order line items
			$line_items = $order_data['line_items'];
			foreach ( $line_items as $line_item ) {
				$item                 = new WC_Order_Item_Product();
				$shopify_product_id   = $line_item['product_id'];
				$shopify_variation_id = $line_item['variant_id'];
				$sku                  = $line_item['sku'];
				$product_id           = '';
				if ( $shopify_variation_id ) {
					$found_variation_id = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::product_get_woo_id_by_shopify_id( $shopify_variation_id, true );
					if ( $found_variation_id ) {
						$product_id = $found_variation_id;
					}
				}
				if ( ! $product_id && $shopify_product_id ) {
					$found_product_id = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::product_get_woo_id_by_shopify_id( $shopify_product_id );
					if ( $found_product_id ) {
						$product_id = $found_product_id;
					}
				}
				if ( ! $product_id && $sku ) {
					$product_id = wc_get_product_id_by_sku( $sku );
				}
				$item->set_props(
					array(
						'quantity' => $line_item['quantity'],
						'subtotal' => $line_item['price'],
						'total'    => intval( $line_item['quantity'] ) * $line_item['price'],
						'name'     => $line_item['name'],
					)
				);
				if ( is_array( $line_item['tax_lines'] ) && count( $line_item['tax_lines'] ) ) {
					$line_item_tax = 0;
					$taxes         = array(
						'subtotal' => array(),
						'total'    => array(),
					);
					foreach ( $line_item['tax_lines'] as $line_item_tax_line ) {
						$line_item_tax       += floatval( $line_item_tax_line['price'] );
						$taxes['subtotal'][] = $line_item_tax_line['price'];
						$taxes['total'][]    = $line_item_tax_line['price'];
					}
					$item->set_props(
						array(
							'subtotal_tax' => $line_item_tax,
							'total_tax'    => $line_item_tax,
							'taxes'        => $taxes,
						)
					);
				}
				if ( $product_id ) {
					$product_data = wc_get_product( $product_id );
					if ( $product_data ) {
						$item->set_props(
							array(
								'name'         => $product_data->get_name(),
								'tax_class'    => $product_data->get_tax_class(),
								'product_id'   => $product_data->is_type( 'variation' ) ? $product_data->get_parent_id() : $product_data->get_id(),
								'variation_id' => $product_data->is_type( 'variation' ) ? $product_data->get_id() : 0,
							)
						);
					}
				}

				// Add item to order and save.
				$order->add_item( $item );
			}
//create order shipping line
			$item = new WC_Order_Item_Shipping();
			if ( is_array( $shipping_lines ) && count( $shipping_lines ) ) {
				foreach ( $shipping_lines as $shipping_line ) {
					$item->set_props(
						array(
							'method_title' => $shipping_line['title'],
							'method_id'    => floatval( $shipping_line['price'] ) > 0 ? 'flat_rate' : 'free_shipping',
							'total'        => $shipping_line['price'],
						)
					);
					if ( is_array( $shipping_line['tax_lines'] ) && count( $shipping_line['tax_lines'] ) ) {
						$shipping_line_tax = array();
						foreach ( $shipping_line['tax_lines'] as $shipping_line_tax_line ) {
							$shipping_line_tax[] = $shipping_line_tax_line['price'];
						}
						$item->set_props(
							array(
								'taxes' => array( 'total' => $shipping_line_tax ),
							)
						);
					}
				}
			} else {
				$item->set_props(
					array(
						'method_title' => isset( $shipping_lines[0]['title'] ) ? $shipping_lines[0]['title'] : ( $total_shipping ? 'Flat rate' : 'Free shipping' ),
						'method_id'    => $total_shipping ? 'flat_rate' : 'free_shipping',
						'total'        => $total_shipping,
					)
				);
			}

			$order->add_item( $item );
//				create order tax lines
			$tax_lines = $order_data['tax_lines'];
			if ( is_array( $tax_lines ) && count( $tax_lines ) ) {
				foreach ( $tax_lines as $tax_line ) {
					$item = new WC_Order_Item_Tax();
					$item->set_props(
						array(
							'tax_total' => $tax_line['price'],
							'label'     => $tax_line['title'],
						)
					);
					$order->add_item( $item );
				}
			}

//				create order coupon lines
			if ( is_array( $discount_codes ) && count( $discount_codes ) ) {
				foreach ( $discount_codes as $discount_code ) {
					$item = new WC_Order_Item_Coupon();
					$item->set_props(
						array(
							'code'     => $discount_code['code'],
							'discount' => $discount_code['amount'],
						)
					);
					$order->add_item( $item );
				}
			}
			$order->add_order_note( esc_html__( 'This order is imported from Shopify store by S2W - Import Shopify to WooCommerce plugin.', 's2w-import-shopify-to-woocommerce' ) );
			if ( $customer_note ) {
				$order->add_order_note( $customer_note, false, true );
			}
			$order_id             = $order->save();
			$gmt_offset           = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::get_option( 'gmt_offset' );
			$order_status_mapping = $this->settings->get_params( 'order_status_mapping' );
			if ( ! is_array( $order_status_mapping ) || ! count( $order_status_mapping ) ) {
				$order_status_mapping = $this->settings->get_default( 'order_status_mapping' );
			}
			$processed_at = $order_data['processed_at'];
			if ( ! $processed_at ) {
				$processed_at = $order_data['created_at'];
			}
			$processed_at_gmt = strtotime( $processed_at );
			$date_gmt         = date( 'Y-m-d H:i:s', $processed_at_gmt );
			$date             = date( 'Y-m-d H:i:s', ( $processed_at_gmt + $gmt_offset * 3600 ) );
			wp_update_post( array(
				'ID'                => $order_id,
				'post_status'       => isset( $order_status_mapping[ $financial_status ] ) ? ( 'wc-' . $order_status_mapping[ $financial_status ] ) : 'wc-processing',
				'post_date'         => $date,
				'post_date_gmt'     => $date_gmt,
				'post_modified'     => $date,
				'post_modified_gmt' => $date_gmt,
			) );
			update_post_meta( $order_id, '_s2w_shopify_order_id', $order_data['id'] );
			update_post_meta( $order_id, '_s2w_shopify_order_number', $order_data['order_number'] );
			update_post_meta( $order_id, '_s2w_shopify_order_fulfillments', $fulfillments );
			self::log( $path, "New order was imported: #{$order_id}" );
		}

		/**
		 * @param $order_data
		 * @param $path
		 *
		 * @throws WC_Data_Exception
		 */
		public function update_order( $order_data, $path ) {
			$existing_id = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::query_get_id_by_shopify_id( $order_data['id'] );
			if ( $existing_id ) {
				$webhooks_orders_options = $this->settings->get_params( 'webhooks_orders_options' );
				if ( count( $webhooks_orders_options ) ) {
					$order = wc_get_order( $existing_id );
					if ( $order ) {
						$gmt_offset       = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::get_option( 'gmt_offset' );
						$billing_address  = isset( $order_data['billing_address'] ) ? $order_data['billing_address'] : array();
						$shipping_address = isset( $order_data['shipping_address'] ) ? $order_data['shipping_address'] : array();
						$update_data      = array();
						if ( in_array( 'order_status', $webhooks_orders_options ) ) {
							$order_status_mapping = $this->settings->get_params( 'order_status_mapping' );
							if ( ! is_array( $order_status_mapping ) || ! count( $order_status_mapping ) ) {
								$order_status_mapping = $this->settings->get_default( 'order_status_mapping' );
							}
							$financial_status = isset( $order_data['financial_status'] ) ? $order_data['financial_status'] : '';
							$order_status     = isset( $order_status_mapping[ $financial_status ] ) ? ( 'wc-' . $order_status_mapping[ $financial_status ] ) : '';
							if ( $order_status ) {
								$update_data['post_status'] = $order_status;
							}
						}
						if ( in_array( 'order_date', $webhooks_orders_options ) ) {
							$processed_at = $order_data['processed_at'];
							if ( ! $processed_at ) {
								$processed_at = $order_data['created_at'];
							}
							if ( $processed_at ) {
								$processed_at_gmt                 = strtotime( $processed_at );
								$date_gmt                         = date( 'Y-m-d H:i:s', $processed_at_gmt );
								$date                             = date( 'Y-m-d H:i:s', ( $processed_at_gmt + $gmt_offset * 3600 ) );
								$update_data['post_date']         = $date;
								$update_data['post_date_gmt']     = $date_gmt;
								$update_data['post_modified']     = $date;
								$update_data['post_modified_gmt'] = $date_gmt;
							}
						}
						if ( in_array( 'fulfillments', $webhooks_orders_options ) ) {
							$shopify_order_fulfillments = isset( $order_data['fulfillments'] ) ? $order_data['fulfillments'] : array();
							if ( $shopify_order_fulfillments ) {
								update_post_meta( $existing_id, '_s2w_shopify_order_fulfillments', $shopify_order_fulfillments );
							}
						}
						if ( in_array( 'line_items', $webhooks_orders_options ) ) {
							$product_line_items  = array_keys( $order->get_items( 'line_item' ) );
							$shipping_line_items = array_keys( $order->get_items( 'shipping' ) );
							$tax_line_items      = array_keys( $order->get_items( 'tax' ) );
							$coupon_line_items   = array_keys( $order->get_items( 'coupon' ) );
							$order_total         = $order_data['total_price'];
							$order_total_tax     = $order_data['total_tax'];
							$total_discounts     = $order_data['total_discounts'];
							$total_shipping      = isset( $order_data['total_shipping_price_set']['shop_money']['amount'] ) ? floatval( $order_data['total_shipping_price_set']['shop_money']['amount'] ) : 0;
							$shipping_lines      = $order_data['shipping_lines'];
							$discount_codes      = $order_data['discount_codes'];
							$order->set_currency( ! empty( $order_data['currency'] ) ? $order_data['currency'] : get_woocommerce_currency() );
							$order->set_prices_include_tax( $order_data['taxes_included'] );
							$order->set_shipping_total( $total_shipping );
							$order->set_discount_total( $total_discounts );
							//      set discount tax
							$order->set_cart_tax( $order_total_tax );
							if ( isset( $shipping_lines['tax_lines']['price'] ) && $shipping_lines['tax_lines']['price'] ) {
								$order->set_shipping_tax( $shipping_lines['tax_lines']['price'] );
							}
							$order->set_total( $order_total );

							/*create order line items*/
							$line_items = $order_data['line_items'];
							S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_ADMIN_Update_Orders::remove_order_item( $product_line_items, $line_items, $order );
							foreach ( $line_items as $line_item_k => $line_item ) {
								$item                 = isset( $product_line_items[ $line_item_k ] ) ? new WC_Order_Item_Product( $product_line_items[ $line_item_k ] ) : new WC_Order_Item_Product();
								$shopify_product_id   = $line_item['product_id'];
								$shopify_variation_id = $line_item['variant_id'];
								$sku                  = $line_item['sku'];
								$product_id           = '';
								if ( $shopify_variation_id ) {
									$found_variation_id = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::product_get_woo_id_by_shopify_id( $shopify_variation_id, true );
									if ( $found_variation_id ) {
										$product_id = $found_variation_id;
									}
								}
								if ( ! $product_id && $shopify_product_id ) {
									$found_product_id = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::product_get_woo_id_by_shopify_id( $shopify_product_id );
									if ( $found_product_id ) {
										$product_id = $found_product_id;
									}
								}
								if ( ! $product_id && $sku ) {
									$product_id = wc_get_product_id_by_sku( $sku );
								}
								$item->set_props(
									array(
										'quantity' => $line_item['quantity'],
										'subtotal' => $line_item['price'],
										'total'    => intval( $line_item['quantity'] ) * $line_item['price'],
										'name'     => $line_item['name'],
									)
								);
								if ( is_array( $line_item['tax_lines'] ) && count( $line_item['tax_lines'] ) ) {
									$line_item_tax = 0;
									$taxes         = array(
										'subtotal' => array(),
										'total'    => array(),
									);
									foreach ( $line_item['tax_lines'] as $line_item_tax_line ) {
										$line_item_tax       += floatval( $line_item_tax_line['price'] );
										$taxes['subtotal'][] = $line_item_tax_line['price'];
										$taxes['total'][]    = $line_item_tax_line['price'];
									}
									$item->set_props(
										array(
											'subtotal_tax' => $line_item_tax,
											'total_tax'    => $line_item_tax,
											'taxes'        => $taxes,
										)
									);
								}
								if ( $product_id ) {
									$product_data = wc_get_product( $product_id );
									if ( $product_data ) {
										$item->set_props(
											array(
												'name'         => $product_data->get_name(),
												'tax_class'    => $product_data->get_tax_class(),
												'product_id'   => $product_data->is_type( 'variation' ) ? $product_data->get_parent_id() : $product_data->get_id(),
												'variation_id' => $product_data->is_type( 'variation' ) ? $product_data->get_id() : 0,
											)
										);
									}
								}
								$item->save();
								$order->add_item( $item );
							}
//create order shipping line
							$shipping_line_items_count = count( $shipping_line_items );
							if ( $shipping_line_items_count > 1 ) {
								$item = new WC_Order_Item_Shipping( $shipping_line_items[0] );
								for ( $temp = 1; $temp < $shipping_line_items_count; $temp ++ ) {
									$order->remove_item( $shipping_line_items[ $temp ] );
								}
							} elseif ( $shipping_line_items_count > 0 ) {
								$item = new WC_Order_Item_Shipping( $shipping_line_items[0] );
							} else {
								$item = new WC_Order_Item_Shipping();
							}
							if ( is_array( $shipping_lines ) && count( $shipping_lines ) ) {
								foreach ( $shipping_lines as $shipping_line ) {
									$item->set_props(
										array(
											'method_title' => $shipping_line['title'],
											'method_id'    => floatval( $shipping_line['price'] ) > 0 ? 'flat_rate' : 'free_shipping',
											'total'        => $shipping_line['price'],
										)
									);
									if ( is_array( $shipping_line['tax_lines'] ) && count( $shipping_line['tax_lines'] ) ) {
										$shipping_line_tax = array();
										foreach ( $shipping_line['tax_lines'] as $shipping_line_tax_line ) {
											$shipping_line_tax[] = $shipping_line_tax_line['price'];
										}
										$item->set_props(
											array(
												'taxes' => array( 'total' => $shipping_line_tax ),
											)
										);
									}
								}
							} else {
								$item->set_props(
									array(
										'method_title' => isset( $shipping_lines[0]['title'] ) ? $shipping_lines[0]['title'] : ( $total_shipping ? 'Flat rate' : 'Free shipping' ),
										'method_id'    => $total_shipping ? 'flat_rate' : 'free_shipping',
										'total'        => $total_shipping,
									)
								);
							}
							$item->save();
							$order->add_item( $item );
//				create order tax lines
							$tax_lines = $order_data['tax_lines'];
							S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_ADMIN_Update_Orders::remove_order_item( $tax_line_items, $tax_lines, $order );
							if ( is_array( $tax_lines ) && count( $tax_lines ) ) {
								foreach ( $tax_lines as $tax_line_k => $tax_line ) {
									$item = isset( $tax_line_items[ $tax_line_k ] ) ? new WC_Order_Item_Tax( $tax_line_items[ $tax_line_k ] ) : new WC_Order_Item_Tax();
									$item->set_props(
										array(
											'tax_total' => $tax_line['price'],
											'label'     => $tax_line['title'],
										)
									);
									$item->save();
									$order->add_item( $item );
								}
							}

//				create order coupon lines
							S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_ADMIN_Update_Orders::remove_order_item( $coupon_line_items, $discount_codes, $order );
							if ( is_array( $discount_codes ) && count( $discount_codes ) ) {
								foreach ( $discount_codes as $discount_code_k => $discount_code ) {
									$item = isset( $coupon_line_items[ $discount_code_k ] ) ? new WC_Order_Item_Coupon( $coupon_line_items[ $discount_code_k ] ) : new WC_Order_Item_Coupon();
									$item->set_props(
										array(
											'code'     => $discount_code['code'],
											'discount' => $discount_code['amount'],
										)
									);
									$item->save();
									$order->add_item( $item );
								}
							}
							$order->save();
						}
						if ( count( $update_data ) ) {
							$update_data['ID'] = $existing_id;
							wp_update_post( $update_data );
						}
						$data = array();
						if ( in_array( 'billing_address', $webhooks_orders_options ) && $billing_address ) {
							$data = array_merge( array(
								'billing_first_name' => isset( $billing_address['first_name'] ) ? $billing_address['first_name'] : '',
								'billing_last_name'  => isset( $billing_address['last_name'] ) ? $billing_address['last_name'] : '',
								'billing_company'    => isset( $billing_address['company'] ) ? $billing_address['company'] : '',
								'billing_country'    => isset( $billing_address['country'] ) ? $billing_address['country'] : '',
								'billing_address_1'  => isset( $billing_address['address1'] ) ? $billing_address['address1'] : '',
								'billing_address_2'  => isset( $billing_address['address2'] ) ? $billing_address['address2'] : '',
								'billing_postcode'   => isset( $billing_address['zip'] ) ? $billing_address['zip'] : '',
								'billing_city'       => isset( $billing_address['city'] ) ? $billing_address['city'] : '',
								'billing_state'      => isset( $billing_address['province'] ) ? $billing_address['province'] : '',
								'billing_phone'      => isset( $billing_address['phone'] ) ? $billing_address['phone'] : '',
								'billing_email'      => isset( $order_data['email'] ) ? sanitize_email( $order_data['email'] ) : '',
							), $data );
						}
						if ( in_array( 'shipping_address', $webhooks_orders_options ) && $shipping_address ) {
							$data = array_merge( array(
								'shipping_first_name' => isset( $shipping_address['first_name'] ) ? $shipping_address['first_name'] : '',
								'shipping_last_name'  => isset( $shipping_address['last_name'] ) ? $shipping_address['last_name'] : '',
								'shipping_company'    => isset( $shipping_address['company'] ) ? $shipping_address['company'] : '',
								'shipping_country'    => isset( $shipping_address['country'] ) ? $shipping_address['country'] : '',
								'shipping_address_1'  => isset( $shipping_address['address1'] ) ? $shipping_address['address1'] : '',
								'shipping_address_2'  => isset( $shipping_address['address2'] ) ? $shipping_address['address2'] : '',
								'shipping_postcode'   => isset( $shipping_address['zip'] ) ? $shipping_address['zip'] : '',
								'shipping_city'       => isset( $shipping_address['city'] ) ? $shipping_address['city'] : '',
								'shipping_state'      => isset( $shipping_address['province'] ) ? $shipping_address['province'] : '',
							), $data );
						}
						if ( count( $data ) ) {
							foreach ( $data as $key => $value ) {
								if ( is_callable( array( $order, "set_{$key}" ) ) && $value ) {
									$order->{"set_{$key}"}( $value );
									// Store custom fields prefixed with wither shipping_ or billing_. This is for backwards compatibility with 2.6.x.
								} elseif ( isset( $fields_prefix[ current( explode( '_', $key ) ) ] ) ) {
									if ( ! isset( $shipping_fields[ $key ] ) ) {
										$order->update_meta_data( '_' . $key, $value );
									}
								}
							}
							$order->save();
						}
						self::log( $path, "Order #{$existing_id} was updated" );
					}
				}
			} else {
				$this->create_order( $order_data, $path );
			}
		}

		/**
		 * @param $request WP_REST_Request
		 */
		public function process_products( $request ) {
			$domain                   = $this->settings->get_params( 'domain' );
			$api_key                  = $this->settings->get_params( 'api_key' );
			$api_secret               = $this->settings->get_params( 'api_secret' );
			$shared_secret            = $this->settings->get_params( 'webhooks_shared_secret' );
			$webhooks_products_enable = $this->settings->get_params( 'webhooks_products_enable' );
			$hmac_header              = $request->get_header( 'x_shopify_hmac_sha256' );
			$topic_header             = $request->get_header( 'x_shopify_topic' );
			$user_agent               = $request->get_header( 'user_agent' );
			$data                     = file_get_contents( 'php://input' );
			$path                     = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::get_cache_path( $domain, $api_key, $api_secret ) . '/';
			if ( self::verify_webhook( $data, $hmac_header, $shared_secret ) ) {
				if ( ! $webhooks_products_enable ) {
					self::log( $path, 'Products webhook is currently disabled' );
				} else {
					$product_data = vi_s2w_json_decode( $data );
					if ( ! empty( $product_data['id'] ) ) {
						switch ( $topic_header ) {
							case 'products/create':
								if ( strtolower( $user_agent ) === 'ruby' ) {
									self::log( $path, 'Test Product creation webhook: Successful' );
								} else {
									$this->create_product( $product_data, $path );
								}
								break;
							case 'products/update':
								if ( strtolower( $user_agent ) === 'ruby' ) {
									self::log( $path, 'Test Product update webhook: Successful' );
								} else {
									$this->update_product( $product_data, $path );
								}
								break;
							default:
								self::log( $path, "Wrong webhook request to products: {$topic_header}" );
						}
					}
				}
			} else {

				self::log( $path, 'Unverified Webhook call' );
			}
		}

		public function update_product( $product_data, $path ) {
			$shopify_id = $product_data['id'];
			$product_id = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::product_get_woo_id_by_shopify_id( $shopify_id );
			if ( $product_id ) {
				$webhooks_products_options = $this->settings->get_params( 'webhooks_products_options' );
				if ( count( $webhooks_products_options ) ) {
					$product = wc_get_product( $product_id );
					if ( $product ) {
						$global_attributes = $this->settings->get_params( 'global_attributes' );
						$variants          = isset( $product_data['variants'] ) ? $product_data['variants'] : array();
						$options           = isset( $product_data['options'] ) ? $product_data['options'] : array();
						if ( count( $options ) && count( $variants ) ) {
							$manage_stock = ( 'yes' === get_option( 'woocommerce_manage_stock' ) ) ? true : false;
							if ( $product->is_type( 'variable' ) ) {
								if ( count( array_intersect( $webhooks_products_options, array(
									'price',
									'inventory',
									'variation_attributes',
									'variation_sku',
								) ) ) ) {
									if ( in_array( 'inventory', $webhooks_products_options ) ) {
										update_post_meta( $product_id, '_manage_stock', 'no' );
									}
									$variations = $product->get_children();
									if ( count( $variations ) ) {
										$attr_data = array();
										if ( in_array( 'variation_attributes', $webhooks_products_options ) ) {
											if ( $global_attributes ) {
												foreach ( $options as $option_k => $option_v ) {
													$attribute_slug = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sanitize_taxonomy_name( $option_v['name'] );
													$attribute_id   = wc_attribute_taxonomy_id_by_name( $option_v['name'] );
													if ( ! $attribute_id ) {
														$attribute_id = wc_create_attribute( array(
															'name'         => $option_v['name'],
															'slug'         => $attribute_slug,
															'type'         => 'select',
															'order_by'     => 'menu_order',
															'has_archives' => false,
														) );
													}
													if ( $attribute_id && ! is_wp_error( $attribute_id ) ) {
														$attribute_obj     = wc_get_attribute( $attribute_id );
														$attribute_options = array();
														if ( ! empty( $attribute_obj ) ) {
															$taxonomy                   = $attribute_obj->slug; // phpcs:ignore
															$wp_taxonomies[ $taxonomy ] = new WP_Taxonomy( $taxonomy, 'product' );
															if ( count( $option_v['values'] ) ) {
																foreach ( $option_v['values'] as $term_k => $term_v ) {
																	$option_v['values'][ $term_k ] = strval( wc_clean( $term_v ) );
																	$insert_term                   = wp_insert_term( $option_v['values'][ $term_k ], $taxonomy );
																	if ( ! is_wp_error( $insert_term ) ) {
																		$attribute_options[] = $insert_term['term_id'];
																	} elseif ( isset( $insert_term->error_data ) && isset( $insert_term->error_data['term_exists'] ) ) {
																		$attribute_options[] = $insert_term->error_data['term_exists'];
																	}
																}
															}
														}
														$attribute_object = new WC_Product_Attribute();
														$attribute_object->set_id( $attribute_id );
														$attribute_object->set_name( wc_attribute_taxonomy_name_by_id( $attribute_id ) );
														if ( count( $attribute_options ) ) {
															$attribute_object->set_options( $attribute_options );
														} else {
															$attribute_object->set_options( $option_v['values'] );
														}
														$attribute_object->set_position( $option_v['position'] );
														$attribute_object->set_visible( 0 );
														$attribute_object->set_variation( 1 );
														$attr_data[] = $attribute_object;
													}
												}
											} else {
												foreach ( $options as $option_k => $option_v ) {
													$attribute_object = new WC_Product_Attribute();
													$attribute_object->set_name( $option_v['name'] );
													$attribute_object->set_options( $option_v['values'] );
													$attribute_object->set_position( $option_v['position'] );
													$attribute_object->set_visible( 0 );
													$attribute_object->set_variation( 1 );
													$attr_data[] = $attribute_object;
												}
											}
											$product->set_attributes( $attr_data );
											$product->save();
										}
										foreach ( $variations as $variation_k => $variation_id ) {
											vi_s2w_set_time_limit();
											$shopify_variation_id = get_post_meta( $variation_id, '_shopify_variation_id', true );
											if ( $shopify_variation_id ) {
												foreach ( $variants as $variant_k => $variant_v ) {
													vi_s2w_set_time_limit();
													if ( $variant_v['id'] == $shopify_variation_id ) {
														$sku = $variant_v['sku'];
														if ( $sku && in_array( 'variation_sku', $webhooks_products_options ) ) {
															update_post_meta( $variation_id, '_sku', $sku );
														}
														$inventory  = $variant_v['inventory_quantity'];
														$attributes = array();
														if ( count( $attr_data ) ) {
															if ( $global_attributes ) {
																foreach ( $options as $option_k => $option_v ) {
																	$j = $option_k + 1;
																	if ( isset( $variant_v[ 'option' . $j ] ) && $variant_v[ 'option' . $j ] ) {
																		$attribute_id  = wc_attribute_taxonomy_id_by_name( $option_v['name'] );
																		$attribute_obj = wc_get_attribute( $attribute_id );
																		if ( $attribute_obj ) {
																			$attribute_value = get_term_by( 'name', $variant_v[ 'option' . $j ], $attribute_obj->slug );
																			if ( $attribute_value ) {
																				$attributes[ VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sanitize_taxonomy_name( $attribute_obj->slug ) ] = $attribute_value->slug;
																			}
																		}
																	}
																}
															} else {
																foreach ( $options as $option_k => $option_v ) {
																	$j = $option_k + 1;
																	if ( isset( $variant_v[ 'option' . $j ] ) && $variant_v[ 'option' . $j ] ) {
																		$attributes[ VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sanitize_taxonomy_name( $option_v['name'] ) ] = $variant_v[ 'option' . $j ];
																	}
																}
															}
														}
														$variation = wc_get_product( $variation_id );
														if ( in_array( 'price', $webhooks_products_options ) ) {
															$regular_price = $variant_v['compare_at_price'];
															$sale_price    = $variant_v['price'];
															if ( ! floatval( $regular_price ) || floatval( $regular_price ) == floatval( $sale_price ) ) {
																$regular_price = $sale_price;
																$sale_price    = '';
															}
															$variation->set_regular_price( $regular_price );
															$variation->set_sale_price( $sale_price );
														}
														if ( in_array( 'inventory', $webhooks_products_options ) ) {
															if ( $manage_stock ) {
																$variation->set_manage_stock( 'yes' );
																$variation->set_stock_quantity( $inventory );
															} else {
																$variation->set_manage_stock( 'no' );
																delete_post_meta( $variation_id, '_stock' );
																$variation->set_stock_status( 'instock' );
															}
														}

														if ( count( $attributes ) ) {
															$variation->set_attributes( $attributes );
														}
														$variation->save();
														break;
													}
												}
											}
										}
									}
								}
							} else {
								if ( in_array( 'price', $webhooks_products_options ) ) {
									$regular_price = $variants[0]['compare_at_price'];
									$sale_price    = $variants[0]['price'];
									if ( ! floatval( $regular_price ) || floatval( $regular_price ) == floatval( $sale_price ) ) {
										$regular_price = $sale_price;
										$sale_price    = '';
									}
									update_post_meta( $product_id, '_regular_price', $regular_price );
									update_post_meta( $product_id, '_sale_price', $sale_price );
									if ( $sale_price ) {
										update_post_meta( $product_id, '_price', $sale_price );
									} else {
										update_post_meta( $product_id, '_price', $regular_price );
									}
								}
								if ( in_array( 'inventory', $webhooks_products_options ) ) {
									if ( $manage_stock ) {
										$inventory = $variants[0]['inventory_quantity'];
										$product->set_manage_stock( 'yes' );
										$product->set_stock_quantity( $inventory );
									} else {
										$product->set_manage_stock( 'no' );
										delete_post_meta( $product_id, '_stock' );
										$product->set_stock_status( 'instock' );
									}
								}
								$product->save();
							}

							if ( in_array( 'product_url', $webhooks_products_options ) ) {
								$handle = isset( $product_data['handle'] ) ? $product_data['handle'] : '';
								if ( $handle ) {
									$product->set_slug( $handle );
									$product->save();
								}
							}
							$dispatch = false;
							if ( in_array( 'images', $webhooks_products_options ) ) {
								$variations = $product->is_type( 'variable' ) ? $product->get_children() : array();
								$images     = isset( $product_data['images'] ) ? $product_data['images'] : array();
								if ( is_array( $images ) && count( $images ) ) {
									$product_image = array_shift( $images );
									$variant_ids   = isset( $product_image['variant_ids'] ) ? $product_image['variant_ids'] : array();
									$src           = isset( $product_image['src'] ) ? $product_image['src'] : '';
									$alt           = isset( $product_image['alt'] ) ? $product_image['alt'] : '';
									if ( $src ) {
										$thumb_id = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::download_image( $product_image['id'], $src, $product_id );
										if ( $thumb_id && ! is_wp_error( $thumb_id ) ) {
											update_post_meta( $thumb_id, '_s2w_shopify_image_id', $product_image['id'] );
											if ( $alt ) {
												update_post_meta( $thumb_id, '_wp_attachment_image_alt', $alt );
											}
											if ( count( $variations ) ) {
												foreach ( $variations as $v_id ) {
													if ( in_array( get_post_meta( $v_id, '_shopify_variation_id', true ), $variant_ids ) ) {
														update_post_meta( $v_id, '_thumbnail_id', $thumb_id );
													}
												}
											}
											update_post_meta( $product_id, '_thumbnail_id', $thumb_id );
										}
									}
									if ( count( $images ) ) {
										$this->process_for_update = new WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_For_Update();
										$dispatch                 = true;
										foreach ( $images as $image_k => $image_v ) {
											$variant_ids = isset( $image_v['variant_ids'] ) ? $image_v['variant_ids'] : array();
											$images_data = array(
												'id'          => $image_v['id'],
												'src'         => $image_v['src'],
												'alt'         => $image_v['alt'],
												'parent_id'   => $product_id,
												'product_ids' => array(),
												'set_gallery' => 1,
											);
											if ( count( $variations ) && count( $variant_ids ) ) {
												foreach ( $variations as $v_id ) {
													if ( in_array( get_post_meta( $v_id, '_shopify_variation_id', true ), $variant_ids ) ) {
														$images_data['product_ids'][] = $v_id;
													}
												}
											}
											$this->process_for_update->push_to_queue( $images_data );
										}

									}
								}
							}
							$update_data = array();
							if ( in_array( 'title', $webhooks_products_options ) ) {
								$title = isset( $product_data['title'] ) ? $product_data['title'] : '';
								if ( $title ) {
									$update_data['post_title'] = $title;
								}
							}
							if ( in_array( 'description', $webhooks_products_options ) ) {
								$description = isset( $product_data['body_html'] ) ? html_entity_decode( $product_data['body_html'], ENT_QUOTES | ENT_XML1, 'UTF-8' ) : '';
								if ( $description ) {
									if ( $this->settings->get_params( 'download_description_images' ) ) {
										preg_match_all( '/src="([\s\S]*?)"/im', $description, $matches );
										if ( isset( $matches[1] ) && is_array( $matches[1] ) && count( $matches[1] ) ) {
											$description_images = array_unique( $matches[1] );
											if ( ! isset( $this->process_for_update ) ) {
												$this->process_for_update = new WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_For_Update();
											}
											$dispatch = true;
											foreach ( $description_images as $description_image ) {
												$images_data = array(
													'id'          => '',
													'src'         => $description_image,
													'alt'         => '',
													'parent_id'   => $product_id,
													'product_ids' => array(),
													'set_gallery' => 2,
												);
												$this->process_for_update->push_to_queue( $images_data );
											}
										}
									}
									$update_data['post_content'] = $description;
								}
							}
							if ( count( $update_data ) ) {
								$update_data['ID'] = $product_id;
								wp_update_post( $update_data );
							}
							if ( $dispatch && isset( $this->process_for_update ) ) {
								$this->process_for_update->save()->dispatch();
							}
							self::log( $path, "Product #{$product_id} was successfully synced" );
						} else {
							self::log( $path, "Product #{$product_id} sync canceled: Empty data" );
						}
					}
				}
			} else {
				$this->create_product( $product_data, $path );
			}
		}

		public function create_product( $product_data, $path ) {
			$download_images             = $this->settings->get_params( 'download_images' );
			$download_description_images = $this->settings->get_params( 'download_description_images' );
			$keep_slug                   = $this->settings->get_params( 'keep_slug' );
			$variable_sku                = $this->settings->get_params( 'variable_sku' );
			$global_attributes           = $this->settings->get_params( 'global_attributes' );
			$product_status              = $this->settings->get_params( 'product_status' );
			$product_categories          = $this->settings->get_params( 'product_categories' );
			$placeholder_image_id        = s2w_get_placeholder_image();
			$manage_stock                = ( 'yes' === get_option( 'woocommerce_manage_stock' ) ) ? true : false;
			$shopify_id                  = $product_data['id'];
			$variations                  = isset( $product_data['variants'] ) ? $product_data['variants'] : array();
			$sku                         = str_replace( array(
				'{shopify_product_id}',
				'{product_slug}'
			), array( $shopify_id, $product_data['handle'] ), $variable_sku );
			$sku                         = str_replace( ' ', '', $sku );
			$attr_data                   = array();
			$options                     = isset( $product_data['options'] ) ? $product_data['options'] : array();
			if ( ! VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sku_exists( $sku ) ) {
				if ( $download_images ) {
					if ( is_array( $options ) && count( $options ) ) {
						if ( count( $options ) == 1 && count( $options[0]['values'] ) == 1 ) {
							$regular_price = $variations[0]['compare_at_price'];
							$sale_price    = $variations[0]['price'];
							if ( ! floatval( $regular_price ) || floatval( $regular_price ) == floatval( $sale_price ) ) {
								$regular_price = $sale_price;
								$sale_price    = '';
							}
							$description = isset( $product_data['body_html'] ) ? html_entity_decode( $product_data['body_html'], ENT_QUOTES | ENT_XML1, 'UTF-8' ) : '';
							$data        = array( // Set up the basic post data to insert for our product
								'post_type'    => 'product',
								'post_excerpt' => '',
								'post_content' => $description,
								'post_title'   => isset( $product_data['title'] ) ? $product_data['title'] : '',
								'post_status'  => $product_status,
								'post_parent'  => '',

								'meta_input' => array(
									'_sku'                => VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sku_exists( $variations[0]['sku'] ) ? '' : $variations[0]['sku'],
									'_visibility'         => 'visible',
									'_shopify_product_id' => $shopify_id,
									'_regular_price'      => $regular_price,
									'_price'              => $regular_price,
								)
							);
							if ( $keep_slug && $product_data['handle'] ) {
								$data['post_name'] = $product_data['handle'];
							}
							if ( $manage_stock ) {
								$data['meta_input']['_manage_stock'] = 'yes';
								if ( $variations[0]['inventory_quantity'] ) {
									$data['meta_input']['_stock']        = $variations[0]['inventory_quantity'];
									$data['meta_input']['_stock_status'] = 'instock';
								} else {
									$data['meta_input']['_stock_status'] = 'outofstock';
								}
							} else {
								$data['meta_input']['_manage_stock'] = 'no';
								$data['meta_input']['_stock_status'] = 'instock';
							}
							if ( $variations[0]['weight'] ) {
								$data['meta_input']['_weight'] = $variations[0]['weight'];
							}

							if ( $sale_price ) {
								$data['meta_input']['_sale_price'] = $sale_price;
								$data['meta_input']['_price']      = $sale_price;
							}
							$product_id = wp_insert_post( $data );
							if ( ! is_wp_error( $product_id ) ) {
								$dispatch = false;
								if ( $description && $download_description_images ) {
									preg_match_all( '/src="([\s\S]*?)"/im', $description, $matches );
									if ( isset( $matches[1] ) && is_array( $matches[1] ) && count( $matches[1] ) ) {
										$description_images = array_unique( $matches[1] );
										$this->process      = new WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_New();
										$dispatch           = true;
										foreach ( $description_images as $description_image ) {
											$images_data = array(
												'id'          => '',
												'src'         => $description_image,
												'alt'         => '',
												'parent_id'   => $product_id,
												'product_ids' => array(),
												'set_gallery' => 2,
											);
											$this->process->push_to_queue( $images_data );
										}
									}
								}
								self::log( $path, "Product #{$product_id} was successfully imported from Shopify #{$shopify_id}" );
								$images_d = array();
								$images   = isset( $product_data['images'] ) ? $product_data['images'] : array();
								if ( count( $images ) ) {
									foreach ( $images as $image ) {
										$images_d[] = array(
											'id'          => $image['id'],
											'src'         => $image['src'],
											'alt'         => $image['alt'],
											'parent_id'   => $product_id,
											'product_ids' => array(),
											'set_gallery' => 1,
										);
									}
									$images_d[0]['product_ids'][] = $product_id;
									$images_d[0]['set_gallery']   = 0;
									if ( $placeholder_image_id ) {
										update_post_meta( $product_id, '_thumbnail_id', $placeholder_image_id );
									}
								}
								wp_set_object_terms( $product_id, 'simple', 'product_type' );
								if ( ! empty( $product_data['product_type'] ) ) {
									wp_set_object_terms( $product_id, $product_data['product_type'], 'product_cat', true );
								}
								if ( is_array( $product_categories ) && count( $product_categories ) ) {
									wp_set_post_terms( $product_id, $product_categories, 'product_cat', true );
								}

								$tags = isset( $product_data['tags'] ) ? $product_data['tags'] : '';
								if ( $tags ) {
									wp_set_object_terms( $product_id, explode( ',', $product_data['tags'] ), 'product_tag' );
								}
								if ( count( $images_d ) ) {
									$dispatch = true;
									if ( ! isset( $this->process ) ) {
										$this->process = new WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_New();
									}
									foreach ( $images_d as $images_d_k => $images_d_v ) {
										$this->process->push_to_queue( $images_d_v );
									}
								}
								if ( $dispatch && isset( $this->process ) ) {
									$this->process->save()->dispatch();
								}
							} else {
								self::log( $path, "Failed importing product from Shopify #{$shopify_id}, {$product_id->get_error_message()}" );
							}
						} else {
							if ( $global_attributes ) {
								foreach ( $options as $option_k => $option_v ) {
									$attribute_slug = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sanitize_taxonomy_name( $option_v['name'] );
									$attribute_id   = wc_attribute_taxonomy_id_by_name( $option_v['name'] );
									if ( ! $attribute_id ) {
										$attribute_id = wc_create_attribute( array(
											'name'         => $option_v['name'],
											'slug'         => $attribute_slug,
											'type'         => 'select',
											'order_by'     => 'menu_order',
											'has_archives' => false,
										) );
									}
									if ( $attribute_id && ! is_wp_error( $attribute_id ) ) {
										$attribute_obj     = wc_get_attribute( $attribute_id );
										$attribute_options = array();
										if ( ! empty( $attribute_obj ) ) {
											$taxonomy                   = $attribute_obj->slug; // phpcs:ignore
											$wp_taxonomies[ $taxonomy ] = new WP_Taxonomy( $taxonomy, 'product' );
											if ( count( $option_v['values'] ) ) {
												foreach ( $option_v['values'] as $term_k => $term_v ) {
													$option_v['values'][ $term_k ] = strval( wc_clean( $term_v ) );
													$insert_term                   = wp_insert_term( $option_v['values'][ $term_k ], $taxonomy );
													if ( ! is_wp_error( $insert_term ) ) {
														$attribute_options[] = $insert_term['term_id'];
													} elseif ( isset( $insert_term->error_data ) && isset( $insert_term->error_data['term_exists'] ) ) {
														$attribute_options[] = $insert_term->error_data['term_exists'];
													}
												}
											}
										}
										$attribute_object = new WC_Product_Attribute();
										$attribute_object->set_id( $attribute_id );
										$attribute_object->set_name( wc_attribute_taxonomy_name_by_id( $attribute_id ) );
										if ( count( $attribute_options ) ) {
											$attribute_object->set_options( $attribute_options );
										} else {
											$attribute_object->set_options( $option_v['values'] );
										}
										$attribute_object->set_position( $option_v['position'] );
										$attribute_object->set_visible( 0 );
										$attribute_object->set_variation( 1 );
										$attr_data[] = $attribute_object;
									}
								}
							} else {
								foreach ( $options as $option_k => $option_v ) {
									$attribute_object = new WC_Product_Attribute();
									$attribute_object->set_name( $option_v['name'] );
									$attribute_object->set_options( $option_v['values'] );
									$attribute_object->set_position( $option_v['position'] );
									$attribute_object->set_visible( 0 );
									$attribute_object->set_variation( 1 );
									$attr_data[] = $attribute_object;
								}
							}
							$description = isset( $product_data['body_html'] ) ? html_entity_decode( $product_data['body_html'], ENT_QUOTES | ENT_XML1, 'UTF-8' ) : '';
							$data        = array( // Set up the basic post data to insert for our product
								'post_type'    => 'product',
								'post_excerpt' => '',
								'post_content' => $description,
								'post_title'   => isset( $product_data['title'] ) ? $product_data['title'] : '',
								'post_status'  => $product_status,
								'post_parent'  => '',
								'meta_input'   => array(
									'_sku'                => $sku,
									'_visibility'         => 'visible',
									'_shopify_product_id' => $shopify_id,
									'_manage_stock'       => 'no',
								)
							);
							if ( $keep_slug && $product_data['handle'] ) {
								$data['post_name'] = $product_data['handle'];
							}
							$product_id = wp_insert_post( $data );
							if ( ! is_wp_error( $product_id ) ) {
								$dispatch = false;
								if ( $description && $download_description_images ) {
									preg_match_all( '/src="([\s\S]*?)"/im', $description, $matches );
									if ( isset( $matches[1] ) && is_array( $matches[1] ) && count( $matches[1] ) ) {
										$description_images = array_unique( $matches[1] );
										$dispatch           = true;
										$this->process      = new WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_New();
										foreach ( $description_images as $description_image ) {
											$images_data = array(
												'id'          => '',
												'src'         => $description_image,
												'alt'         => '',
												'parent_id'   => $product_id,
												'product_ids' => array(),
												'set_gallery' => 2,
											);
											$this->process->push_to_queue( $images_data );
										}
									}
								}
								self::log( $path, "Product #{$product_id} was successfully imported from Shopify #{$shopify_id}" );
								wp_set_object_terms( $product_id, 'variable', 'product_type' );
								if ( count( $attr_data ) ) {
									$product_obj = wc_get_product( $product_id );
									if ( $product_obj ) {
										$product_obj->set_attributes( $attr_data );
										$product_obj->save();
										wp_set_object_terms( $product_id, 'variable', 'product_type' );
									}
								}
								$images_d = array();
								$images   = isset( $product_data['images'] ) ? $product_data['images'] : array();
								if ( count( $images ) ) {
									foreach ( $images as $image ) {
										$images_d[] = array(
											'id'          => $image['id'],
											'src'         => $image['src'],
											'alt'         => $image['alt'],
											'parent_id'   => $product_id,
											'product_ids' => array(),
											'set_gallery' => 1,
										);
									}
									$images_d[0]['product_ids'][] = $product_id;
									$images_d[0]['set_gallery']   = 0;
									if ( $placeholder_image_id ) {
										update_post_meta( $product_id, '_thumbnail_id', $placeholder_image_id );
									}
								}
								if ( ! empty( $product_data['product_type'] ) ) {
									wp_set_object_terms( $product_id, $product_data['product_type'], 'product_cat', true );
								}
								if ( is_array( $product_categories ) && count( $product_categories ) ) {
									wp_set_post_terms( $product_id, $product_categories, 'product_cat', true );
								}
								$tags = isset( $product_data['tags'] ) ? $product_data['tags'] : '';
								if ( $tags ) {
									wp_set_object_terms( $product_id, explode( ',', $product_data['tags'] ), 'product_tag' );
								}
								if ( is_array( $variations ) && count( $variations ) ) {
									foreach ( $variations as $variation ) {
										vi_s2w_set_time_limit();
										$regular_price = $variation['compare_at_price'];
										$sale_price    = $variation['price'];
										if ( ! floatval( $regular_price ) || floatval( $regular_price ) == floatval( $sale_price ) ) {
											$regular_price = $sale_price;
											$sale_price    = '';
										}
										$variation_obj = new WC_Product_Variation();
										$variation_obj->set_parent_id( $product_id );
										$attributes = array();
										if ( $global_attributes ) {
											foreach ( $options as $option_k => $option_v ) {
												$j = $option_k + 1;
												if ( isset( $variation[ 'option' . $j ] ) && $variation[ 'option' . $j ] ) {
													$attribute_id  = wc_attribute_taxonomy_id_by_name( $option_v['name'] );
													$attribute_obj = wc_get_attribute( $attribute_id );
													if ( $attribute_obj ) {
														$attribute_value = get_term_by( 'name', $variation[ 'option' . $j ], $attribute_obj->slug );
														if ( $attribute_value ) {
															$attributes[ VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sanitize_taxonomy_name( $attribute_obj->slug ) ] = $attribute_value->slug;
														}
													}
												}
											}
										} else {
											foreach ( $options as $option_k => $option_v ) {
												$j = $option_k + 1;
												if ( isset( $variation[ 'option' . $j ] ) && $variation[ 'option' . $j ] ) {
													$attributes[ VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sanitize_taxonomy_name( $option_v['name'] ) ] = $variation[ 'option' . $j ];
												}
											}
										}
										$variation_obj->set_attributes( $attributes );
										$fields = array(
											'sku'           => VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sku_exists( $variation['sku'] ) ? '' : $variation['sku'],
											'regular_price' => $regular_price,
										);
										if ( $manage_stock ) {
											$fields['stock_quantity'] = $variation['inventory_quantity'];
											$fields['manage_stock']   = 'yes';
											if ( $variation['inventory_quantity'] ) {
												$fields['stock_status'] = 'instock';
											} else {
												$fields['stock_status'] = 'outofstock';
											}
										} else {
											$fields['manage_stock'] = 'no';
											$fields['stock_status'] = 'instock';
										}
										if ( $variation['weight'] ) {
											$fields['weight'] = $variation['weight'];
										}
										if ( $sale_price ) {
											$fields['sale_price'] = $sale_price;
										}
										foreach ( $fields as $field => $field_v ) {
											$variation_obj->{"set_$field"}( wc_clean( $field_v ) );
										}
										do_action( 'product_variation_linked', $variation_obj->save() );
										$variation_obj_id = $variation_obj->get_id();
										if ( count( $images ) ) {
											foreach ( $images as $image_k => $image_v ) {
												if ( in_array( $variation['id'], $image_v['variant_ids'] ) ) {
													$images_d[ $image_k ]['product_ids'][] = $variation_obj_id;
													if ( $placeholder_image_id ) {
														update_post_meta( $variation_obj_id, '_thumbnail_id', $placeholder_image_id );
													}
												}
											}
										}
										update_post_meta( $variation_obj_id, '_shopify_variation_id', $variation['id'] );
									}
								}
								if ( count( $images_d ) ) {
									$dispatch = true;
									if ( ! isset( $this->process ) ) {
										$this->process = new WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_New();
									}
									foreach ( $images_d as $images_d_k => $images_d_v ) {
										$this->process->push_to_queue( $images_d_v );
									}

								}
								if ( $dispatch && isset( $this->process ) ) {
									$this->process->save()->dispatch();
								}
							} else {
								self::log( $path, "Failed importing product from Shopify #{$shopify_id}, {$product_id->get_error_message()}" );
							}
						}
					}
				} else {
					if ( is_array( $options ) && count( $options ) ) {
						if ( count( $options ) == 1 && count( $options[0]['values'] ) == 1 ) {
							$regular_price = $variations[0]['compare_at_price'];
							$sale_price    = $variations[0]['price'];
							if ( ! floatval( $regular_price ) || floatval( $regular_price ) == floatval( $sale_price ) ) {
								$regular_price = $sale_price;
								$sale_price    = '';
							}
							$description = isset( $product_data['body_html'] ) ? html_entity_decode( $product_data['body_html'], ENT_QUOTES | ENT_XML1, 'UTF-8' ) : '';
							$data        = array( // Set up the basic post data to insert for our product
								'post_type'    => 'product',
								'post_excerpt' => '',
								'post_content' => $description,
								'post_title'   => isset( $product_data['title'] ) ? $product_data['title'] : '',
								'post_status'  => $product_status,
								'post_parent'  => '',

								'meta_input' => array(
									'_sku'                => VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sku_exists( $variations[0]['sku'] ) ? '' : $variations[0]['sku'],
									'_visibility'         => 'visible',
									'_shopify_product_id' => $shopify_id,
									'_regular_price'      => $regular_price,
									'_price'              => $regular_price,
								)
							);
							if ( $keep_slug && $product_data['handle'] ) {
								$data['post_name'] = $product_data['handle'];
							}
							if ( $manage_stock ) {
								$data['meta_input']['_manage_stock'] = 'yes';
								if ( $variations[0]['inventory_quantity'] ) {
									$data['meta_input']['_stock']        = $variations[0]['inventory_quantity'];
									$data['meta_input']['_stock_status'] = 'instock';
								} else {
									$data['meta_input']['_stock_status'] = 'outofstock';
								}
							} else {
								$data['meta_input']['_manage_stock'] = 'no';
								$data['meta_input']['_stock_status'] = 'instock';
							}
							if ( $variations[0]['weight'] ) {
								$data['meta_input']['_weight'] = $variations[0]['weight'];
							}

							if ( $sale_price ) {
								$data['meta_input']['_sale_price'] = $sale_price;
								$data['meta_input']['_price']      = $sale_price;
							}
							$product_id = wp_insert_post( $data );
							if ( ! is_wp_error( $product_id ) ) {
								if ( $description && $download_description_images ) {
									preg_match_all( '/src="([\s\S]*?)"/im', $description, $matches );
									if ( isset( $matches[1] ) && is_array( $matches[1] ) && count( $matches[1] ) ) {
										$description_images = array_unique( $matches[1] );
										$this->process      = new WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_New();
										foreach ( $description_images as $description_image ) {
											$images_data = array(
												'id'          => '',
												'src'         => $description_image,
												'alt'         => '',
												'parent_id'   => $product_id,
												'product_ids' => array(),
												'set_gallery' => 2,
											);
											$this->process->push_to_queue( $images_data );
										}
										$this->process->save()->dispatch();
									}
								}
								self::log( $path, "Product #{$product_id} was successfully imported from Shopify #{$shopify_id}" );
								wp_set_object_terms( $product_id, 'simple', 'product_type' );
								if ( ! empty( $product_data['product_type'] ) ) {
									wp_set_object_terms( $product_id, $product_data['product_type'], 'product_cat', true );
								}
								if ( is_array( $product_categories ) && count( $product_categories ) ) {
									wp_set_post_terms( $product_id, $product_categories, 'product_cat', true );
								}
								$tags = isset( $product_data['tags'] ) ? $product_data['tags'] : '';
								if ( $tags ) {
									wp_set_object_terms( $product_id, explode( ',', $product_data['tags'] ), 'product_tag' );
								}
							} else {
								self::log( $path, "Failed importing product from Shopify #{$shopify_id}, {$product_id->get_error_message()}" );
							}
						} else {
							if ( $global_attributes ) {
								foreach ( $options as $option_k => $option_v ) {
									$attribute_slug = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sanitize_taxonomy_name( $option_v['name'] );
									$attribute_id   = wc_attribute_taxonomy_id_by_name( $option_v['name'] );
									if ( ! $attribute_id ) {
										$attribute_id = wc_create_attribute( array(
											'name'         => $option_v['name'],
											'slug'         => $attribute_slug,
											'type'         => 'select',
											'order_by'     => 'menu_order',
											'has_archives' => false,
										) );
									}
									if ( $attribute_id && ! is_wp_error( $attribute_id ) ) {
										$attribute_obj     = wc_get_attribute( $attribute_id );
										$attribute_options = array();
										if ( ! empty( $attribute_obj ) ) {
											$taxonomy                   = $attribute_obj->slug; // phpcs:ignore
											$wp_taxonomies[ $taxonomy ] = new WP_Taxonomy( $taxonomy, 'product' );
											if ( count( $option_v['values'] ) ) {
												foreach ( $option_v['values'] as $term_k => $term_v ) {
													$option_v['values'][ $term_k ] = strval( wc_clean( $term_v ) );
													$insert_term                   = wp_insert_term( $option_v['values'][ $term_k ], $taxonomy );
													if ( ! is_wp_error( $insert_term ) ) {
														$attribute_options[] = $insert_term['term_id'];
													} elseif ( isset( $insert_term->error_data ) && isset( $insert_term->error_data['term_exists'] ) ) {
														$attribute_options[] = $insert_term->error_data['term_exists'];
													}
												}
											}
										}
										$attribute_object = new WC_Product_Attribute();
										$attribute_object->set_id( $attribute_id );
										$attribute_object->set_name( wc_attribute_taxonomy_name_by_id( $attribute_id ) );
										if ( count( $attribute_options ) ) {
											$attribute_object->set_options( $attribute_options );
										} else {
											$attribute_object->set_options( $option_v['values'] );
										}
										$attribute_object->set_position( $option_v['position'] );
										$attribute_object->set_visible( 0 );
										$attribute_object->set_variation( 1 );
										$attr_data[] = $attribute_object;
									}
								}
							} else {
								foreach ( $options as $option_k => $option_v ) {
									$attribute_object = new WC_Product_Attribute();
									$attribute_object->set_name( $option_v['name'] );
									$attribute_object->set_options( $option_v['values'] );
									$attribute_object->set_position( $option_v['position'] );
									$attribute_object->set_visible( 0 );
									$attribute_object->set_variation( 1 );
									$attr_data[] = $attribute_object;
								}
							}
							$description = isset( $product_data['body_html'] ) ? html_entity_decode( $product_data['body_html'], ENT_QUOTES | ENT_XML1, 'UTF-8' ) : '';
							$data        = array( // Set up the basic post data to insert for our product
								'post_type'    => 'product',
								'post_excerpt' => '',
								'post_content' => $description,
								'post_title'   => isset( $product_data['title'] ) ? $product_data['title'] : '',
								'post_status'  => $product_status,
								'post_parent'  => '',

								'meta_input' => array(
									'_sku'                => $sku,
									'_visibility'         => 'visible',
									'_shopify_product_id' => $shopify_id,
									'_manage_stock'       => 'no',
								)
							);
							if ( $keep_slug && $product_data['handle'] ) {
								$data['post_name'] = $product_data['handle'];
							}
							$product_id = wp_insert_post( $data );
							if ( ! is_wp_error( $product_id ) ) {
								if ( $description && $download_description_images ) {
									preg_match_all( '/src="([\s\S]*?)"/im', $description, $matches );
									if ( isset( $matches[1] ) && is_array( $matches[1] ) && count( $matches[1] ) ) {
										$description_images = array_unique( $matches[1] );
										$this->process      = new WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_New();
										foreach ( $description_images as $description_image ) {
											$images_data = array(
												'id'          => '',
												'src'         => $description_image,
												'alt'         => '',
												'parent_id'   => $product_id,
												'product_ids' => array(),
												'set_gallery' => 2,
											);
											$this->process->push_to_queue( $images_data );
										}
										$this->process->save()->dispatch();
									}
								}
								self::log( $path, "Product #{$product_id} was successfully imported from Shopify #{$shopify_id}" );
								wp_set_object_terms( $product_id, 'variable', 'product_type' );
								if ( count( $attr_data ) ) {
									$product_obj = wc_get_product( $product_id );
									if ( $product_obj ) {
										$product_obj->set_attributes( $attr_data );
										$product_obj->save();
										wp_set_object_terms( $product_id, 'variable', 'product_type' );
									}
								}
								if ( ! empty( $product_data['product_type'] ) ) {
									wp_set_object_terms( $product_id, $product_data['product_type'], 'product_cat', true );
								}
								if ( is_array( $product_categories ) && count( $product_categories ) ) {
									wp_set_post_terms( $product_id, $product_categories, 'product_cat', true );
								}
								$tags = isset( $product_data['tags'] ) ? $product_data['tags'] : '';
								if ( $tags ) {
									wp_set_object_terms( $product_id, explode( ',', $product_data['tags'] ), 'product_tag' );
								}
								if ( is_array( $variations ) && count( $variations ) ) {
									foreach ( $variations as $variation ) {
										vi_s2w_set_time_limit();
										$regular_price = $variation['compare_at_price'];
										$sale_price    = $variation['price'];
										if ( ! floatval( $regular_price ) || floatval( $regular_price ) == floatval( $sale_price ) ) {
											$regular_price = $sale_price;
											$sale_price    = '';
										}
										$variation_obj = new WC_Product_Variation();
										$variation_obj->set_parent_id( $product_id );
										$attributes = array();
										if ( $global_attributes ) {
											foreach ( $options as $option_k => $option_v ) {
												$j = $option_k + 1;
												if ( isset( $variation[ 'option' . $j ] ) && $variation[ 'option' . $j ] ) {
													$attribute_id  = wc_attribute_taxonomy_id_by_name( $option_v['name'] );
													$attribute_obj = wc_get_attribute( $attribute_id );
													if ( $attribute_obj ) {
														$attribute_value = get_term_by( 'name', $variation[ 'option' . $j ], $attribute_obj->slug );
														if ( $attribute_value ) {
															$attributes[ VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sanitize_taxonomy_name( $attribute_obj->slug ) ] = $attribute_value->slug;
														}
													}
												}
											}
										} else {
											foreach ( $options as $option_k => $option_v ) {
												$j = $option_k + 1;
												if ( isset( $variation[ 'option' . $j ] ) && $variation[ 'option' . $j ] ) {
													$attributes[ VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sanitize_taxonomy_name( $option_v['name'] ) ] = $variation[ 'option' . $j ];
												}
											}
										}
										$variation_obj->set_attributes( $attributes );
										$fields = array(
											'sku'           => VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::sku_exists( $variation['sku'] ) ? '' : $variation['sku'],
											'regular_price' => $regular_price,
										);
										if ( $manage_stock ) {
											$fields['stock_quantity'] = $variation['inventory_quantity'];
											$fields['manage_stock']   = 'yes';
											if ( $variation['inventory_quantity'] ) {
												$fields['stock_status'] = 'instock';
											} else {
												$fields['stock_status'] = 'outofstock';
											}
										} else {
											$fields['manage_stock'] = 'no';
											$fields['stock_status'] = 'instock';
										}
										if ( $variation['weight'] ) {
											$fields['weight'] = $variation['weight'];
										}
										if ( $sale_price ) {
											$fields['sale_price'] = $sale_price;
										}
										foreach ( $fields as $field => $field_v ) {
											$variation_obj->{"set_$field"}( wc_clean( $field_v ) );
										}
										do_action( 'product_variation_linked', $variation_obj->save() );
										update_post_meta( $variation_obj->get_id(), '_shopify_variation_id', $variation['id'] );
									}
								}
							} else {
								self::log( $path, "Failed importing product from Shopify #{$shopify_id}, {$product_id->get_error_message()}" );
							}
						}
					}
				}
			} else {
				self::log( $path, "Can not import product {$shopify_id}, SKU exists {$sku}" );
			}
		}

		public static function verify_webhook( $data, $hmac_header, $shared_secret ) {
			$calculated_hmac = base64_encode( hash_hmac( 'sha256', $data, $shared_secret, true ) );

			return hash_equals( $hmac_header, $calculated_hmac );
		}

		public static function set( $name, $set_name = false ) {
			return VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::set( $name, $set_name );
		}

		public static function log( $path, $content ) {
			VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::log( $path . 'webhooks_logs.txt', $content );
		}
	}
}