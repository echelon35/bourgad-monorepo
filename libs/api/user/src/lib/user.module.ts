import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role/role.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '@bourgad-monorepo/api/mail';
import { UserController } from './user.controller';
import { TerritoryModule } from '@bourgad-monorepo/api/territory';

@Module({
  controllers: [UserController],
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity]), MailModule, JwtModule.register({
        global: true,
        secret: process.env['BOURGAD_SECRET'],
        signOptions: { expiresIn: '36000s' },
      }),TerritoryModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
