import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggerModule, PrismaModule } from '@app/common';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
