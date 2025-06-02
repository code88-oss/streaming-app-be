// src/auth/dtos/login.dto.ts
import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';

@ValidatorConstraint({ name: 'emailOrUsername', async: false })
class EmailOrUsernameConstraint implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments) {
    const { username, email } = args.object as any;
    return (username && !email) || (!username && email);
  }

  defaultMessage() {
    return 'Must provide either username or email, but not both or neither';
  }
}

export class LoginDto {
  @ValidateIf((o) => !o.email)
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(50, { message: 'Username is too long' })
  username?: string;

  @ValidateIf((o) => !o.username)
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @Validate(EmailOrUsernameConstraint)
  emailOrUsername?: string; // Dummy field để kích hoạt validator
}
