import { Module } from '@nestjs/common';
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
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
