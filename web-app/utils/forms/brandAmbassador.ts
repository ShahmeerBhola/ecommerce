import { object as YupObject, string as YupString } from 'yup';
import { yupEmail, yupPhoneNumber } from '..';

export const initialValues: Forms.Definitions.BrandAmbassador = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  city: '',
  state: '',
  facebook: '',
  instagram: '',
  youtube: '',
  tiktok: '',
  other_social_media: '',
  why_good_fit_message: '',
};

export type InitialValues = typeof initialValues;

export const validationSchema = YupObject<InitialValues>({
  first_name: YupString().required('First name is required'),
  last_name: YupString().required('Last name is required'),
  email: yupEmail(),
  phone_number: yupPhoneNumber(),
  city: YupString().required('City is required'),
  state: YupString().required('State is required'),
  facebook: YupString(),
  instagram: YupString(),
  youtube: YupString(),
  tiktok: YupString(),
  other_social_media: YupString(),
  why_good_fit_message: YupString().required("Please let us know why you'd be a good fit"),
});

export const definition: Forms.FormDefinition<InitialValues> = {
  sections: [
    {
      id: 'contact_information',
      label: 'Contact Information',
      fields: [
        {
          name: 'first_name',
          type: 'text',
          placeholder: 'First Name',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'last_name',
          type: 'text',
          placeholder: 'Last Name',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'phone_number',
          type: 'tel',
          placeholder: 'Phone Number',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'city',
          type: 'text',
          placeholder: 'City',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'state',
          type: 'text',
          placeholder: 'State',
          className: 'w-full sm:w-1/2',
        },
      ],
    },
    {
      id: 'social_media_presence',
      label: 'Social Media Presence',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          placeholder: 'Facebook',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'instagram',
          type: 'text',
          placeholder: 'Instagram',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'youtube',
          type: 'text',
          placeholder: 'YouTube',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'tiktok',
          type: 'text',
          placeholder: 'TikTok',
          className: 'w-full sm:w-1/2',
        },
        {
          name: 'other_social_media',
          type: 'text',
          placeholder: 'Other social media profile(s)',
          className: 'w-full',
        },
      ],
    },
    {
      id: 'why_good_fit',
      fields: [
        {
          name: 'why_good_fit_message',
          type: 'textarea',
          placeholder: 'Why do you think you would be a good fit as a Standout Specialties brand ambassador?',
          className: 'w-full',
        },
      ],
    },
  ],
  submit: {
    text: 'Submit',
    className: 'w-full',
  },
};
