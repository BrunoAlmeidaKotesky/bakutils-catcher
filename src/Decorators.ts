import { isPromise, isFunction } from "./Utils";

export type Handler<R = any, E = any, Args extends any[] = any[], C = any> = (err: E, context: C, ...args: Args) => R;
function Factory<R = any, E = any, Args extends any[] = any[], C = any>(ErrorClassConstructor: Function | Handler<R, E, Args, C>, handler?: Handler<R, E, Args, C>) {
    return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
        const { value } = descriptor;
        if (!handler) {
            handler = ErrorClassConstructor as Handler;
            ErrorClassConstructor = (undefined as unknown) as any;
        }

        descriptor.value = function (...args: any[]) {
            try {
                const response = value.apply(this, args);
                if (!isPromise(response)) return response;
                return response.catch((error) => {
                    if (
                        isFunction(handler) &&
                        (ErrorClassConstructor === undefined ||
                            error instanceof ErrorClassConstructor)
                    ) {
                        return handler.call(null, error, this, ...args);
                    }
                    throw error;
                });
            } catch (error) {
                if (
                    isFunction(handler) &&
                    (ErrorClassConstructor === undefined ||
                        error instanceof ErrorClassConstructor)
                ) {
                    return handler.call(null, error, this, ...args);
                }
                throw error;
            }
        };

        return descriptor;
    };
};

/**
 * Catch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches errors of a specific type that are thrown within the decorated method.
 * @param ErrorClassConstructor - The constructor of the specific error type to catch.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
export function Catch<R = any, E = any, Args extends any[] = any[], C = any>(ErrorClassConstructor: Function, handler: Handler<R, E, Args, C>) {
    return Factory(ErrorClassConstructor, handler);
}

/**
 * DefaultCatch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches all errors that are thrown within the decorated method.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
export function DefaultCatch<R = any, E = any, Args extends any[] = any[], C = any>(handler: Handler<R, E, Args, C>) {
    return Factory(handler);
}
