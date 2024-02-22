/** Creates a successful Result with the given value.
 * @param value The value of the successful computation.
 * @returns A Result with the 'ok' type and the provided value.*/
function Ok(value) {
    return {
        type: 'ok',
        value,
        unwrap: () => value,
        unwrapOr: () => value,
        unwrapOrElse: () => value,
        isErr: () => false,
        isOk: () => true,
        toOption: () => Option(value)
    };
}
/**
 * Creates a failed Result with the given error.
 * @param error The error that caused the computation to fail.
 * @returns A Result with the 'error' type and the provided error.
 */
function Err(error) {
    return {
        type: 'error',
        error,
        unwrap: () => { throw error; },
        unwrapOr: (defaultValue) => defaultValue,
        unwrapOrElse: (fn) => fn(error),
        isErr: () => true,
        isOk: () => false,
        toOption: () => None
    };
}
/** Create an Result with the given error, without using `Ok` or `Err` directly. */
function Result(value, err) {
    return value === undefined || value === null ? Err(err) : Ok(value);
}
const getDefValue = (df) => typeof df === 'function' ? df() : df;
/**
 * Creates an Option with a value.
 * @param value The value to be wrapped in the Option.
 * @returns An Option with the 'some' type and the provided value.
 */
function Some(value) {
    if (value === null || value === undefined)
        throw new Error("Some() cannot be called with null or undefined");
    return {
        type: 'some',
        value,
        unwrap: () => value,
        unwrapOr: () => value,
        unwrapOrElse: () => value,
        isSome: () => true,
        isNone: () => false,
        map: (fn) => Some(fn(value)),
        flatMap: (fn) => fn(value),
        okOr: (_err) => Ok(value),
        okOrElse: (_errFn) => Ok(value),
        mapOr: (fn, defaultValue) => {
            const option = Option(fn(value));
            return option.isNone() ? Option(getDefValue(defaultValue)) : option;
        }
    };
}
/**
 * Represents an empty Option with no value.
 * @returns An Option with the 'none' type.
 */
const None = {
    type: 'none',
    unwrap: () => { throw new Error('Cannot unwrap None'); },
    unwrapOr: (defaultValue) => defaultValue,
    unwrapOrElse: (fn) => fn(),
    isSome: () => false,
    isNone: () => true,
    map: () => None,
    flatMap: (_fn) => None,
    okOr: (err) => Err(err),
    okOrElse: (errFn) => Err(errFn()),
    mapOr: (_fn, defaultValue) => Option(getDefValue(defaultValue))
};
/**
 *
 * @param value A value that may contain a value or be undefined or null.
 * @returns An Option with the 'some' type if the provided value is not undefined or null, otherwise an Option with the 'none' type.
 *
 * This wrapper is useful when you want to convert a value that you don't know if it is defined or not.
 */
function Option(value) {
    return value === undefined || value === null ? None : Some(value);
}
//Decorators
function isPromise(object) {
    return object && object instanceof Promise;
}
function isFunction(func) {
    return typeof func === "function" || func instanceof Function;
}
function Factory(ErrorClassConstructor, handler) {
    return (_target, _key, descriptor) => {
        const { value } = descriptor;
        if (!handler) {
            handler = ErrorClassConstructor;
            ErrorClassConstructor = undefined;
        }
        descriptor.value = function (...args) {
            try {
                const response = value.apply(this, args);
                if (!isPromise(response))
                    return response;
                return response.catch((error) => {
                    if (isFunction(handler) &&
                        (ErrorClassConstructor === undefined ||
                            error instanceof ErrorClassConstructor)) {
                        return handler.call(null, error, this, ...args);
                    }
                    throw error;
                });
            }
            catch (error) {
                if (isFunction(handler) &&
                    (ErrorClassConstructor === undefined ||
                        error instanceof ErrorClassConstructor)) {
                    return handler.call(null, error, this, ...args);
                }
                throw error;
            }
        };
        return descriptor;
    };
}
/**
 * Catch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches errors of a specific type that are thrown within the decorated method.
 * @param ErrorClassConstructor - The constructor of the specific error type to catch.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
function Catch(ErrorClassConstructor, handler) {
    return Factory(ErrorClassConstructor, handler);
}
/**
 * DefaultCatch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches all errors that are thrown within the decorated method.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
function DefaultCatch(handler) {
    return Factory(handler);
}

export { Catch, DefaultCatch, Err, None, Ok, Option, Result, Some, isFunction, isPromise };
