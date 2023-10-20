'use strict';

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
        isOk: () => true
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
        isOk: () => false
    };
}
/**
 * Creates an Option with a value.
 * @param value The value to be wrapped in the Option.
 * @returns An Option with the 'some' type and the provided value.
 */
function Some(value) {
    return {
        type: 'some',
        value,
        unwrap: () => value,
        unwrapOr: () => value,
        unwrapOrElse: () => value,
        isSome: () => true,
        isNone: () => false
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
    isNone: () => true
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

exports.Catch = Catch;
exports.DefaultCatch = DefaultCatch;
exports.Err = Err;
exports.None = None;
exports.Ok = Ok;
exports.Option = Option;
exports.Some = Some;
exports.isFunction = isFunction;
exports.isPromise = isPromise;
