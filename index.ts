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
    /** Transforms the Result into an Option, encapsulating the Result within. */
    transpose(): Option<Result<T, E>>;
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
    transpose(): Option<Result<T, E>>;
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
    /** Transforms an Option of a Result (Option<Result<T, E>>) into a Result of an Option (Result<Option<T>, E>). */
    transpose<E>(): Result<Option<T>, E>;
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
    okOr<E>(this: Option<never>, err: E): Result<never, E>;
    /** Transforms the Option into a Result, with a provided error function.*/
    okOrElse<E>(this: Option<never>, errFn: () => E): Result<never, E>;
    /** Transforms an Option of a Result (Option<Result<never, E>>) into a Result of an Option (Result<Option<never>, E>).*/
    transpose<E>(): Result<Option<never>, E>;
}

/**
 * Represents an optional value: every Option is either Some with a value of type T or None.
 */
export type Option<T> = SomeType<T> | NoneType;

/** Creates a successful Result with the given value.
 * @param value The value of the successful computation.
 * @returns A Result with the 'ok' type and the provided value.*/
export function Ok<T, E>(value: T): Result<T, E> {
    return {
        type: 'ok',
        value,
        unwrap: () => value,
        unwrapOr: () => value,
        unwrapOrElse: () => value,
        isErr: () => false,
        isOk: () => true,
        transpose: (): Option<Result<T, E>> => {
            // Se o valor é uma Option
            if (value && typeof value === 'object' && 'type' in value) {
                if (this.value.type === 'some')
                    return Some(Ok(this.value.value));
                else if (value.type === 'none')
                    return None;
            }
            throw new Error("Value must be an Option");
        }
    };
}

/**
 * Creates a failed Result with the given error.
 * @param error The error that caused the computation to fail.
 * @returns A Result with the 'error' type and the provided error.
 */
export function Err<T, E>(error: E): Result<T, E> {
    return {
        type: 'error',
        error,
        unwrap: () => { throw error; },
        unwrapOr: (defaultValue: T) => defaultValue,
        unwrapOrElse: (fn: (error: E) => T) => fn(error),
        isErr: () => true,
        isOk: () => false,
        transpose: () => None
    };
}

/** Create an Result with the given error, without using `Ok` or `Err` directly. */
export function Result<T, E>(value: T, err: E): Result<T, E> {
    return value === undefined || value === null ? Err(err) : Ok(value);
}

/**
 * Creates an Option with a value.
 * @param value The value to be wrapped in the Option.
 * @returns An Option with the 'some' type and the provided value.
 */
export function Some<T>(value: T extends null | undefined ? never : T): Option<T> {
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
        okOr(_err) {
            return Ok(value);
        },
        okOrElse(_errFn) {
            return Ok(value);
        },
        transpose() {
            if (this.value && this.value.type === 'ok')
                return Ok(Some(this.value.value));
            else if (this.value && this.value.type === 'error')
                return Err(this.value.error);
            else
                throw new Error("Value must be a Result");
        }
    };
}

/**
 * Represents an empty Option with no value.
 * @returns An Option with the 'none' type.
 */
export const None: Option<never> = {
    type: 'none',
    unwrap: () => { throw new Error('Cannot unwrap None'); },
    unwrapOr: <T>(defaultValue: T) => defaultValue,
    unwrapOrElse: <T>(fn: () => T) => fn(),
    isSome: () => false,
    isNone: () => true,
    map: () => None,
    flatMap: (_fn) => None,
    okOr: (err) => Err(err),
    okOrElse: (errFn) => Err(errFn()),
    transpose: () => Ok(None)
};

/**
 * 
 * @param value A value that may contain a value or be undefined or null.
 * @returns An Option with the 'some' type if the provided value is not undefined or null, otherwise an Option with the 'none' type.
 * 
 * This wrapper is useful when you want to convert a value that you don't know if it is defined or not.
 */
export function Option<T>(value: T | undefined | null): Option<T> {
    return value === undefined || value === null ? None : Some(value);
}

//Decorators
export function isPromise<T = any>(object: any): object is Promise<T> {
    return object && object instanceof Promise;
}

export function isFunction(func: any): func is Function {
    return typeof func === "function" || func instanceof Function;
}

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