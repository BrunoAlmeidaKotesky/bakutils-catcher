import { BAKUtilsIsPromise, BAKUtilsIsFunction, BAKUtilsIsPromiseLike } from "./Utils";

export type Handler<R = any, E = any, Args extends any[] = any[], C = any> = (err: E, context: C, ...args: Args) => R;
/**
 * Factory function to create the core catch handler for both decorators and function wrappers.
 */
function BAKUtilsCatchFactory<R = any, E extends Error = Error, Args extends any[] = any[], C = any>(
    ErrorClassConstructor: new (...args: any[]) => E,
    handler: Handler<R, InstanceType<typeof ErrorClassConstructor>, Args, C>
) {
    return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            let result;
            try {
                result = originalMethod.apply(this, args);
            } catch (syncError) {
                if (
                    BAKUtilsIsFunction(handler) &&
                    (ErrorClassConstructor === undefined || syncError instanceof ErrorClassConstructor)
                ) {
                    return handler.call(null, syncError, this, ...args);
                }
                throw syncError;
            }
            // If it's a native Promise
            if (BAKUtilsIsPromise(result)) {
                return (result as Promise<any>).catch((error: E) => {
                    if (
                        BAKUtilsIsFunction(handler) &&
                        (ErrorClassConstructor === undefined || error instanceof ErrorClassConstructor)
                    ) {
                        return handler.call(null, error, this, ...args);
                    }
                    throw error;
                });
            }
            // If it's a PromiseLike (thenable)
            if (BAKUtilsIsPromiseLike(result)) {
                return Promise.resolve(result as PromiseLike<any>).catch((error: E) => {
                    if (
                        BAKUtilsIsFunction(handler) &&
                        (ErrorClassConstructor === undefined || error instanceof ErrorClassConstructor)
                    ) {
                        return handler.call(null, error, this, ...args);
                    }
                    throw error;
                });
            }
            // Not a promise
            return result;
        };

        return descriptor;
    };
}

/**
 * Encapsulates a function with error handling logic.
 * @param fn - The function to be wrapped.
 * @param ErrorClassConstructor - The constructor of the specific error type to catch.
 * @param handler - The function to handle the caught error.
 * @returns A new function with error handling.
 */
export function catcher<R = any, E extends Error = Error, Args extends any[] = any[], C = any>(
    fn: (...args: Args) => R,
    ErrorClassConstructor: new (...args: any[]) => E,
    handler: Handler<R, InstanceType<typeof ErrorClassConstructor>, Args, C>
): (...args: Args) => R | Promise<R> {
    return function (...args: Args): R | Promise<R> {
        let result;
        try {
            result = fn(...args);
        } catch (syncError) {
            if (
                BAKUtilsIsFunction(handler) &&
                (ErrorClassConstructor === undefined || syncError instanceof ErrorClassConstructor)
            ) {
                return handler.call(null, syncError, this as C, ...args);
            }
            throw syncError;
        }
        if (BAKUtilsIsPromise(result)) {
            return (result as Promise<any>).catch((error: E) => {
                if (
                    BAKUtilsIsFunction(handler) &&
                    (ErrorClassConstructor === undefined || error instanceof ErrorClassConstructor)
                ) {
                    return handler.call(null, error, this as C, ...args);
                }
                throw error;
            });
        }
        if (BAKUtilsIsPromiseLike(result)) {
            return Promise.resolve(result as PromiseLike<any>).catch((error: E) => {
                if (
                    BAKUtilsIsFunction(handler) &&
                    (ErrorClassConstructor === undefined || error instanceof ErrorClassConstructor)
                ) {
                    return handler.call(null, error, this as C, ...args);
                }
                throw error;
            });
        }
        return result;
    };
}

/**
 * Encapsulates a function with a default error handler that catches all errors.
 * @param fn - The function to be wrapped.
 * @param handler - The function to handle the caught error.
 * @returns A new function with error handling.
 */
export function defaultCatcher<R = any, Args extends any[] = any[], C = any>(
    fn: (...args: Args) => R,
    handler: Handler<R, Error, Args, C>
): (...args: Args) => R | Promise<R> {
    return catcher(fn, Error, handler);
}

/**
 * Catch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches errors of a specific type that are thrown within the decorated method.
 * @param ErrorClassConstructor - The constructor of the specific error type to catch.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
export function Catcher<R = any, E extends Error = Error, Args extends any[] = any[], C = any>(
    ErrorClassConstructor: new (...args: any[]) => E,
    handler: Handler<R, InstanceType<typeof ErrorClassConstructor>, Args, C>
) {
    return BAKUtilsCatchFactory(ErrorClassConstructor, handler);
}

/**
 * DefaultCatch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches all errors that are thrown within the decorated method.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
export function DefaultCatcher<R = any, Args extends any[] = any[], C = any>(
    handler: Handler<R, Error, Args, C>
) {
    return BAKUtilsCatchFactory(Error, handler);
}