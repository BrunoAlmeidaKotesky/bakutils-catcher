/** Represents a failed computation.*/
export interface Left<T, E> {
    type: 'error';
    error: E;
    /*** Returns the value of the Result if it is successful, otherwise throws an error.*/
    unwrap(): T;
    /*** Returns the value of the Result if it is successful, otherwise returns the provided default value.*/
    unwrapOr(defaultValue: T): T;
    /*** Returns the value of the Result if it is successful, otherwise calls the provided function with the error and returns its result.*/
    unwrapOrElse(fn: (error: E) => T): T;
    /*** Returns true if the Result is an error, false otherwise.*/
    isErr(this: Result<T, E>): this is Left<T, E>;
    /*** Returns true if the Result is successful, false otherwise.*/
    isOk(this: Result<T, E>): this is Right<T, E>;
    toOption(): Option<T>;
}
/** Represents a successful computation.*/
export interface Right<T, E> {
    type: 'ok';
    value: T;
    /*** Returns the value of the Result.*/
    unwrap(): T;
    /*** Returns the value of the Result.*/
    unwrapOr(defaultValue: T): T;
    /*** Returns the value of the Result.*/
    unwrapOrElse(fn: (error: E) => T): T;
    /*** Returns true if the Result is an error, false otherwise.*/
    isErr(this: Result<T, E>): this is Left<T, E>;
    /*** Returns true if the Result is successful, false otherwise.*/
    isOk(this: Result<T, E>): this is Right<T, E>;
    toOption(): Option<T>;
}
/**Represents the result of a computation that can either succeed with a value of type T or fail with an error of type E.*/
export type Result<T, E> = Left<T, E> | Right<T, E>;
/**
 * Represents an Option that contains a value.
 */
export interface SomeType<T> {
    type: 'some';
    value: T;
    /*** Returns the value of the Option if it exists, otherwise throws an error.*/
    unwrap(): T;
    /*** Returns the value of the Option if it exists, otherwise returns the provided default value.*/
    unwrapOr(defaultValue: T): T;
    /*** Returns the value of the Option if it exists, otherwise calls the provided function and returns its result.*/
    unwrapOrElse(fn: () => T): T;
    /*** Returns true if the Option contains a value, false otherwise.*/
    isSome(this: Option<T>): this is SomeType<T>;
    /*** Returns true if the Option does not contain a value, false otherwise.*/
    isNone(this: Option<T>): this is NoneType;
    /** Applies a function to the contained value (if any), and returns an Option containing the result.*/
    map<U>(fn: (value: T) => Exclude<U, null | undefined>): Option<U>;
    /** Applies a function to the contained value (if any), which itself returns an Option, and then flattens the result. */
    flatMap<U>(fn: (value: T) => Option<U>): Option<U>;
    /** Transforms the Option into a Result, with a provided error value. */
    okOr<E>(this: Option<T>, _err: E): Result<T, E>;
    /** Transforms the Option into a Result, with a provided error function.*/
    okOrElse<E>(this: Option<T>, _errFn: () => E): Result<T, E>;
}
/**
 * Represents an Option that does not contain a value.
 */
export interface NoneType {
    type: 'none';
    /*** Throws an error because None does not contain a value.*/
    unwrap(): never;
    /*** Returns the provided default value because None does not contain a value.*/
    unwrapOr<T>(defaultValue: T): T;
    /*** Calls the provided function and returns its result because None does not contain a value.*/
    unwrapOrElse<T>(fn: () => T): T;
    /*** Returns true if the Option contains a value, false otherwise.*/
    isSome<T>(this: Option<T>): this is SomeType<T>;
    /*** Returns true if the Option does not contain a value, false otherwise.*/
    isNone<T>(this: Option<T>): this is NoneType;
    /** Applies a function to the contained value (if any), and returns an Option containing the result.*/
    map<U>(fn: (value: never) => U): Option<U>;
    /** Applies a function to the contained value (if any), which itself returns an Option, and then flattens the result. */
    flatMap<U>(fn: (value: never) => Option<U>): Option<U>;
    /** Transforms the Option into a Result, with a provided error value. */
    okOr<E>(this: Option<unknown>, err: E): Result<never, E>;
    /** Transforms the Option into a Result, with a provided error function.*/
    okOrElse<E>(this: Option<unknown>, errFn: () => E): Result<never, E>;
}
/**
 * Represents an optional value: every Option is either Some with a value of type T or None.
 */
export type Option<T> = SomeType<T> | NoneType;
/** Creates a successful Result with the given value.
 * @param value The value of the successful computation.
 * @returns A Result with the 'ok' type and the provided value.*/
export declare function Ok<T, E>(value: T): Result<T, E>;
/**
 * Creates a failed Result with the given error.
 * @param error The error that caused the computation to fail.
 * @returns A Result with the 'error' type and the provided error.
 */
export declare function Err<T, E>(error: E): Result<T, E>;
/** Create an Result with the given error, without using `Ok` or `Err` directly. */
export declare function Result<T, E>(value: T, err: E): Result<T, E>;
/**
 * Creates an Option with a value.
 * @param value The value to be wrapped in the Option.
 * @returns An Option with the 'some' type and the provided value.
 */
export declare function Some<T>(value: T extends null | undefined ? never : T): Option<T>;
/**
 * Represents an empty Option with no value.
 * @returns An Option with the 'none' type.
 */
export declare const None: Option<never>;
/**
 *
 * @param value A value that may contain a value or be undefined or null.
 * @returns An Option with the 'some' type if the provided value is not undefined or null, otherwise an Option with the 'none' type.
 *
 * This wrapper is useful when you want to convert a value that you don't know if it is defined or not.
 */
export declare function Option<T>(value: T | undefined | null): Option<T>;
export declare function isPromise<T = any>(object: any): object is Promise<T>;
export declare function isFunction(func: any): func is Function;
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
