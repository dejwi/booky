import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().user as UserWithRoles,
);

export type UserWithRoles = Prisma.UserGetPayload<{ include: { roles: true } }>;
