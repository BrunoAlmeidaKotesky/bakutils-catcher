export type Handler<R = any, E = any, Args extends any[] = any[], C = any> = (err: E, context: C, ...args: Args) => R;
/**
 * Encapsulates a function with error handling logic.
 * @param fn - The function to be wrapped.
 * @param ErrorClassConstructor - The constructor of the specific error type to catch.
 * @param handler - The function to handle the caught error.
 * @returns A new function with error handling.
 */
export declare function catcher<R = any, E extends Error = Error, Args extends any[] = any[], C = any>(fn: (...args: Args) => R, ErrorClassConstructor: new (...args: any[]) => E, handler: Handler<R, InstanceType<typeof ErrorClassConstructor>, Args, C>): (...args: Args) => R | Promise<R>;
/**
 * Encapsulates a function with a default error handler that catches all errors.
 * @param fn - The function to be wrapped.
 * @param handler - The function to handle the caught error.
 * @returns A new function with error handling.
 */
export declare function defaultCatcher<R = any, Args extends any[] = any[], C = any>(fn: (...args: Args) => R, handler: Handler<R, Error, Args, C>): (...args: Args) => R | Promise<R>;
/**
 * Catch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches errors of a specific type that are thrown within the decorated method.
 * @param ErrorClassConstructor - The constructor of the specific error type to catch.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
export declare function Catcher<R = any, E extends Error = Error, Args extends any[] = any[], C = any>(ErrorClassConstructor: new (...args: any[]) => E, handler: Handler<R, InstanceType<typeof ErrorClassConstructor>, Args, C>): (_target: any, _key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * DefaultCatch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches all errors that are thrown within the decorated method.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
export declare function DefaultCatcher<R = any, Args extends any[] = any[], C = any>(handler: Handler<R, Error, Args, C>): (_target: any, _key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
