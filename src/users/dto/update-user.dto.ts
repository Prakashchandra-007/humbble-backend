import { IsOptional, IsString, IsEmail } from 'class-validator';
import { IsValidPhoneWithCountry } from 'src/common/decorators/is-valid-phone.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @IsOptional()
  @IsValidPhoneWithCountry(['IN', 'US', 'GB'], {
    message: 'Phone number must be valid and from supported countries',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  gender?: string;
}
