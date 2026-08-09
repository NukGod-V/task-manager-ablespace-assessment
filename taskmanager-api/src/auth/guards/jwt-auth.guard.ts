import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Thin wrapper so we reference 'JwtAuthGuard' everywhere instead of
// the string 'jwt' — keeps route decorators readable and refactor-safe.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}