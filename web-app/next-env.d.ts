/// <reference types="next" />
/// <reference types="next/types/global" />

/* eslint @typescript-eslint/no-unused-vars: 0 */
declare module 'nextjs-sitemap-generator';
declare module 'react-social-icons';

type StringMap<T = string> = { [k: string]: T };

type WindowSizeHookProps = {
    height: number | undefined;
    width: number | undefined;
};

namespace WordPress {
    type Pagination = {
        total: number;
        total_pages: number;
        page: number;
        per_page: number;
    };
    type PaginationResponse = Pagination | {};

    type BaseObject = {
        id: number;
        name: string;
    };

    type FAQ = {
        question: string;
        answer: string;
    };

    type BrandAmbassador = {
        name: string;
    };

    interface Image extends BaseObject {
        src: string;
        alt: string;
    }

    interface ProductCategory extends BaseObject {
        slug: string;
        // parent: number; // NOTE: if we need this we should probably nest a ProductCategory...
        description: string;
        image: Image | null;
        menu_order: number;
        count: number;
    }

    interface ProductBrand extends BaseObject {
        description: string;
        slug: string;
        image: Image | null;
        lead_time: string;
    }

    type ProductCategoryBrands<C = ProductCategory, B = ProductBrand[]> = {
        category: C;
        brands: B;
    };

    type ProductSortOption = 'price-lth' | 'price-htl' | 'popular' | 'newest';

    type ProductSortArgs = {
        sort?: ProductSortOption;
    };

    type ShippingMethod = {
        id: string;
        title: string;
        description: string;
        price: number;
    };

    type Tax = {
        label: string;
        amount: number;
    };

    type Discount = {
        name: string;
        amount: number; // discounts will come back as positive numbers
        tax: number;
    };

    type WheelMetadata = {
        Diameter?: string;
        'Bolt Pattern'?: string;
        Style?: string;
        Structure?: string;
        Offset?: string;
        'Number of Spokes'?: string;
        Model?: string;
        'Model (Other)'?: string;
        'Exposed Lugs'?: string;
        Color?: string;
        'Center Bore'?: string;
        Backspacing?: string;
        'Year Introduced'?: string;
        Width?: string;
        Material?: string;
        'Load Rating': string;
    };

    type TireMetadata = {
        'Wheel Size'?: string;
        Height?: string;
        Width?: string;
        'Max Pressure'?: string;
        'Max Load'?: string;
        'Load Range'?: string;
    };

    type SuspensionMetadata = {
        'Lift Size'?: string;
        'Vehicle Year'?: string;
        'Vehicle Make'?: string;
        'Vehicle Drive'?: string;
    };

    type ProductMetadata = WheelMetadata | TireMetadata | SuspensionMetadata | {};

    type Prices = {
        price: number;
        sale_price: number;
    };

    type Attribute = {
        title: string;
        options: string[];
    };

    interface ProductBase extends BaseObject, Prices {
        slug: string;
        description: string;
        sku: string;
        total_sales: number;
        quantity_sold_in: number;
        sold_as_truck_set: boolean;
        truck_info_required_for_purchase: boolean;
        is_purchasable: boolean;
        categories: ProductCategory[];
        featured_image: Image | null;
        brand: ProductBrand | null;
        metadata: ProductMetadata;
    }

    interface ProductVariation extends ProductBase {
        attributes: StringMap;
        parentProduct?: Product;
    }

    interface Product extends ProductBase {
        variations: ProductVariation[];
        gallery_images: Image[];
        _attributes?: { [k: string]: Attribute };
        default_attributes?: StringMap;
    }
}

namespace API {
    type Methods = 'GET' | 'POST';
    type PaginationArgs = {
        page?: string;
        per_page?: string;
    };

    type Request<ER> = {
        url: string;
        errorReturn: ER;
        method?: Methods;
        body?: {
            [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        };
        queryParams?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    };

    type Response<D> = {
        data: D;
        pagination: WordPress.PaginationResponse;
    };

    type HydrateCartResponse = {
        line_items: Array<WordPress.Product & { truck: Truck.API | null }>;
        wheel_tire_packages: Cart.WheelTirePackageHydrateResponse[];
    };

    type HomePageResponse = {
        categories: WordPress.ProductCategory[];
        featured_products: WordPress.Product[];
        truck_years: string[];
        wheel_diameters: string[];
        wheel_widths: string[];
        wheel_bolt_patterns: string[];
        wheel_brands: string[];
    };

    type CheckoutPageResponse = {
        selling_countries: StringMap;
        selling_states: StringMap;
        shipping_countries: StringMap;
        shipping_states: StringMap;
        brand_ambassadors: WordPress.BrandAmbassador[];
    };

    type ProductsResponse = {
        products: WordPress.Product[];
    };

    type BaseFilterValuesResponse = {
        brands: Forms.FieldOption[];
    };

    type WheelFilterValuesResponse = BaseFilterValuesResponse & {
        diameters: Forms.FieldOption[];
        widths: Forms.FieldOption[];
        offsets: Forms.FieldOption[];
        bolt_patterns: Forms.FieldOption[];
        colors: Forms.FieldOption[];
        forged: Forms.FieldOption[];
    };

    type TireFilterValuesResponse = BaseFilterValuesResponse & {
        diameters: Forms.FieldOption[];
        heights: Forms.FieldOption[];
        widths: Forms.FieldOption[];
        max_pressures: Forms.FieldOption[];
        max_loads: Forms.FieldOption[];
        load_ranges: Forms.FieldOption[];
    };

    interface ProductsBrandResponse extends ProductsResponse {
        brand: WordPress.ProductBrand | {};
    }

    interface ProductsCategoryResponse extends ProductsResponse {
        category: WordPress.ProductCategory | {};
    }

    interface ProductsBrandCategoryResponse extends ProductsResponse {
        brand: WordPress.ProductBrand | {};
        category: WordPress.ProductCategory | {};
    }

    type WheelTireSearchArgs = 'width' | 'brand';

    type WheelSearchArgs = WheelTireSearchArgs | 'diameter' | 'offset' | 'bolt_pattern' | 'color' | 'forged';

    type TireSearchArgs = WheelTireSearchArgs | 'wheel_size' | 'height' | 'max_pressure' | 'max_load' | 'load_range';

    type ProductSearchQueryArgs = WheelSearchArgs | TireSearchArgs;

    type WheelTirePackagesArg = Array<{
        wheel: number;
        tire: number;
        add_ons: number[];
        truck: Truck.API;
    }>;

    type SuccessfulResponse = {
        successful: boolean;
    };

    type NewsletterSubscribeResponse = SuccessfulResponse;
    type ContactFormSubmissionResponse = SuccessfulResponse;
    type QuoteRequestFormSubmissionResponse = SuccessfulResponse;
    type BrandAmbassadorFormSubmissionResponse = SuccessfulResponse;

    type RequiresUiAction = {
        payment_intent_client_secret: string;
    };

    type OrderResponse = {
        successful: boolean;
        customer_message: string;
        internal_message: string;
        requires_ui_action: RequiresUiAction | null;
        order_id: number | null;
    };
}

type MenuLinkProps = {
    url: Pages.UrlConstruct;
    text: string;
};

namespace Styles {
    type ItemsPosition = 'items-center' | 'items-stretch' | 'items-top';
    type FontSizes =
        | 'text-xs'
        | 'text-sm'
        | 'text-base'
        | 'text-lg'
        | 'text-xl'
        | 'text-2xl'
        | 'text-3xl'
        | 'text-4xl'
        | 'text-5xl'
        | 'text-6xl';
    type FontWeights = 'font-normal' | 'font-medium' | 'font-semibold' | 'font-bold' | 'font-extrabold';

    type FontColors =
        | 'text-white'
        | 'text-black'
        | 'text-gray-50'
        | 'text-gray-75'
        | 'text-gray-80'
        | 'text-gray-90'
        | 'text-gray-100'
        | 'text-gray-200'
        | 'text-gray-300'
        | 'text-gray-400'
        | 'text-gray-500'
        | 'text-gray-600'
        | 'text-gray-700'
        | 'text-gray-800'
        | 'text-gray-900'
        | 'text-gray-901'
        | 'text-gray-902'
        | 'text-red-100'
        | 'text-red-200';
    type BackgroundColors =
        | 'bg-white'
        | 'bg-black'
        | 'bg-gray-50'
        | 'bg-gray-75'
        | 'bg-gray-80'
        | 'bg-gray-90'
        | 'bg-gray-100'
        | 'bg-gray-200'
        | 'bg-gray-300'
        | 'bg-gray-400'
        | 'bg-gray-500'
        | 'bg-gray-600'
        | 'bg-gray-700'
        | 'bg-gray-800'
        | 'bg-gray-900'
        | 'bg-gray-901'
        | 'bg-gray-902'
        | 'bg-red-100'
        | 'bg-red-200';
    type ColorHeyKeys =
        | 'white'
        | 'black'
        | 'gray-50'
        | 'gray-75'
        | 'gray-80'
        | 'gray-90'
        | 'gray-100'
        | 'gray-200'
        | 'gray-300'
        | 'gray-400'
        | 'gray-500'
        | 'gray-600'
        | 'gray-700'
        | 'gray-800'
        | 'gray-900'
        | 'gray-901'
        | 'gray-902'
        | 'red-100'
        | 'red-200';
    type ColorHexCodes =
        | '#F23939'
        | '#CF0E0E'
        | '#FFFFFF'
        | '#F3F3F3'
        | '#DBDBDB'
        | '#DFE5F0'
        | '#C5C5C5'
        | '#8F96A3'
        | '#7A7A7A'
        | '#505A64'
        | '#3A3A3a'
        | '#3C3030'
        | '#131313'
        | '#0E0E0E'
        | '#6A6A6A'
        | '#969696'
        | '#CCD1D9'
        | '#7C8186'
        | '#1C1C1C';
}

namespace Forms {
    type FormikError = string | null;

    type InputEventField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    type ChangeEvent = React.ChangeEvent<InputEventField>;
    type FocusEvent = React.FocusEvent<InputEventField>;
    type InputOnChange = (e: ChangeEvent) => void;
    type InputOnBlur = (e: FocusEvent) => void;

    type ReactInput = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    type ReactSelect = React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;

    type StripeOnChangeEventError = {
        message: string;
        code: string;
        type: 'validation_error';
    };
    type StripeOnChangeEvent = {
        // https://stripe.com/docs/js/element/events/on_change?type=cardExpiryElement
        elementType: string;
        empty: boolean;
        complete: boolean;
        brand?: string;
        error: StripeOnChangeEventError | undefined;
    };

    type BaseFormField<IV> = {
        name: keyof IV;
        type: string;
        className?: string;
        placeholder: string;
    };

    type InputFormField<IV> = BaseFormField<IV>;
    interface RadioInputFormField<IV> extends BaseFormField<IV> {
        type: 'radio';
        placeholder?: string;
        blankOptionsFallbackText: string;
    }

    type StripeFormField<IV> = {
        name: 'cardNumber' | 'cardExpiry' | 'cardCvc';
        type: 'stripe';
        className?: string;
        placeholder: string;
        error: FormikError;
        touched: boolean;
        updateError: (err: FormikError) => void;
        updateValid: (valid: boolean) => void;
        updateTouched: (touched: boolean) => void;
    };

    type SubmitFormField = {
        className?: string;
        text: string;
        loadingMessage?: string;
        noBottomPadding?: boolean;
    };

    type Field<IV> = InputFormField<IV> | RadioInputFormField<IV> | StripeFormField<IV>;

    type FormSection<IV> = {
        id: string;
        yMargin?: string;
        noXPadding?: boolean;
        label?: string;
        fields: Field<IV>[];
    };

    type FormDefinition<IV> = {
        sections: FormSection<IV>[];
        submit: SubmitFormField;
        renderSubmitInsideSections?: boolean;
        noBottomMargin?: boolean;
    };

    type FieldOption<VT = string> = {
        label: string;
        value: VT;
    };

    type FieldOptions<IV> = {
        [key in keyof IV]?: FieldOption[];
    };

    type DisabledFields<IV> = {
        [key in keyof IV]?: boolean;
    };

    type OverriddenFields<IV> = {
        [key in keyof IV]?: () => JSX.Element;
    };

    type HiddenFormSectionCondition<IV> = {
        fieldName: keyof IV;
        fieldValue: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        sectionId: string;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type ChangeHandler<IV> = (value: any, allFormValues: IV) => Promise<void> | void;
    type ChangeHandlers<IV> = {
        [key in keyof IV]?: ChangeHandler<IV>;
    };

    type YupValidationSchema<IV> = Yup.Schema<IV>;
    type YupLazyValidationSchema<IV> = (fn: (value: IV) => Yup.Schema<IV>) => Yup.Lazy;

    namespace Definitions {
        type SearchWheelsByVehicle = Truck.Base;

        type SearchWheelsBySizeBrand = {
            diameter: string;
            width: string;
            bolt_pattern: string;
            brand: string;
        };

        type NewsletterSignup = {
            email: string;
        };

        type BrandAmbassador = {
            first_name: string;
            last_name: string;
            email: string;
            phone_number: string;
            city: string;
            state: string;
            facebook: string;
            instagram: string;
            youtube: string;
            tiktok: string;
            other_social_media: string;
            why_good_fit_message: string;
        };

        type Checkout = {
            first_name: string;
            last_name: string;
            email: string;
            phone_number: string;
            billing_address_first_name: string;
            billing_address_last_name: string;
            billing_address_line1: string;
            billing_address_line2: string;
            billing_address_city: string;
            billing_address_state: string;
            billing_address_postal_code: string;
            billing_address_country: string;
            use_billing_address_as_shipping_address: boolean;
            signup_for_newsletter: boolean;
            shipping_address_first_name: string;
            shipping_address_last_name: string;
            shipping_address_line1: string;
            shipping_address_line2: string;
            shipping_address_city: string;
            shipping_address_state: string;
            shipping_address_postal_code: string;
            shipping_address_country: string;
            shipping_method_id: string;
            brand_ambassador_referral: string;
        };

        type Contact = {
            name: string;
            email: string;
            phone_number: string;
            message: string;
        };

        type BaseTruckForm = Truck.Base & {
            add_spare: boolean;
        };
        type AddTiresToWheel = BaseTruckForm;
        type TruckRequiredForProduct = BaseTruckForm;

        type RequestQuote = {
            first_name: string;
            last_name: string;
            email: string;
            phone_number: string;
            message: string;
        } & Truck.Base;
    }
}

namespace Truck {
    type Base = {
        year: string;
        make: string;
        model: string;
        trim: string;
    };

    interface Local extends Base {
        addSpare: boolean;
    }

    interface API extends Base {
        add_spare: boolean;
    }

    type LocalOrNull = Local | null;
}

namespace GoogleAnalytics {
    type EnhancedEcommerceEvent =
        | 'view_item_list'
        | 'view_item'
        | 'add_to_cart'
        | 'remove_from_cart'
        | 'begin_checkout'
        | 'set_checkout_option'
        | 'purchase';

    type Base = Partial<{
        variant: string;
        quantity: number;
        list_position: number;
        list_name: string;
    }>;

    type Product = Base & {
        id: string;
        name: string;
        brand?: string;
        category: string;
        price: number;
    };

    type Purchase = {
        transaction_id: string;
        affiliation?: string;
        value: number;
        currency: string;
        tax: number;
        shipping: number;
    };

    type PurchaseEvent = Purchase & {
        items: Product[];
    };

    type CheckoutProgressEvent = {
        checkout_step: number;
        checkout_option: string;
        value: string;
    };

    type ModifiedLineItem = Omit<Cart.HydratedLineItem, 'truck' | 'quantity'> & Base;
}

namespace Cart {
    type BaseItem = {
        id: number;
    };

    type BaseLineItem<T = Truck.Local> = {
        id: number;
        quantity: number;
        truck: T | null;
        attributes?: StringMap;
        parent?: WordPress.Product;
    };

    type HydratedLineItem<T = Truck.Local> = BaseLineItem<T> &
        Omit<
            WordPress.Product,
            | 'description'
            | 'total_sales'
            | 'is_purchasable'
            | 'variations'
            | 'gallery_images'
            | 'truck_info_required_for_purchase'
        >;

    type _BWTP<PT, T> = {
        wheel: PT;
        tire: PT;
        truck: T;
    };

    interface BaseWheelTirePackage<PT> extends _BWTP<PT, Truck.Local> {
        addOns: PT[];
    }

    interface WheelTirePackageHydrateResponse extends _BWTP<WordPress.Product, Truck.API> {
        add_ons: WordPress.Product[];
    }

    type LocalWheelTirePackage = BaseWheelTirePackage<number>;
    type WheelTirePackage = BaseWheelTirePackage<WordPress.Product>;
    type HydratedWheelTirePackage = BaseWheelTirePackage<HydratedLineItem>;
    type WheelTirePackagePrices = Omit<BaseWheelTirePackage<WordPress.Prices>, 'truck'>;

    type LocalCart = {
        lineItems: BaseLineItem[];
        wheelTirePackages: LocalWheelTirePackage[];
    };

    type Context = {
        lineItems: HydratedLineItem[];
        wheelTirePackages: HydratedWheelTirePackage[];
        hydratingLineItems: boolean;
        addLineItem: (product: WordPress.ProductBase, truck?: Truck.Local) => Promise<void>;
        addWheelTirePackage: (pack: WheelTirePackage) => Promise<void>;
        removeWheelTirePackageAddOn: (packIdx: number, addOnId: number) => void;
        emptyCart: () => void;
        deleteLineItem: (id: number, truck: Truck.LocalOrNull) => void;
        deleteWheelTirePackage: (idx: number) => void;
        updateLineItemQuantity: (id: number, newQuantity: number, truck: Truck.LocalOrNull) => void;
    };
}

namespace SelectedWheel {
    type Context = {
        wheel: WordPress.Product | null;
        isLoading: boolean;
    };
}

namespace SearchBar {
    type Context = {
        isOpen: boolean;
        toggleOpen: () => void;
    };
}

namespace Pages {
    type Pages =
        | ''
        | 'store'
        | 'search'
        | 'product'
        | 'category'
        | 'brand_ambassadors'
        | 'brand'
        | 'brands'
        | 'cart'
        | 'checkout'
        | 'contact'
        | 'faq'
        | 'request_quote'
        | 'order_confirmation';

    type UrlConstruct = {
        page: Pages;
        includeBase?: boolean;
        extra?: string;
        queryParams?: StringMap;
    };
}

namespace Search {
    type Filter<qk extends string = string> = {
        placeholder: string;
        queryKey: qk;
        options: Forms.FieldOption<string>[];
        category?: boolean;
    };
}
