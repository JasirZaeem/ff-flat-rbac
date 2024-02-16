import { BinaryLike, ScryptOptions, timingSafeEqual } from "crypto";
import { randomBytes, scrypt } from "node:crypto";

function scryptAsync(
	password: BinaryLike,
	salt: BinaryLike,
	keylen: number,
	options: ScryptOptions,
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		scrypt(password, salt, keylen, options, (err, derivedKey) => {
			if (err) {
				reject(err);
			} else {
				resolve(derivedKey);
			}
		});
	});
}

const logN = 14;
const N = 2 ** logN;
const r = 8;
const p = 2;

const keylen = 128;
const params: ScryptOptions = {
	cost: N,
	blockSize: r,
	parallelization: p,
};

const PARAMS_HEX = "0f82"; // In hex, 0f = 15 (16 bit), 8 = 8 (8 bit), 2 = 2 (8 bit)

/**
 * Hashes a password using the scrypt algorithm from node's crypto library.
 * Hash is in the format: $s0$<params>$<salt>$<key>
 * @param password
 */
export async function hashPassword(password: BinaryLike) {
	const salt = randomBytes(16);
	const buf = await scryptAsync(password, salt, keylen, params);

	return `$s0$${PARAMS_HEX}$${salt.toString("base64url")}$${buf.toString(
		"base64url",
	)}`;
}

async function checkPasswordHash(password: string, hashedPassword: string) {
	const split = hashedPassword.split("$");
	const salt = split[3];
	const key = split[4];

	const buf = await scryptAsync(
		password,
		Buffer.from(salt, "base64url"),
		keylen,
		params,
	);

	return timingSafeEqual(buf, Buffer.from(key, "base64url"));
}

// ocnus
const TIME_WASTE_PASSWORD =
	"$s0$0f82$K6z20G9ZKJd1TQ0MsHR42w$XwE-lAYDcPPRwax3PFrJwuxpjf5RpAhtnPUjS0wfuyhiC1QZDby_eIL6FyNiUwdisXyhEepMbySzbetfmTHDeWRATcfwdcAzAh4u2TqJiFdOzrhnJ4Ie3FRORHgkljx0aBmlYRezkIVhkaqZJ2DwfsBft30XfrsZOeBHF32-7TU";

export async function verifyPassword(
	password: string,
	hashedPassword?: string,
) {
	if (!hashedPassword) {
		// Waste some time to mitigate timing attacks
		await checkPasswordHash(password, TIME_WASTE_PASSWORD);
		return false;
	}

	return checkPasswordHash(password, hashedPassword);
}
