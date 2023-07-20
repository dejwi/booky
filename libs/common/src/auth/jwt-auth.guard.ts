import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_SERVICE } from '../constants';
import { ClientKafka } from '@nestjs/microservices';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { UserWithRoles } from '../decorators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientKafka,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const jwt =
      ctx.switchToHttp().getRequest().cookies?.Authorization ||
      ctx.switchToHttp().getRequest().headers?.authorization;

    if (!jwt) return false;

    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());

    return this.authClient
      .send<UserWithRoles>('authenticate', { Authorization: jwt })
      .pipe(
        tap((user) => {
          if (roles) {
            const valid = roles.every((role) =>
              user.roles.some(
                ({ name }) => name.toLowerCase() === role.toLowerCase(),
              ),
            );
            if (!valid) throw new UnauthorizedException('Missing permissions');
          }
          ctx.switchToHttp().getRequest().user = user;
        }),
        map(() => true),
        catchError((err) => {
          this.logger.error(err);
          return of(false);
        }),
      );
  }
}
