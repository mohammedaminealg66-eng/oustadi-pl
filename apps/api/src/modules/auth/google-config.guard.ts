import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class GoogleConfigGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!process.env.GOOGLE_CLIENT_ID) {
      const response = context.switchToHttp().getResponse();
      response.status(501).json({ message: 'Google authentication is not configured on this server' });
      return false;
    }
    return true;
  }
}
