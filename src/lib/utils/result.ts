export type Result<ValueType, ErrorType> =
	| {
			ok: true;
			value: ValueType;
	  }
	| {
			ok: false;
			error: ErrorType;
	  };

export type PromisedResult<ValueType, ErrorType> = Promise<
	Result<ValueType, ErrorType>
>;

export function Ok<ValueType>(value: ValueType): Result<ValueType, never> {
	return {
		ok: true,
		value,
	};
}

export function Err<ErrorType>(error: ErrorType): Result<never, ErrorType> {
	return {
		ok: false,
		error,
	};
}

export function match<ValueType, ErrorType, ReturnType>(
	result: Result<ValueType, ErrorType>,
	matcher: {
		ok: (value: ValueType) => ReturnType;
		error: (error: ErrorType) => ReturnType;
	},
): ReturnType {
	if (result.ok) {
		return matcher.ok(result.value);
	}
	return matcher.error(result.error);
}
