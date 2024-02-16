/**
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                           unix_ts_ms                          |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |          unix_ts_ms           |  ver  |       rand_a          |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |var|                        rand_b                             |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                            rand_b                             |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 */

const UNIX_TX_MS_BIT_LENGTH = 48;
const UNIX_TX_MS_HEX_LENGTH = UNIX_TX_MS_BIT_LENGTH / 4;
const VERSION_HEX_DIGIT = "7"; // 0b0111
const SEQUENCE_BIT_LENGTH = 12;
const SEQUENCE_HEX_LENGTH = SEQUENCE_BIT_LENGTH / 4;
const VARIANT = 0b10;
const VARIANT_BIT_LENGTH = 2;
const RANDOM_BIT_LENGTH = 62; // 128 - 48 - 4 - 2 - 12

function uuidv7Factory() {
	let previousTimestamp = -1;
	let sequence = 0;

	return function uuidv7() {
		const timestamp = Math.max(Date.now(), previousTimestamp);
		if (timestamp === previousTimestamp) {
			sequence++;
		} else {
			sequence = 0;
		}
		previousTimestamp = timestamp;

		const variantAndRandom = new Uint32Array(2);
		crypto.getRandomValues(variantAndRandom);
		// Replace the first 2 bits with the variant
		variantAndRandom[0] =
			(VARIANT << (32 - VARIANT_BIT_LENGTH)) |
			(variantAndRandom[0] >>> VARIANT_BIT_LENGTH);

		const VARIANT_AND_RANDOM_HALF_HEX_LENGTH =
			(VARIANT_BIT_LENGTH + RANDOM_BIT_LENGTH) / 2 / 4;
		const digits =
			timestamp.toString(16).padStart(UNIX_TX_MS_HEX_LENGTH, "0") +
			VERSION_HEX_DIGIT +
			sequence.toString(16).padStart(SEQUENCE_HEX_LENGTH, "0") +
			variantAndRandom[0]
				.toString(16)
				.padStart(VARIANT_AND_RANDOM_HALF_HEX_LENGTH, "0") +
			variantAndRandom[1]
				.toString(16)
				.padStart(VARIANT_AND_RANDOM_HALF_HEX_LENGTH, "0");

		return `${digits.slice(0, 8)}-${digits.slice(8, 12)}-${digits.slice(
			12,
			16,
		)}-${digits.slice(16, 20)}-${digits.slice(20, 32)}`;
	};
}

export const uuidv7 = uuidv7Factory();
