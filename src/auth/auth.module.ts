

// // import { Module } from '@nestjs/common';
// // import { JwtModule } from '@nestjs/jwt';
// // import { PassportModule } from '@nestjs/passport';
// // import { AuthService } from './auth.service';
// // import { AuthController } from './auth.controller';
// // import { JwtStrategy } from './jwt.strategy';
// // import { UsersModule } from '../users/users.module';
// // import { ConfigModule, ConfigService } from '@nestjs/config';

// // @Module({
// //   imports: [
// //     UsersModule,
// //     PassportModule,
// //     JwtModule.registerAsync({
// //       imports: [ConfigModule],
// //       useFactory: async (configService: ConfigService) => ({
// //         secret: configService.get<string>('JWT_SECRET'),
// //         signOptions: { expiresIn: '1d' },
// //       }),
// //       inject: [ConfigService],
// //     }),
// //   ],
// //   controllers: [AuthController],
// //   providers: [AuthService, JwtStrategy],
// //   exports: [AuthService],
// // })
// // export class AuthModule {}


// import { Module } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { UsersModule } from '../users/users.module';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// import { JwtStrategy } from './jwt.strategy';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { AuthController } from './auth.controller';

// @Module({
//   imports: [
//     PassportModule,
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>('JWT_SECRET'),
//         signOptions: { expiresIn: '1d' },
//       }),
//       inject: [ConfigService],
//     }),
//     UsersModule,
//   ],
//   providers: [AuthService, JwtStrategy],
//   controllers: [AuthController],
// })
// export class AuthModule {}


import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy'; // ✅ Import this
import { MailModule } from '../mail/mail.module'; // ✅ Import it
// import { GoogleStrategy } from '../google/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { SessionModule } from 'src/session/session.module'; // ✅

@Module({
  imports: [
    UsersModule,
    MailModule,
    SessionModule ,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService,GoogleStrategy, JwtStrategy,FacebookStrategy],
})
export class AuthModule { }
