"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCatch = exports.Catch = exports.isFunction = exports.isPromise = exports.isNone = exports.isSome = exports.None = exports.Some = exports.Err = exports.Ok = void 0;
/** Creates a successful Result with the given value.
 * @param value The value of the successful computation.
 * @returns A Result with the 'ok' type and the provided value.*/
function Ok(value) {
    return {
        type: 'ok',
        value: value,
        unwrap: function () { return value; },
        unwrapOr: function () { return value; },
        unwrapOrElse: function () { return value; },
        isErr: function () { return false; },
        isOk: function () { return true; }
    };
}
exports.Ok = Ok;
/**
 * Creates a failed Result with the given error.
 * @param error The error that caused the computation to fail.
 * @returns A Result with the 'error' type and the provided error.
 */
function Err(error) {
    return {
        type: 'error',
        error: error,
        unwrap: function () { throw error; },
        unwrapOr: function (defaultValue) { return defaultValue; },
        unwrapOrElse: function (fn) { return fn(error); },
        isErr: function () { return true; },
        isOk: function () { return false; }
    };
}
exports.Err = Err;
/**
 * Creates an Option with a value.
 * @param value The value to be wrapped in the Option.
 * @returns An Option with the 'some' type and the provided value.
 */
function Some(value) {
    return {
        type: 'some',
        value: value,
        unwrap: function () { return value; },
        unwrapOr: function () { return value; },
        unwrapOrElse: function () { return value; },
        isSome: function () { return true; },
        isNone: function () { return false; }
    };
}
exports.Some = Some;
/**
 * Represents an empty Option with no value.
 * @returns An Option with the 'none' type.
 */
exports.None = {
    type: 'none',
    unwrap: function () { throw new Error('Cannot unwrap None'); },
    unwrapOr: function (defaultValue) { return defaultValue; },
    unwrapOrElse: function (fn) { return fn(); },
    isSome: function () { return false; },
    isNone: function () { return true; }
};
/**
 * Checks if an Option contains a value.
 * @param option The Option to check.
 * @returns True if the Option contains a value, false otherwise.
 * Note: Prefer using the isSome method directly on the Option object.
 */
function isSome(option) {
    return option.type === 'some';
}
exports.isSome = isSome;
/**
 * Checks if an Option does not contain a value.
 * @param option The Option to check.
 * @returns True if the Option does not contain a value, false otherwise.
 * Note: Prefer using the isNone method directly on the Option object.
 */
function isNone(option) {
    return option.type === 'none';
}
exports.isNone = isNone;
//Decorators
function isPromise(object) {
    return object && Promise.resolve(object) === object;
}
exports.isPromise = isPromise;
function isFunction(func) {
    return typeof func === "function" || func instanceof Function;
}
exports.isFunction = isFunction;
function Factory(ErrorClassConstructor, handler) {
    return function (_target, _key, descriptor) {
        var value = descriptor.value;
        if (!handler) {
            handler = ErrorClassConstructor;
            ErrorClassConstructor = undefined;
        }
        descriptor.value = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            try {
                var response = value.apply(this, args);
                if (!isPromise(response))
                    return response;
                return response.catch(function (error) {
                    if (isFunction(handler) &&
                        (ErrorClassConstructor === undefined ||
                            error instanceof ErrorClassConstructor)) {
                        return handler.call.apply(handler, __spreadArray([null, error, _this], args, false));
                    }
                    throw error;
                });
            }
            catch (error) {
                if (isFunction(handler) &&
                    (ErrorClassConstructor === undefined ||
                        error instanceof ErrorClassConstructor)) {
                    return handler.call.apply(handler, __spreadArray([null, error, this], args, false));
                }
                throw error;
            }
        };
        return descriptor;
    };
}
;
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
exports.Catch = Catch;
/**
 * DefaultCatch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches all errors that are thrown within the decorated method.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
function DefaultCatch(handler) {
    return Factory(handler);
}
exports.DefaultCatch = DefaultCatch;
