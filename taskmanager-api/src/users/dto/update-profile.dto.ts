import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(100)
  fullName?: string;

  @IsOptional() @IsString() @MaxLength(100)
  title?: string;

  @IsOptional() @IsString() @MaxLength(50)
  username?: string;
}