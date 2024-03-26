export type Handler<R = any, E = any, Args extends any[] = any[], C = any> = (err: E, context: C, ...args: Args) => R;
/**
 * Catch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches errors of a specific type that are thrown within the decorated method.
 * @param ErrorClassConstructor - The constructor of the specific error type to catch.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
export declare function Catch<R = any, E = any, Args extends any[] = any[], C = any>(ErrorClassConstructor: Function, handler: Handler<R, E, Args, C>): (_target: any, _key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * DefaultCatch decorator: A TypeScript decorator that wraps a class method with error handling logic.
 * It catches all errors that are thrown within the decorated method.
 * @param handler - The function to handle the caught error.
 * @returns A decorator function.
 */
export declare function DefaultCatch<R = any, E = any, Args extends any[] = any[], C = any>(handler: Handler<R, E, Args, C>): (_target: any, _key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
