import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AUTH_SERVICE } from '../constants';
import { ClientKafka } from '@nestjs/microservices';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { User } from '@prisma/client';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientKafka) {}

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const jwt =
      ctx.switchToHttp().getRequest().cookies?.Authorization ||
      ctx.switchToHttp().getRequest().headers?.authorization;

    if (!jwt) return false;

    return this.authClient
      .send<User>('authenticate', { Authorization: jwt })
      .pipe(
        tap((res) => {
          ctx.switchToHttp().getRequest().user = res;
        }),
        map(() => true),
        catchError((err) => {
          this.logger.error(err);
          return of(false);
        }),
      );
  }
}
