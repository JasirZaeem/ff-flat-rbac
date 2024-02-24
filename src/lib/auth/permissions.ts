const APPLICATION_PERMISSION_VALUES = [
	// Permission
	"permission:create",
	"permission:read",
	// Role
	"role:create",
	"role:read",
	// Role permission
	"role:permission:add",
	"role:permission:remove",
	// User
	"user:create",
	"user:read",
	// User role
	"user:role:add",
	"user:role:remove",
] as const;

/** Utility function to create a K:V from a list of strings */
function strEnum<T extends string>(o: ReadonlyArray<T>): { [K in T]: K } {
	return o.reduce((res, key) => {
		res[key] = key;
		return res;
	}, Object.create(null));
}

export const APPLICATION_PERMISSION = strEnum(APPLICATION_PERMISSION_VALUES);
export type ApplicationPermission = keyof typeof APPLICATION_PERMISSION;

// Supported roles for an api key
export const READ_ALL_API_ROLE_PERMISSIONS = [
	APPLICATION_PERMISSION["permission:read"],
	APPLICATION_PERMISSION["role:read"],
	APPLICATION_PERMISSION["user:read"],
];

export const READ_USER_API_ROLE_PERMISSIONS = [
	APPLICATION_PERMISSION["user:read"],
];

export const ADMIN_API_ROLE_PERMISSIONS = [
	APPLICATION_PERMISSION["permission:create"],
	APPLICATION_PERMISSION["role:create"],
	APPLICATION_PERMISSION["role:permission:add"],
	APPLICATION_PERMISSION["role:permission:remove"],
	APPLICATION_PERMISSION["user:create"],
	APPLICATION_PERMISSION["user:role:add"],
	APPLICATION_PERMISSION["user:role:remove"],
];

const APPLICATION_API_KEY_ROLE_VALUES = [
	"READ_ALL",
	"READ_USER",
	"ADMIN",
] as const;

export const APPLICATION_API_KEY_ROLE = strEnum(
	APPLICATION_API_KEY_ROLE_VALUES,
);
export type ApplicationApiKeyRole = keyof typeof APPLICATION_API_KEY_ROLE;

export const APPLICATION_API_KEY_ROLE_PERMISSIONS = {
	[APPLICATION_API_KEY_ROLE.READ_ALL]: READ_ALL_API_ROLE_PERMISSIONS,
	[APPLICATION_API_KEY_ROLE.READ_USER]: READ_USER_API_ROLE_PERMISSIONS,
	[APPLICATION_API_KEY_ROLE.ADMIN]: ADMIN_API_ROLE_PERMISSIONS,
} as const;

export function hasPermission(
	role: ApplicationApiKeyRole,
	permission: ApplicationPermission,
) {
	return (
		APPLICATION_API_KEY_ROLE_PERMISSIONS[role] as ReadonlyArray<string>
	).includes(permission);
}
