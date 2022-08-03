<?php

class WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_Cron_Update_Orders_Get_Data extends WP_Background_Process {

	/**
	 * @var string
	 */
	protected $action = 's2w_process_cron_update_orders_get_data';

	/**
	 * Task
	 *
	 * Override this method to perform any actions required on each
	 * queue item. Return the modified item for further processing
	 * in the next pass through. Or, return false to remove the
	 * item from the queue.
	 *
	 * @param mixed $item Queue item to iterate over
	 *
	 * @return mixed
	 */
	protected function task( $item ) {
		$data = isset( $item['data'] ) ? $item['data'] : array();

		if ( is_array( $data ) && count( $data ) ) {
			try {
				$settings   = new VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA();
				$domain     = $settings->get_params( 'domain' );
				$api_key    = $settings->get_params( 'api_key' );
				$api_secret = $settings->get_params( 'api_secret' );
				if ( $domain && $api_key && $api_secret ) {
					vi_s2w_init_set();
					$path = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::get_cache_path( $domain, $api_key, $api_secret ) . '/';
					VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::create_cache_folder( $path );
					$file             = $path . 'update_orders_data.txt';
					$log_file         = $path . 'cron_update_orders_logs.txt';
					$old_product_data = array();
					if ( is_file( $file ) ) {
						$old_product_data = file_get_contents( $file );
						if ( $old_product_data ) {
							$old_product_data = vi_s2w_json_decode( $old_product_data );
						}
					}
					add_filter( 'http_request_timeout', array( $this, 'bump_request_timeout' ) );
					$request = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::wp_remote_get( $domain, $api_key, $api_secret, 'orders', false, array(
						'status' => 'any',
						'fields' => array(
							'id',
							'billing_address',
							'email',
							'fulfillments',
							'financial_status',
							'shipping_address',
						),
						'ids'    => array_values( $data )
					) );
					if ( $request['status'] === 'success' ) {
						$orders = $request['data'];
						if ( is_array( $orders ) && count( $orders ) ) {
							$change = 0;
							foreach ( $orders as $order ) {
								$shopify_order_id = strval( $order['id'] );
								$new_data_get     = $order;
								$order_id         = array_search( $shopify_order_id, $data );
								if ( $order_id !== false ) {
									if ( array_key_exists( $shopify_order_id, $old_product_data ) ) {
										if ( json_encode( $old_product_data[ $shopify_order_id ] ) !== json_encode( $new_data_get ) ) {
											$old_product_data[ $shopify_order_id ] = $new_data_get;
											$this->queue_item_to_update( $order_id, $shopify_order_id, $order );
											$change ++;
										}
									} else {
										$old_product_data[ $shopify_order_id ] = $new_data_get;
										$this->queue_item_to_update( $order_id, $shopify_order_id, $order );
										$change ++;
									}
								}
							}
							if ( $change > 0 ) {
								file_put_contents( $file, json_encode( $old_product_data ) );
								S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_ADMIN_Cron_Update_Orders::$update_orders->save()->dispatch();
							}
						} else {
							VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::log( $log_file, 'Error: No data' );
						}

					} else {
						VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::log( $log_file, 'Error: ' . $request['data'] );
					}
				}
			} catch ( Exception $e ) {
				error_log( 'S2W error log - cron get data to update orders: ' . $e->getMessage() );

				return false;
			}
		}

		return false;
	}

	public function queue_item_to_update( $order_id, $shopify_order_id, $order ) {
		$new_data = array(
			'order_id'         => $order_id,
			'shopify_id'       => $shopify_order_id,
			'email'            => sanitize_email( $order['email'] ),
			'financial_status' => $order['financial_status'],
			'billing_address'  => json_encode( $order['billing_address'] ),
			'shipping_address' => json_encode( $order['shipping_address'] ),
			'fulfillments'     => json_encode( $order['fulfillments'] ),
		);
		S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_ADMIN_Cron_Update_Orders::$update_orders->push_to_queue( $new_data );
	}

	/**
	 * Is the updater running?
	 *
	 * @return boolean
	 */
	public function is_downloading() {
		return $this->is_process_running();
	}

	/**
	 * Complete
	 *
	 * Override if applicable, but ensure that the below actions are
	 * performed, or, call parent::complete().
	 */
	protected function complete() {
		// Show notice to user or perform some other arbitrary task...
		parent::complete();
	}

	/**
	 * Delete all batches.
	 *
	 * @return WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_Cron_Update_Orders_Get_Data
	 */
	public function delete_all_batches() {
		global $wpdb;

		$table  = $wpdb->options;
		$column = 'option_name';

		if ( is_multisite() ) {
			$table  = $wpdb->sitemeta;
			$column = 'meta_key';
		}

		$key = $wpdb->esc_like( $this->identifier . '_batch_' ) . '%';

		$wpdb->query( $wpdb->prepare( "DELETE FROM {$table} WHERE {$column} LIKE %s", $key ) ); // @codingStandardsIgnoreLine.

		return $this;
	}

	/**
	 * Kill process.
	 *
	 * Stop processing queue items, clear cronjob and delete all batches.
	 */
	public function kill_process() {
		if ( ! $this->is_queue_empty() ) {
			$this->delete_all_batches();
			wp_clear_scheduled_hook( $this->cron_hook_identifier );
		}
	}

	public function bump_request_timeout( $val ) {
		return 600;
	}
}