import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { PackagesModule } from './packages/packages.module';
import { GroupsModule } from './groups/groups.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { PaginationModule } from './pagination/pagination.module';
import { CallCommentCategoriesModule } from './call-comment-categories/call-comment-categories.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permission.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { ExtractUserMiddleware } from './middlewares/extract-user.middleware';
import { IndividualSubscribersModule } from './individual-subscribers/individual-subscribers.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    StaffModule,
    PackagesModule,
    GroupsModule,
    FacilitiesModule,
    PaginationModule,
    CallCommentCategoriesModule,
    RolesModule,
    PermissionsModule,
    MailModule,
    AuthModule,
    IndividualSubscribersModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [ExtractUserMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ExtractUserMiddleware).forRoutes('*');
  }
}
