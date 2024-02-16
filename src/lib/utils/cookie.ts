export enum CookieOptionSameSite {
	Strict = "Strict",
	Lax = "Lax",
	None = "None",
}

export type CookieOptions = {
	maxAge?: number;
	expires?: Date;
	httpOnly?: boolean;
	path?: string;
	domain?: string;
	secure?: boolean;
	sameSite?: CookieOptionSameSite;
};

export function serializeCookie(
	name: string,
	value: string,
	options: CookieOptions,
) {
	const parts = [`${name}=${value}`];

	if (options.maxAge) {
		parts.push(`Max-Age=${options.maxAge}`);
	}

	if (options.expires) {
		parts.push(`Expires=${options.expires.toUTCString()}`);
	}

	if (options.httpOnly) {
		parts.push("HttpOnly");
	}

	if (options.path) {
		parts.push(`Path=${options.path}`);
	}

	if (options.domain) {
		parts.push(`Domain=${options.domain}`);
	}

	if (options.secure) {
		parts.push("Secure");
	}

	if (options.sameSite) {
		parts.push(`SameSite=${options.sameSite}`);
	}

	return parts.join("; ");
}

export function getCookieValue(cookie: string, name: string) {
	const match = cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? match[2] : null;
}
