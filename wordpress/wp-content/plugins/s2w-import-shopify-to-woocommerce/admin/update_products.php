<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_ADMIN_Update_Products' ) ) {
	class S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_ADMIN_Update_Products {
		protected $settings;
		protected $is_page;
		protected $request;
		protected $process;
		protected $process_for_update;
		protected $process_single;
		protected $process_post_image;
		protected $my_options;
		protected $gmt_offset;

		public function __construct() {
			$this->settings = new VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA();
			add_action( 'plugins_loaded', array( $this, 'plugins_loaded' ) );
			add_action( 'admin_notices', array( $this, 'admin_notices' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_script' ) );
			add_filter( 'manage_edit-product_columns', array( $this, 'button_update_from_shopify' ) );
			add_action( 'manage_product_posts_custom_column', array( $this, 'column_callback_product' ) );
			add_action( 'wp_ajax_s2w_update_products', array( $this, 'update_products' ) );
			add_action( 'wp_ajax_s2w_update_product_options_save', array( $this, 'save_options' ) );
//			add_filter('s2w_process_for_update_cron_interval',array( $this, 'cron_interval' ));
		}

		public function cron_interval( $interval ) {
			return 1;
		}

		public static function set( $name, $set_name = false ) {
			return VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::set( $name, $set_name );
		}

		public function admin_notices() {
			if ( $this->process_for_update->is_downloading() ) {
				?>
                <div class="updated">
                    <h4>
						<?php esc_html_e( 'S2W - Update product images: Product images are being downloaded in the background.', 's2w-import-shopify-to-woocommerce' ) ?>
                    </h4>
                    <div>
						<?php printf( __( 'Please goto <a target="_blank" href="%s">Media</a> and view downloaded product images. If <strong>some images are downloaded repeatedly and no new images are downloaded</strong>, please:', 's2w-import-shopify-to-woocommerce' ), esc_url( admin_url( 'upload.php' ) ) ) ?>
                        <ol>
                            <li><?php printf( __( '<strong>Stop updating products immediately</strong>', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                            <li><?php printf( __( '<a class="s2w-cancel-download-images-button" href="%s">Cancel downloading</a></strong>', 's2w-import-shopify-to-woocommerce' ), esc_url( add_query_arg( array( 's2w_cancel_download_image_for_update' => '1', ), $_SERVER['REQUEST_URI'] ) ) ) ?></li>
                            <li><?php printf( __( 'Contact <strong>support@villatheme.com</strong> or create your ticket at <a target="_blank" href="https://villatheme.com/supports/forum/plugins/import-shopify-to-woocommerce/">https://villatheme.com/supports/forum/plugins/import-shopify-to-woocommerce/</a>', 's2w-import-shopify-to-woocommerce' ) ) ?></li>
                        </ol>
                    </div>
                </div>
				<?php
			} elseif ( ! $this->process_for_update->is_queue_empty() ) {
				?>
                <div class="updated">
                    <h4>
						<?php esc_html_e( 'S2W - Update product images: There are products images in the queue.', 's2w-import-shopify-to-woocommerce' ) ?>
                    </h4>
                    <ol>
                        <li>
							<?php printf( __( 'If the same images are downloaded again and again, please <strong><a class="s2w-empty-queue-images-button" href="%s">Empty queue</a></strong> and go to Products to update missing images for your products.', 's2w-import-shopify-to-woocommerce' ), esc_url( add_query_arg( array( 's2w_cancel_download_image_for_update' => '1', ), $_SERVER['REQUEST_URI'] ) ) ) ?>
                        </li>
                        <li>
							<?php printf( __( 'If products images were downloading normally before, please <strong><a class="s2w-start-download-images-button" href="%s">Resume download</a></strong>', 's2w-import-shopify-to-woocommerce' ), add_query_arg( array( 's2w_start_download_image_for_update' => '1', ), esc_url( $_SERVER['REQUEST_URI'] ) ) ) ?>
                        </li>
                    </ol>
                </div>
				<?php
			} elseif ( get_transient( 's2w_background_processing_complete_for_update' ) ) {
				delete_transient( 's2w_background_processing_complete_for_update' );
				?>
                <div class="updated">
                    <p>
						<?php esc_html_e( 'S2W - Update product images: Product images are downloaded successfully.', 's2w-import-shopify-to-woocommerce' ) ?>
                    </p>
                </div>
				<?php
			}

		}

		public function plugins_loaded() {
			$this->process_for_update = new WP_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_Process_For_Update();
			if ( ! empty( $_REQUEST['s2w_cancel_download_image_for_update'] ) ) {
				$this->process_for_update->kill_process();
				wp_safe_redirect( @remove_query_arg( 's2w_cancel_download_image_for_update' ) );
				exit;
			} elseif ( ! empty( $_REQUEST['s2w_start_download_image_for_update'] ) ) {
				if ( ! $this->process_for_update->is_queue_empty() ) {
					$this->process_for_update->dispatch();
				}
				wp_safe_redirect( @remove_query_arg( 's2w_start_download_image_for_update' ) );
				exit;
			}
		}

		public function button_update_from_shopify( $cols ) {
			$cols['s2w_update_from_shopify'] = '<span class="s2w-button ' . self::set( 'shopify-update-product' ) . '">' . __( 'Update from Shopify', 's2w-import-shopify-to-woocommerce' ) . '</span>';

			return $cols;
		}

		public function column_callback_product( $col ) {
			global $post;
			if ( $col === 's2w_update_from_shopify' ) {
				if ( null === $this->gmt_offset ) {
					$this->gmt_offset = get_option( 'gmt_offset' );
				}
				$all_options = array(
					'title'                => esc_html__( 'Title', 's2w-import-shopify-to-woocommerce' ),
					'price'                => esc_html__( 'Price', 's2w-import-shopify-to-woocommerce' ),
					'inventory'            => esc_html__( 'Inventory', 's2w-import-shopify-to-woocommerce' ),
					'description'          => esc_html__( 'Description', 's2w-import-shopify-to-woocommerce' ),
					'images'               => esc_html__( 'Images', 's2w-import-shopify-to-woocommerce' ),
					'variation_attributes' => esc_html__( 'Variation attributes', 's2w-import-shopify-to-woocommerce' ),
					'variation_sku'        => esc_html__( 'Variation SKU', 's2w-import-shopify-to-woocommerce' ),
					'product_url'          => esc_html__( 'Product slug', 's2w-import-shopify-to-woocommerce' ),
				);
				$post_id     = $post->ID;
				$shopify_id  = get_post_meta( $post_id, '_shopify_product_id', true );
				if ( ! $shopify_id ) {
					$shopify_id = get_post_meta( $post_id, '_s2w_shopipy_product_id', true );
				}
				$update_history = get_post_meta( $post_id, '_s2w_update_history', true );
				if ( $shopify_id ) {
					?>
                    <div class="<?php echo esc_attr( self::set( 'update-from-shopify-history' ) ) ?>">
						<?php
						if ( $update_history ) {
							$update_time        = isset( $update_history['time'] ) ? $update_history['time'] : '';
							$update_status      = isset( $update_history['status'] ) ? $update_history['status'] : '';
							$update_fields      = isset( $update_history['fields'] ) ? $update_history['fields'] : array();
							$update_fields_html = array();
							if ( is_array( $update_fields ) && count( $update_fields ) ) {
								foreach ( $update_fields as $update_field ) {
									$update_fields_html[] = $all_options[ $update_field ];
								}
								$update_fields_html = implode( ', ', $update_fields_html );
							}
							?>
                            <p><?php esc_html_e( 'Last update: ', 's2w-import-shopify-to-woocommerce' ) ?>
                                <strong><span
                                            class="<?php echo esc_attr( self::set( 'update-from-shopify-history-time' ) ) ?>"><?php echo esc_html( date_i18n( 'F d, Y H:i:s', $update_time + $this->gmt_offset * 3600 ) ) ?></span></strong>
                            </p>
                            <p><?php esc_html_e( 'Status: ', 's2w-import-shopify-to-woocommerce' ) ?><strong><span
                                            class="<?php echo esc_attr( self::set( array(
												'update-from-shopify-history-status',
												'update-from-shopify-history-status-' . $update_status
											) ) ) ?>"><?php echo esc_html( ucwords( $update_status ) ) ?></span></strong>
                            </p>
                            <p><?php esc_html_e( 'Update field(s): ', 's2w-import-shopify-to-woocommerce' ) ?>
                                <strong><span
                                            class="<?php echo esc_attr( self::set( 'update-from-shopify-history-fields' ) ) ?>"><?php echo $update_fields_html ?></span></strong>
                            </p>
							<?php

						} else {
							?>
                            <p><?php esc_html_e( 'Last update: ', 's2w-import-shopify-to-woocommerce' ) ?>
                                <strong><span
                                            class="<?php echo esc_attr( self::set( 'update-from-shopify-history-time' ) ) ?>"></span></strong>
                            </p>
                            <p><?php esc_html_e( 'Status: ', 's2w-import-shopify-to-woocommerce' ) ?><strong><span
                                            class="<?php echo esc_attr( self::set( 'update-from-shopify-history-status' ) ) ?>"></span></strong>
                            </p>
                            <p><?php esc_html_e( 'Update field(s): ', 's2w-import-shopify-to-woocommerce' ) ?>
                                <strong><span
                                            class="<?php echo esc_attr( self::set( 'update-from-shopify-history-fields' ) ) ?>"></span></strong>
                            </p>
							<?php
						}
						?>
                    </div>
                    <span class="s2w-button <?php echo esc_attr( self::set( 'shopify-product-id' ) ) ?>"
                          data-product_id="<?php echo esc_attr( $post_id ) ?>"
                          data-shopify_product_id="<?php echo esc_attr( $shopify_id ) ?>"><?php esc_html_e( 'Update', 's2w-import-shopify-to-woocommerce' ) ?>
                        </span>
					<?php
				}
			}
		}

		public function save_options() {
			$update_product_options                  = isset( $_POST['update_product_options'] ) ? stripslashes_deep( $_POST['update_product_options'] ) : array();
			$update_product_options_show             = isset( $_POST['update_product_options_show'] ) ? sanitize_text_field( $_POST['update_product_options_show'] ) : '';
			$settings                                = $this->settings->get_params();
			$settings['update_product_options']      = $update_product_options;
			$settings['update_product_options_show'] = $update_product_options_show;
			VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::update_option( 's2w_params', $settings );
			wp_send_json( array(
				'status' => 'success'
			) );
		}

		public function update_products() {
			global $wp_taxonomies;
			ignore_user_abort( true );

			$gmt_offset             = get_option( 'gmt_offset' );
			$product_id             = isset( $_POST['product_id'] ) ? sanitize_text_field( $_POST['product_id'] ) : '';
			$update_product_options = $this->settings->get_params( 'update_product_options' );
			$global_attributes      = $this->settings->get_params( 'global_attributes' );
			$manage_stock           = ( 'yes' === get_option( 'woocommerce_manage_stock' ) ) ? true : false;
			if ( isset( $_POST['update_product_options'] ) ) {
				$update_product_options                  = $_POST['update_product_options'];
				$settings                                = $this->settings->get_params();
				$settings['update_product_options']      = $update_product_options;
				$settings['update_product_options_show'] = isset( $_POST['update_product_options_show'] ) ? sanitize_text_field( $_POST['update_product_options_show'] ) : '';
				VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::update_option( 's2w_params', $settings );
			}
			$update_history = array(
				'time'    => current_time( 'timestamp', true ),
				'status'  => 'error',
				'fields'  => $update_product_options,
				'message' => '',
			);
			$all_options    = array(
				'title'                => esc_html__( 'Title', 's2w-import-shopify-to-woocommerce' ),
				'price'                => esc_html__( 'Price', 's2w-import-shopify-to-woocommerce' ),
				'inventory'            => esc_html__( 'Inventory', 's2w-import-shopify-to-woocommerce' ),
				'description'          => esc_html__( 'Description', 's2w-import-shopify-to-woocommerce' ),
				'images'               => esc_html__( 'Images', 's2w-import-shopify-to-woocommerce' ),
				'variation_attributes' => esc_html__( 'Variation attributes', 's2w-import-shopify-to-woocommerce' ),
				'variation_sku'        => esc_html__( 'Variation SKU', 's2w-import-shopify-to-woocommerce' ),
				'product_url'          => esc_html__( 'Product slug', 's2w-import-shopify-to-woocommerce' ),
			);
			$fields         = array();
			foreach ( $update_product_options as $update_field ) {
				$fields[] = $all_options[ $update_field ];
			}
			$fields = implode( ', ', $fields );
			if ( $product_id ) {
				$domain     = $this->settings->get_params( 'domain' );
				$api_key    = $this->settings->get_params( 'api_key' );
				$api_secret = $this->settings->get_params( 'api_secret' );
				$product    = wc_get_product( $product_id );
				if ( $product ) {
					$shopify_id = get_post_meta( $product_id, '_shopify_product_id', true );
					if ( ! $shopify_id ) {
						$shopify_id = get_post_meta( $product_id, '_s2w_shopipy_product_id', true );
					}
					if ( $shopify_id ) {
						add_filter( 'http_request_timeout', array( $this, 'bump_request_timeout' ) );
						$request = VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_DATA::wp_remote_get( $domain, $api_key, $api_secret, 'products', false, array( 'ids' => $shopify_id ) );
						if ( $request['status'] === 'success' ) {
							$product_data = $request['data'];
							if ( count( $product_data ) ) {
								$variants = isset( $product_data['variants'] ) ? $product_data['variants'] : array();
								$options  = isset( $product_data['options'] ) ? $product_data['options'] : array();
//								if ( count( $options ) > 1 ) {
//									foreach ( $options as $option_k => $option_v ) {
//										if ( ! isset( $option_v['values'] ) || ! is_array( $option_v['values'] ) || count( $option_v['values'] ) < 2 ) {
//											unset( $options[ $option_k ] );
//										}
//									}
//								}
								$new_data = array();
								if ( ! count( $options ) || ! count( $variants ) ) {
									$update_history['status']  = 'error';
									$update_history['message'] = esc_html__( 'Invalid data', 's2w-import-shopify-to-woocommerce' );
									update_post_meta( $product_id, '_s2w_update_history', $update_history );
									$response           = $update_history;
									$response['time']   = date_i18n( 'F d, Y H:i:s', $response['time'] + $gmt_offset * 3600 );
									$response['fields'] = $fields;
									wp_send_json( $response );
								}

								if ( count( array_intersect( $update_product_options, array(
										'price',
										'inventory',
									) ) ) == 2 ) {
									if ( $product->is_type( 'variable' ) ) {
										update_post_meta( $product_id, '_manage_stock', 'no' );
										$variations = $product->get_children();
										if ( count( $variations ) ) {
											$attr_data = array();
											if ( in_array( 'variation_attributes', $update_product_options ) ) {
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
															$attribute_obj = wc_get_attribute( $attribute_id );
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
															if ( $sku && in_array( 'variation_sku', $update_product_options ) ) {
																update_post_meta( $variation_id, '_sku', $sku );
															}
															$regular_price = $variant_v['compare_at_price'];
															$sale_price    = $variant_v['price'];
															if ( ! floatval( $regular_price ) || floatval( $regular_price ) == floatval( $sale_price ) ) {
																$regular_price = $sale_price;
																$sale_price    = '';
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
															$variation->set_regular_price( $regular_price );
															$variation->set_sale_price( $sale_price );
															if ( $manage_stock ) {
																$variation->set_manage_stock( 'yes' );
																$variation->set_stock_quantity( $inventory );
															} else {
																$variation->set_manage_stock( 'no' );
																delete_post_meta( $variation_id, '_stock' );
																$variation->set_stock_status( 'instock' );
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
									} else {
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
										if ( $manage_stock ) {
											$inventory = $variants[0]['inventory_quantity'];
											$product->set_manage_stock( 'yes' );
											$product->set_stock_quantity( $inventory );
										} else {
											$product->set_manage_stock( 'no' );
											delete_post_meta( $product_id, '_stock' );
											$product->set_stock_status( 'instock' );
										}
										$product->save();
									}
									$new_data['price'] = $product->get_price_html();
								} else if ( in_array( 'price', $update_product_options ) ) {
									if ( $product->is_type( 'variable' ) ) {
										$variations = $product->get_children();
										if ( count( $variations ) ) {
											$attr_data = array();
											if ( in_array( 'variation_attributes', $update_product_options ) ) {
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
															$attribute_obj = wc_get_attribute( $attribute_id );
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
															if ( $sku && in_array( 'variation_sku', $update_product_options ) ) {
																update_post_meta( $variation_id, '_sku', $sku );
															}
															$regular_price = $variant_v['compare_at_price'];
															$sale_price    = $variant_v['price'];
															if ( ! floatval( $regular_price ) || floatval( $regular_price ) == floatval( $sale_price ) ) {
																$regular_price = $sale_price;
																$sale_price    = '';
															}
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
															$variation->set_regular_price( $regular_price );
															$variation->set_sale_price( $sale_price );
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
									} else {
										if ( in_array( 'variation_sku', $update_product_options ) ) {
											$sku = $variants[0]['sku'];
											if ( $sku ) {
												update_post_meta( $product_id, '_sku', $sku );
											}
										}
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
									$new_data['price'] = $product->get_price_html();
								} elseif ( in_array( 'inventory', $update_product_options ) ) {
									if ( $product->is_type( 'variable' ) ) {
										update_post_meta( $product_id, '_manage_stock', 'no' );
										$variations = $product->get_children();
										if ( count( $variations ) ) {
											$attr_data = array();
											if ( in_array( 'variation_attributes', $update_product_options ) ) {
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
															$attribute_obj = wc_get_attribute( $attribute_id );
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
															if ( $sku && in_array( 'variation_sku', $update_product_options ) ) {
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
															if ( $manage_stock ) {
																$variation->set_manage_stock( 'yes' );
																$variation->set_stock_quantity( $inventory );
															} else {
																$variation->set_manage_stock( 'no' );
																delete_post_meta( $variation_id, '_stock' );
																$variation->set_stock_status( 'instock' );
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
									} else {
										if ( in_array( 'variation_sku', $update_product_options ) ) {
											$sku = $variants[0]['sku'];
											if ( $sku ) {
												update_post_meta( $product_id, '_sku', $sku );
											}
										}
										if ( $manage_stock ) {
											$inventory = $variants[0]['inventory_quantity'];
											$product->set_manage_stock( 'yes' );
											$product->set_stock_quantity( $inventory );
										} else {
											$product->set_manage_stock( 'no' );
											delete_post_meta( $product_id, '_stock' );
											$product->set_stock_status( 'instock' );
										}
										$product->save();
									}
								} elseif ( $product->is_type( 'variable' ) ) {
									if ( in_array( 'variation_attributes', $update_product_options ) ) {
										$variations = $product->get_children();
										if ( count( $variations ) ) {
											$attr_data = array();
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

											foreach ( $variations as $variation_k => $variation_id ) {
												vi_s2w_set_time_limit();
												$shopify_variation_id = get_post_meta( $variation_id, '_shopify_variation_id', true );
												if ( $shopify_variation_id ) {
													foreach ( $variants as $variant_k => $variant_v ) {
														vi_s2w_set_time_limit();
														if ( $variant_v['id'] == $shopify_variation_id ) {
															$attributes = array();
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
															$sku = $variant_v['sku'];
															if ( $sku && in_array( 'variation_sku', $update_product_options ) ) {
																update_post_meta( $variation_id, '_sku', $sku );
															}


															if ( count( $attributes ) ) {
																$variation = wc_get_product( $variation_id );
																$variation->set_attributes( $attributes );
																$variation->save();
															}
															break;
														}
													}
												}
											}
										}
									} elseif ( in_array( 'variation_sku', $update_product_options ) ) {
										$variations = $product->get_children();
										if ( count( $variations ) ) {
											foreach ( $variants as $variant_k => $variant_v ) {
												vi_s2w_set_time_limit();
												$sku = $variant_v['sku'];
												if ( $sku ) {
													foreach ( $variations as $variation_k => $variation_id ) {
														vi_s2w_set_time_limit();
														$shopify_variation_id = get_post_meta( $variation_id, '_shopify_variation_id', true );
														if ( $shopify_variation_id && $variant_v['id'] == $shopify_variation_id ) {
															update_post_meta( $variation_id, '_sku', $sku );
															break;
														}
													}
												}

											}
										}
									}
								} elseif ( in_array( 'variation_sku', $update_product_options ) ) {
									$sku = $variants[0]['sku'];
									if ( $sku ) {
										update_post_meta( $product_id, '_sku', $sku );
									}
								}

								if ( in_array( 'product_url', $update_product_options ) ) {
									$handle = isset( $product_data['handle'] ) ? $product_data['handle'] : '';
									if ( $handle ) {
										$product->set_slug( $handle );
										$product->save();
									}
								}
								$dispatch = false;
								if ( in_array( 'images', $update_product_options ) ) {
									$current_product_image = get_post_meta( $product_id, '_thumbnail_id', true );
									$placeholder_image     = s2w_get_placeholder_image();
									$variations            = $product->is_type( 'variable' ) ? $product->get_children() : array();
									$images                = isset( $product_data['images'] ) ? $product_data['images'] : array();
									if ( is_array( $images ) && count( $images ) && ( ! $current_product_image || $current_product_image == $placeholder_image ) ) {
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
												$new_data['images'] = wp_get_attachment_image( $thumb_id, 'woocommerce_thumbnail' );
											} else {
												$update_history['status']  = 'error';
												$update_history['message'] = $thumb_id->get_error_message();
												update_post_meta( $product_id, '_s2w_update_history', $update_history );
												$response           = $update_history;
												$response['time']   = date_i18n( 'F d, Y H:i:s', $response['time'] + $gmt_offset * 3600 );
												$response['fields'] = $fields;
												wp_send_json( $response );
											}
										}
										if ( count( $images ) ) {
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
											$dispatch = true;
										}
									}
								}
								$update_data = array();
								if ( in_array( 'title', $update_product_options ) ) {
									$title = isset( $product_data['title'] ) ? $product_data['title'] : '';
									if ( $title ) {
										$update_data['post_title'] = $title;
										$new_data['title']         = $title;
									}
								}
								if ( in_array( 'description', $update_product_options ) ) {
									$description = isset( $product_data['body_html'] ) ? html_entity_decode( $product_data['body_html'], ENT_QUOTES | ENT_XML1, 'UTF-8' ) : '';
									if ( $description ) {
										if ( $this->settings->get_params( 'download_description_images' ) ) {
											preg_match_all( '/src="([\s\S]*?)"/im', $description, $matches );
											if ( isset( $matches[1] ) && is_array( $matches[1] ) && count( $matches[1] ) ) {
												$description_images = array_unique( $matches[1] );

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
												$dispatch = true;
											}
										}
										$update_data['post_content'] = $description;
									}
								}
								if ( count( $update_data ) ) {
									$update_data['ID'] = $product_id;
									wp_update_post( $update_data );
								}
								if ( $dispatch ) {
									$this->process_for_update->save()->dispatch();
								}
								$update_history['status']  = 'success';
								$update_history['message'] = '';
								update_post_meta( $product_id, '_s2w_update_history', $update_history );
								$response           = $update_history;
								$response['time']   = date_i18n( 'F d, Y H:i:s', $response['time'] + $gmt_offset * 3600 );
								$response['fields'] = $fields;
								wp_send_json( array_merge( $response, $new_data ) );
							} else {
								$update_history['status']  = 'error';
								$update_history['message'] = esc_html__( 'Not found', 's2w-import-shopify-to-woocommerce' );
								update_post_meta( $product_id, '_s2w_update_history', $update_history );
								$response           = $update_history;
								$response['time']   = date_i18n( 'F d, Y H:i:s', $response['time'] + $gmt_offset * 3600 );
								$response['fields'] = $fields;
								wp_send_json( $response );
							}
						} else {
							$update_history['status']  = 'error';
							$update_history['message'] = $request['data'];
							update_post_meta( $product_id, '_s2w_update_history', $update_history );
							$response           = $update_history;
							$response['time']   = date_i18n( 'F d, Y H:i:s', $response['time'] + $gmt_offset * 3600 );
							$response['fields'] = $fields;
							wp_send_json( $response );
						}
					}
					$response           = $update_history;
					$response['time']   = date_i18n( 'F d, Y H:i:s', $response['time'] + $gmt_offset * 3600 );
					$response['fields'] = $fields;
					wp_send_json( $response );
				}
			} else {
				wp_send_json( array(
					'status'  => 'error',
					'message' => ''
				) );
			}
		}

		public function bump_request_timeout( $val ) {
			return $this->settings->get_params( 'request_timeout' );
		}

		public function admin_enqueue_script() {
			global $pagenow;
			$post_type = isset( $_REQUEST['post_type'] ) ? sanitize_text_field( $_REQUEST['post_type'] ) : '';
			if ( $pagenow === 'edit.php' && $post_type === 'product' ) {
				wp_enqueue_style( 's2w-import-shopify-to-woocommerce-update-product', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_CSS . 'update-product.css' );

				wp_enqueue_script( 's2w-import-shopify-to-woocommerce-update-product', VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_JS . 'update-products.js', array( 'jquery' ), VI_S2W_IMPORT_SHOPIFY_TO_WOOCOMMERCE_VERSION );

				wp_localize_script( 's2w-import-shopify-to-woocommerce-update-product', 's2w_params_admin_update_products', array(
					'url'                         => admin_url( 'admin-ajax.php' ),
					'update_product_options'      => $this->settings->get_params( 'update_product_options' ),
					'update_product_options_show' => $this->settings->get_params( 'update_product_options_show' ),
				) );
				add_action( 'admin_footer', array( $this, 'wp_footer' ) );
			}
		}

		public function wp_footer() {
			$all_options    = array(
				'title'                => esc_html__( 'Product title', 's2w-import-shopify-to-woocommerce' ),
				'price'                => esc_html__( 'Product price', 's2w-import-shopify-to-woocommerce' ),
				'inventory'            => esc_html__( 'Product inventory', 's2w-import-shopify-to-woocommerce' ),
				'description'          => esc_html__( 'Product description', 's2w-import-shopify-to-woocommerce' ),
				'images'               => esc_html__( 'Product images', 's2w-import-shopify-to-woocommerce' ),
				'variation_attributes' => esc_html__( 'Variation attributes', 's2w-import-shopify-to-woocommerce' ),
				'variation_sku'        => esc_html__( 'Variation SKU', 's2w-import-shopify-to-woocommerce' ),
				'product_url'          => esc_html__( 'Product slug', 's2w-import-shopify-to-woocommerce' ),
			);
			$descriptions   = array(
				'description' => $this->settings->get_params( 'download_description_images' ) ? __( 'Download description images is currently <strong>Enabled</strong>', 's2w-import-shopify-to-woocommerce' ) : __( 'Download description images is currently <strong>Disabled</strong>', 's2w-import-shopify-to-woocommerce' ),
			);
			$update_options = $this->settings->get_params( 'update_product_options' );
			?>
            <div class="<?php echo esc_attr( self::set( array(
				'update-product-options-container',
				'hidden'
			) ) ) ?>">
				<?php wp_nonce_field( 's2w_update_product_options_action_nonce', '_s2w_update_product_options_nonce' ) ?>
                <div class="<?php echo esc_attr( self::set( 'overlay' ) ) ?>"></div>
                <div class="<?php echo esc_attr( self::set( 'update-product-options-content' ) ) ?>">
                    <div class="<?php echo esc_attr( self::set( 'update-product-options-content-header' ) ) ?>">
                        <h2><?php esc_html_e( 'Update products options', 's2w-import-shopify-to-woocommerce' ) ?></h2>
                        <span class="<?php echo esc_attr( self::set( 'update-product-options-close' ) ) ?>"></span>
                    </div>
                    <div class="<?php echo esc_attr( self::set( 'update-product-options-content-body' ) ) ?>">
						<?php
						foreach ( $all_options as $option_key => $option_value ) {
							?>
                            <div class="<?php echo esc_attr( self::set( 'update-product-options-content-body-row' ) ) ?>">
                                <div class="<?php echo esc_attr( self::set( 'update-product-options-option-wrap' ) ) ?>">
                                    <input type="checkbox" value="1"
                                           data-product_option="<?php echo $option_key ?>"
										<?php if ( in_array( $option_key, $update_options ) ) {
											echo esc_attr( 'checked' );
										} ?>
                                           id="<?php echo esc_attr( self::set( 'update-product-options-' . $option_key ) ) ?>"
                                           class="<?php echo esc_attr( self::set( 'update-product-options-option' ) ) ?>">
                                    <label for="<?php echo esc_attr( self::set( 'update-product-options-' . $option_key ) ) ?>"><?php echo $option_value ?></label>
									<?php
									if ( ! empty( $descriptions[ $option_key ] ) ) {
										?>
                                        <div class="<?php echo esc_attr( self::set( 'option-description' ) ) ?>"><?php echo $descriptions[ $option_key ] ?></div>
										<?php
									}
									?>
                                </div>
                            </div>
							<?php
						}

						?>
                    </div>
                    <div class="<?php echo esc_attr( self::set( 'update-product-options-content-body-1' ) ) ?>">
                        <div class="<?php echo esc_attr( self::set( 'update-product-options-content-body-row' ) ) ?>">
                            <input type="checkbox" value="1"
								<?php checked( '1', $this->settings->get_params( 'update_product_options_show' ) ) ?>
                                   id="<?php echo esc_attr( self::set( 'update-product-options-show' ) ) ?>"
                                   class="<?php echo esc_attr( self::set( 'update-product-options-show' ) ) ?>">
                            <label for="<?php echo esc_attr( self::set( 'update-product-options-show' ) ) ?>"><?php esc_html_e( 'Show these options when clicking on button "Update" for each product', 's2w-import-shopify-to-woocommerce' ) ?></label>
                        </div>
                    </div>
                    <div class="<?php echo esc_attr( self::set( 'update-product-options-content-footer' ) ) ?>">
                        <span class="button-primary <?php echo esc_attr( self::set( array(
	                        'update-product-options-button-save',
	                        'button',
	                        'hidden'
                        ) ) ) ?>">
                            <?php esc_html_e( 'Save', 's2w-import-shopify-to-woocommerce' ) ?>
                        </span>
                        <span class="button-primary <?php echo esc_attr( self::set( array(
							'update-product-options-button-update',
							'button',
							'hidden'
						) ) ) ?>">
                            <?php esc_html_e( 'Update selected', 's2w-import-shopify-to-woocommerce' ) ?>(<span
                                    class="<?php echo esc_attr( self::set( 'selected-number' ) ) ?>">0</span>)
                        </span>
                        <span class="button-primary <?php echo esc_attr( self::set( array(
							'update-product-options-button-update-single',
							'button',
							'hidden'
						) ) ) ?>" data-update_product_id="">
                            <?php esc_html_e( 'Update', 's2w-import-shopify-to-woocommerce' ) ?>
                        </span>
                        <span class="<?php echo esc_attr( self::set( array(
							'update-product-options-button-cancel',
							'button'
						) ) ) ?>">
                            <?php esc_html_e( 'Cancel', 's2w-import-shopify-to-woocommerce' ) ?>
                        </span>
                    </div>
                </div>
                <div class="<?php echo esc_attr( self::set( 'saving-overlay' ) ) ?>"></div>
            </div>
			<?php
		}
	}
}
