import fetch from 'isomorphic-unfetch';
import forOwn from 'lodash/forOwn';
import isEmpty from 'lodash/isEmpty';
import { stringify as convertObjectToQueryString } from 'qs';

import config from '../../config';
import { sendSentryEvent, sortDropdownOptions, sortFieldOptions, transformLocalTruckToAPITruck } from '../index';

class WordPressRestAPIClient {
    async _makeRequest<D, ER>(request: API.Request<ER>): Promise<API.Response<D | ER>> {
        const { url, errorReturn, queryParams, method = 'GET', body } = request;

        try {
            const options: RequestInit = { method };
            if (body) {
                options.body = JSON.stringify(body);
                options.headers = {
                    'Content-Type': 'application/json',
                };
            }

            const queryString = convertObjectToQueryString(queryParams, {
                addQueryPrefix: true,
                arrayFormat: 'brackets',
            });
            console.log(options);
            const response = await fetch(`${process.env.wordPressAPIUrl}/${url}${queryString}`, options);
            console.log(response);

            if (response.status !== 200) {
                return { data: errorReturn, pagination: {} };
            }

            return await response.json();
        } catch (err) {
            try {
                sendSentryEvent('WordPressClient error', { request, error: err });
            } catch (err) {
                // if sending event to sentry fails just fail silently...
            }
            return { data: errorReturn, pagination: {} };
        }
    }

    _isSuccessfulResponse(resp: {} | API.SuccessfulResponse): boolean {
        return !('successful' in resp) ? false : resp.successful;
    }

    _handleOrderResponse(data: API.OrderResponse | {}): API.OrderResponse {
        if (isEmpty(data)) {
            // Handle the scenario where the server failed to return an expected response structure...
            return {
                successful: false,
                customer_message: 'There was an error processing your order',
                internal_message: 'Server error :(',
                requires_ui_action: null,
                order_id: null,
            };
        }
        return data as API.OrderResponse;
    }

    _prepareWheelTirePackagesForRequest(packages: Cart.HydratedWheelTirePackage[]): API.WheelTirePackagesArg {
        return packages.map(({ wheel, tire, addOns, truck: { year, make, model, trim, addSpare } }) => ({
            wheel: wheel.id,
            tire: tire.id,
            add_ons: addOns.map(({ id }) => id),
            truck: { year, make, model, trim, add_spare: addSpare },
        }));
    }

    _prepareLocalLineItemsForRequest(lineItems: Cart.BaseLineItem[]): Cart.BaseLineItem<Truck.API>[] {
        return lineItems.map(({ truck, ...rest }) => ({
            truck: truck === null ? null : transformLocalTruckToAPITruck(truck),
            ...rest,
        }));
    }

    _prepareLocalWheelTirePackagesForRequest(packages: Cart.LocalWheelTirePackage[]): API.WheelTirePackagesArg {
        return packages.map(({ wheel, tire, addOns, truck }) => ({
            wheel,
            tire,
            add_ons: addOns.map((id) => id),
            truck: transformLocalTruckToAPITruck(truck),
        }));
    }

    async _getFilterValues<Resp extends Record<string, Forms.FieldOption[]>>(
        categorySlug: string,
        errorReturn: Resp,
    ): Promise<Resp> {
        const { data } = await this._makeRequest<Resp, Resp>({
            url: `products/categories/${categorySlug}/filter_values`,
            errorReturn,
        });

        return forOwn(data, (options) => sortFieldOptions(options));
    }

    async newsletterSubscribe(email: string): Promise<boolean> {
        const { data } = await this._makeRequest<API.NewsletterSubscribeResponse, {}>({
            url: 'newsletter/subscribe',
            errorReturn: {},
            body: { email },
            method: 'POST',
        });
        return this._isSuccessfulResponse(data);
    }

    async contactFormSubmission(formData: Forms.Definitions.Contact): Promise<boolean> {
        const { data } = await this._makeRequest<API.ContactFormSubmissionResponse, {}>({
            url: 'contact',
            errorReturn: {},
            body: formData,
            method: 'POST',
        });
        return this._isSuccessfulResponse(data);
    }

    async brandAmbassadorFormSubmission(formData: Forms.Definitions.BrandAmbassador): Promise<boolean> {
        const { data } = await this._makeRequest<API.BrandAmbassadorFormSubmissionResponse, {}>({
            url: 'brand_ambassador',
            errorReturn: {},
            body: formData,
            method: 'POST',
        });
        return this._isSuccessfulResponse(data);
    }

    async quoteRequestFormSubmission(formData: Forms.Definitions.RequestQuote): Promise<boolean> {
        const { data } = await this._makeRequest<API.QuoteRequestFormSubmissionResponse, {}>({
            url: 'quote_request',
            errorReturn: {},
            body: formData,
            method: 'POST',
        });
        return this._isSuccessfulResponse(data);
    }

    async getProductCategories(): Promise<WordPress.ProductCategory[]> {
        const { data } = await this._makeRequest<WordPress.ProductCategory[], []>({
            url: 'products/categories',
            errorReturn: [],
        });
        return data;
    }

    async getProductBrands(): Promise<WordPress.ProductCategoryBrands[]> {
        const { data } = await this._makeRequest<WordPress.ProductCategoryBrands[], []>({
            url: 'products/brands',
            errorReturn: [],
        });
        return data;
    }

    async getProductCategory(category: string): Promise<WordPress.ProductCategory | {}> {
        const { data } = await this._makeRequest<WordPress.ProductCategory, {}>({
            url: `products/categories/${category}`,
            errorReturn: {},
        });
        return data;
    }

    async getProductCategoryBrands(
        category: string,
    ): Promise<WordPress.ProductCategoryBrands | WordPress.ProductCategoryBrands<{}, []>> {
        const { data } = await this._makeRequest<
            WordPress.ProductCategoryBrands,
            WordPress.ProductCategoryBrands<{}, []>
        >({
            url: `products/categories/${category}/brands`,
            errorReturn: { category: {}, brands: [] },
        });
        return data;
    }

    async getProduct(slugOrId: string, addSpare: string, selectedWheelId?: string): Promise<WordPress.Product | {}> {
        const { data } = await this._makeRequest<WordPress.Product, {}>({
            url: `products/${slugOrId}`,
            queryParams: { add_spare: addSpare, ...(selectedWheelId ? { selected_wheel: selectedWheelId } : {}) },
            errorReturn: {},
        });
        return data;
    }

    async getWheelTirePackageAddOns(addSpare: string): Promise<WordPress.Product[] | []> {
        const { data } = await this._makeRequest<WordPress.Product[], []>({
            url: 'products/wheel_tire_package_add_ons',
            queryParams: { add_spare: addSpare },
            errorReturn: [],
        });
        return data;
    }

    async getFaqs(): Promise<WordPress.FAQ[] | []> {
        const { data } = await this._makeRequest<WordPress.FAQ[], []>({
            url: 'faqs',
            errorReturn: [],
        });
        return data;
    }

    async getHomePageData(): Promise<API.HomePageResponse> {
        const {
            data: { wheel_diameters, wheel_widths, wheel_bolt_patterns, ...rest },
        } = await this._makeRequest<API.HomePageResponse, API.HomePageResponse>({
            url: 'pages/home',
            errorReturn: {
                categories: [],
                featured_products: [],
                truck_years: [],
                wheel_diameters: [],
                wheel_widths: [],
                wheel_bolt_patterns: [],
                wheel_brands: [],
            },
        });
        return {
            ...rest,
            wheel_diameters: sortDropdownOptions(wheel_diameters),
            wheel_widths: sortDropdownOptions(wheel_widths),
            wheel_bolt_patterns: sortDropdownOptions(wheel_bolt_patterns),
        };
    }

    async getCheckoutPageData(countryCode: string): Promise<API.CheckoutPageResponse> {
        const { data } = await this._makeRequest<API.CheckoutPageResponse, API.CheckoutPageResponse>({
            url: 'pages/checkout',
            queryParams: {
                country_code: countryCode,
            },
            errorReturn: {
                selling_countries: {},
                selling_states: {},
                shipping_countries: {},
                shipping_states: {},
                brand_ambassadors: [],
            },
        });
        return data;
    }

    async getProducts<RT>(queryParams: StringMap, errorReturn: RT): Promise<API.Response<RT>> {
        return await this._makeRequest<RT, RT>({
            url: 'products',
            queryParams,
            errorReturn,
        });
    }

    async getTruckYears(): Promise<string[]> {
        const { data } = await this._makeRequest<string[], []>({
            url: 'trucks/years',
            errorReturn: [],
        });
        return data;
    }

    async getTruckMakes(year: string): Promise<string[]> {
        const { data } = await this._makeRequest<string[], []>({
            url: 'trucks/makes',
            errorReturn: [],
            queryParams: { year },
        });
        return data;
    }
        async postTruck(paramdata : any):Promise<boolean> {
        const { data } = await this._makeRequest<API.TruckResponse, {}>({
            url: 'addtruck',
            errorReturn: [],
            body: { year : paramdata.year, make:paramdata.make,model:paramdata.model ,trim :paramdata.trim,hub:paramdata.hub,bolt_pattern:paramdata.bolt_pattern },
            method:"POST",
        });
        return this._isSuccessfulResponse(data);

        
    }

    async getTruckModels(year: string, make: string): Promise<string[]> {
        const { data } = await this._makeRequest<string[], []>({
            url: 'trucks/models',
            errorReturn: [],
            queryParams: { year, make },
        });
        return data;
    }

    async getTruckTrims(year: string, make: string, model: string): Promise<string[]> {
        const { data } = await this._makeRequest<string[], []>({
            url: 'trucks/trims',
            errorReturn: [],
            queryParams: { year, make, model },
        });
        return data;
    }

    async getTruckModelBoltPatterns(year: string, make: string, model: string, trim: string): Promise<string[]> {
        const { data } = await this._makeRequest<string[], []>({
            url: 'trucks/model_bolt_pattern',
            errorReturn: [],
            queryParams: { year, make, model, trim },
        });
        return data;
    }

    async validateTruckWheel(
        wheel_id: number,
        year: string,
        make: string,
        model: string,
        trim: string,
    ): Promise<boolean> {
        console.log(wheel_id, year, make, model, trim);
        const { data } = await this._makeRequest<true, boolean>({
            url: 'trucks/validate_wheel',
            errorReturn: false,
            body: {
                wheel_id,
                year,
                make,
                model,
                trim,
            },
            method: 'POST',
        });
        return data;
    }

    async getWheelFilterValues(): Promise<API.WheelFilterValuesResponse> {
        return this._getFilterValues<API.WheelFilterValuesResponse>('wheels', {
            diameters: [],
            widths: [],
            offsets: [],
            bolt_patterns: [],
            colors: [],
            brands: [],
            forged: [],
        });
    }

    async getTireFilterValues(): Promise<API.TireFilterValuesResponse> {
        return this._getFilterValues<API.TireFilterValuesResponse>('tires', {
            diameters: [],
            brands: [],
            heights: [],
            widths: [],
            max_pressures: [],
            max_loads: [],
            load_ranges: [],
        });
    }

    async getOtherCategoryFilterValues(catSlug: string): Promise<API.BaseFilterValuesResponse> {
        return this._getFilterValues<API.BaseFilterValuesResponse>(catSlug, {
            brands: [],
        });
    }

    async hydrateCart(
        lineItems: Cart.BaseLineItem[],
        wheelTirePackages: Cart.LocalWheelTirePackage[],
    ): Promise<API.HydrateCartResponse> {
        const { data } = await this._makeRequest<API.HydrateCartResponse, API.HydrateCartResponse>({
            url: 'hydrate_cart',
            errorReturn: { line_items: [], wheel_tire_packages: [] },
            body: {
                line_items: this._prepareLocalLineItemsForRequest(lineItems),
                wheel_tire_packages: this._prepareLocalWheelTirePackagesForRequest(wheelTirePackages),
            },
            method: 'POST',
        });
        return data;
    }

    async getShippingMethods(
        wheelTirePackages: Cart.HydratedWheelTirePackage[],
        shippingCountry: string,
        shippingState: string,
    ): Promise<WordPress.ShippingMethod[]> {
        const { data } = await this._makeRequest<WordPress.ShippingMethod[], []>({
            url: 'checkout/shipping_methods',
            errorReturn: [],
            body: {
                wheel_tire_packages: this._prepareWheelTirePackagesForRequest(wheelTirePackages),
                shipping_country: shippingCountry,
                shipping_state: shippingState,
            },
            method: 'POST',
        });
        return data;
    }

    async calculateTaxes(
        lineItems: Cart.HydratedLineItem[],
        wheelTirePackages: Cart.HydratedWheelTirePackage[],
        billingCountry: string,
        billingState: string,
    ): Promise<WordPress.Tax[]> {
        const { data } = await this._makeRequest<WordPress.Tax[], []>({
            url: 'checkout/taxes',
            errorReturn: [],
            body: {
                line_items: this._prepareLocalLineItemsForRequest(lineItems),
                wheel_tire_packages: this._prepareWheelTirePackagesForRequest(wheelTirePackages),
                billing_country: billingCountry,
                billing_state: billingState,
            },
            method: 'POST',
        });
        return data;
    }

    async getDiscounts(
        wheelTirePackages: Cart.HydratedWheelTirePackage[],
        shipingMethodId: string,
    ): Promise<WordPress.Discount[]> {
        const { data } = await this._makeRequest<WordPress.Discount[], []>({
            url: 'checkout/discounts',
            errorReturn: [],
            body: {
                wheel_tire_packages: this._prepareWheelTirePackagesForRequest(wheelTirePackages),
                shipping_method_id: shipingMethodId,
            },
            method: 'POST',
        });
        return data;
    }

    async getStatesForCountry(countryCode: string): Promise<StringMap> {
        const { data } = await this._makeRequest<StringMap, {}>({
            url: 'checkout/states',
            queryParams: {
                country_code: countryCode,
            },
            errorReturn: {},
        });
        return data;
    }

    async finishOrderValidation(paymentIntentId: string, orderId: number): Promise<API.OrderResponse> {
        const { data } = await this._makeRequest<API.OrderResponse, {}>({
            url: 'checkout/finish_order_validation',
            errorReturn: {},
            body: {
                payment_intent_id: paymentIntentId,
                order_id: orderId,
            },
            method: 'POST',
        });
        return this._handleOrderResponse(data);
    }

    async createOrder(
        paymentMethodId: string,
        lineItems: Cart.HydratedLineItem[],
        wheelTirePackages: Cart.HydratedWheelTirePackage[],
        {
            first_name,
            last_name,
            email,
            phone_number,
            billing_address_first_name,
            billing_address_last_name,
            billing_address_line1,
            billing_address_line2,
            billing_address_city,
            billing_address_state,
            billing_address_postal_code,
            billing_address_country,
            shipping_address_first_name,
            shipping_address_last_name,
            shipping_address_line1,
            shipping_address_line2,
            shipping_address_city,
            shipping_address_state,
            shipping_address_postal_code,
            shipping_address_country,
            ...rest
        }: Forms.Definitions.Checkout,
    ): Promise<API.OrderResponse> {
        const { data } = await this._makeRequest<API.OrderResponse, {}>({
            url: 'checkout/order',
            errorReturn: {},
            body: {
                currency: config.defaultCurrencyCode,
                stripe_payment_method_id: paymentMethodId,
                line_items: this._prepareLocalLineItemsForRequest(lineItems),
                wheel_tire_packages: this._prepareWheelTirePackagesForRequest(wheelTirePackages),
                customer_information: {
                    first_name,
                    last_name,
                    email,
                    phone_number,
                },
                billing_address: {
                    first_name: billing_address_first_name,
                    last_name: billing_address_last_name,
                    line1: billing_address_line1,
                    line2: billing_address_line2,
                    city: billing_address_city,
                    state: billing_address_state,
                    postal_code: billing_address_postal_code,
                    country: billing_address_country,
                },
                shipping_address: {
                    first_name: shipping_address_first_name,
                    last_name: shipping_address_last_name,
                    line1: shipping_address_line1,
                    line2: shipping_address_line2,
                    city: shipping_address_city,
                    state: shipping_address_state,
                    postal_code: shipping_address_postal_code,
                    country: shipping_address_country,
                },
                ...rest,
            },
            method: 'POST',
        });
        return this._handleOrderResponse(data);
    }
}

export default new WordPressRestAPIClient();
