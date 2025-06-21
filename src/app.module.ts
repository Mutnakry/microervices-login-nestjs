// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { validationSchema } from './config/validation';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { BannerModule } from './banner/banner.module';
import { AnnouncementModule  } from './announcement/announcement.module';
import { SeoModule } from './seo/seo.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
    }),
    UsersModule,
    AuthModule,
    BannerModule ,
    TenantModule,
    AnnouncementModule ,
    SeoModule,
  ],
})
export class AppModule {}
