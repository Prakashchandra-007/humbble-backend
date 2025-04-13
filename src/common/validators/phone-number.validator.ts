import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

export function IsValidPhoneWithCountry(
  allowedCountries: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidPhoneWithCountry',
      target: object.constructor,
      propertyName,
      constraints: [allowedCountries],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          try {
            const phoneNumber = parsePhoneNumberWithError(value);
            const country = phoneNumber.country;
            return !!country && allowedCountries.includes(country);
          } catch (error) {
            return false;
          }
        },
        defaultMessage(): string {
          return 'Invalid phone number or unsupported country';
        },
      },
    });
  };
}
