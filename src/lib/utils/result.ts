export type ResultOk<ValueType> = {
	ok: true;
	value: ValueType;
};

export type ResultError<ErrorType> = {
	ok: false;
	error: ErrorType;
};

export type Result<ValueType, ErrorType = unknown> =
	| ResultOk<ValueType>
	| ResultError<ErrorType>;

export type PromisedResult<ValueType, ErrorType = unknown> = Promise<
	Result<ValueType, ErrorType>
>;

export function Ok<ValueType>(value: ValueType): Result<ValueType, never> {
	return {
		ok: true,
		value,
	};
}

export const OkVoid = () => Ok(undefined);

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

	return matcher.error((result as ResultError<ErrorType>).error);
}

export function mapResult<ValueType, ErrorType, NewValueType>(
	result: Result<ValueType, ErrorType>,
	mapper: (value: ValueType) => NewValueType,
): Result<NewValueType, ErrorType> {
	if (result.ok) {
		return Ok(mapper(result.value));
	}

	return result;
}
