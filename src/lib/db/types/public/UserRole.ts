// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { type ApplicationId } from './Application';
import { type UserId } from './User';
import { type RoleId } from './Role';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';

/** Represents the table public.user_role */
export default interface UserRoleTable {
  owner_application_id: ColumnType<ApplicationId, ApplicationId, ApplicationId>;

  user_id: ColumnType<UserId, UserId, UserId>;

  role_id: ColumnType<RoleId, RoleId, RoleId>;

  created_at: ColumnType<Date, Date | string | undefined, Date | string>;
}

export type UserRole = Selectable<UserRoleTable>;

export type NewUserRole = Insertable<UserRoleTable>;

export type UserRoleUpdate = Updateable<UserRoleTable>;