import type { BaseOptionFunctor } from "./Functor";
import type { MatchOption } from "./Match";
import { Err, Ok, type Result } from "./Result";
import { type ValueOrFn, BAKUtilsGetFnValue } from "./Utils";

/**
 * Extracts the value type from an Option.
 */
export type RemoveOption<T> = T extends Option<infer U> ? U : T;
/**
 * Represents an Option that may or may not contain a value.
 */
export type Option<T> = SomeType<T> | NoneType<T>;

/**
 * Represents an Option that contains a value.
 */export interface SomeType<T> extends MatchOption<T>, BaseOptionFunctor<T> {
    type: 'some';
    value: T;
    /*** Returns the value of the Option if it exists, otherwise throws an error.*/
    unwrap(): T;
    /*** Returns the value of the Option if it exists, otherwise returns undefined.*/
    unwrapOrU(): T | undefined;
    /*** Returns the value of the Option if it exists, otherwise returns the provided default value.*/
    unwrapOr(defaultValue: ValueOrFn<T>): T;
    /*** Returns true if the Option contains a value, false otherwise.
    *
    * Also supports passing an **optional** value to be compared with the possible stored value.
    *
    * If the value is not provided, it will return true if the Option contains a value. 
    *
    * If the value is different **it will return false** even though if the Option contains a value.
    * @example
    * ```ts
    * const option = Some(5);
    * option.isSome(5); // This avoids the need to unwrap the value and compare it.
    *```
    */
    isSome(this: Option<T>, value?: T): this is SomeType<T>;
    isSome(this: Option<T>): this is SomeType<T>;
    /*** Returns true if the Option does not contain a value, false otherwise.*/
    isNone(this: Option<T>): this is NoneType<T>;
    /** Transforms the Option into a Result, with a provided error value. */
    okOr<E>(this: Option<T>, _err: ValueOrFn<E>): Result<T, E>;
    /**Flat the value to a single level if the value is already an Option. */
    flatten(): Option<RemoveOption<T>>;
    /**
     *@internal
     *This method is used by default on `JSON.stringify` to serialize the object.
     *
     ***It does not need to be called directly.**
     *
     *It will convert the Option<T> to the value T, so it can be serialized if the value is serializable.
     */
    toJSON(): void;
    /**Creates a structured clone of the Option itself and the whole value tree. */
    clone(): this;
    /*** Returns a string representation of the Option. */
    toString(): string;
}
/**
 * Represents an Option that does not contain a value.
 */
export interface NoneType<T = never> extends MatchOption<T>, BaseOptionFunctor<T> {
    type: 'none';
    /*** Throws an error because None does not contain a value.*/
    unwrap(): never;
    /*** Returns the value of the Option if it exists, otherwise returns undefined.*/
    unwrapOrU(): T | undefined;
    /*** Returns the provided default value because None does not contain a value.*/
    unwrapOr<T>(defaultValue: ValueOrFn<T>): T;
    /*** Calls the provided function and returns its result because None does not contain a value.
    *
    * Also supports passing a value to already be compared with the possible stored value.
    *
    */
    isSome(this: Option<T>, value?: T): this is SomeType<T>;
    isSome(this: Option<T>): this is SomeType<T>;
    /*** Returns true if the Option does not contain a value, false otherwise.*/
    isNone(this: Option<T>): this is NoneType<T>;
    /** Transforms the Option into a Result, with a provided error value. */
    okOr<E>(this: Option<unknown>, err: ValueOrFn<E>): Result<never, E>;
    /** This method is used by default on `JSON.stringify` to serialize the object.
     * It does not need to be called directly.
     */
    toJSON(): void;
    /**Flat the value to a single level if the value is already an Option. */
    flatten(): Option<RemoveOption<T>>;
    /**Cloning a None will return the same None instance. */
    clone(): Option<T>;
    /*** Returns a string representation of the Option. */
    toString(): string;
    /**Use to convert a None value to a new Some value with the provided value. 
    *
    * Does not return `SomeType<T>` because it is not guaranteed that the value is not null or undefined.
    */
    toSome<T2>(value: T2): Option<T2>;
}

/**
 * Checks if the provided value is an Option.
 * @param value The value to be checked.
 * @returns True if the value is an Option, false otherwise.
 */
export function isOption<T>(value: unknown): value is Option<T> {
    if (value === null || value === undefined) return false;
    return typeof value === 'object' && !!value && 'type' in value && (value as Option<T>).type === 'some' || (value as Option<T>).type === 'none';
}

/**
 * Creates an Option with a value.
 * @param value The value to be wrapped in the Option.
 * @returns An Option with the 'some' type and the provided value.
 */
export function Some<T>(value: T extends null | undefined ? never : T): SomeType<T> {
    if (value === null || value === undefined)
        throw new Error("Some() cannot be called with null or undefined");
    return {
        type: 'some',
        value,
        unwrap: () => value,
        unwrapOrU: () => value as T | undefined,
        unwrapOr: () => value,
        isSome(this: Option<T>, d?: T): this is SomeType<T> {
            if (d === undefined && value !== undefined)
                return true;
            if (d !== undefined && value !== undefined)
                return d === value;
            return false;
        },
        isNone(this: Option<T>): this is NoneType<T> { return false; },
        map<U>(fn: (value: T) => U): Option<U> {
            return Option(() => fn(value));
        },
        flatMap: (fn) => fn(value),
        flatMapAsync: async (fn) => fn(value),
        okOr: (_err) => Ok(value),
        mapOr: (fn, defaultValue) => {
            const option = Option(fn(value));
            return option.isNone() ? Option(BAKUtilsGetFnValue(defaultValue)) : option;
        },
        flatten: () => {
            if (isOption(value) && value.isSome())
                return value as SomeType<RemoveOption<T>>;
            else
                throw new Error('Cannot flatten a non-option value');
        },
        match: (handlers) => handlers.Some(value),
        toJSON: () => value,
        clone: () => structuredClone(this),
        toString: () => value.toString ? value.toString() : `Some(${value})`
    };
}

/**
 * Represents an empty Option with no value.
 *
 * An `None` is stringified to `null` when using `JSON.stringify`.
 * @returns An Option with the 'none' type.
 */
export const None: NoneType = {
    type: 'none',
    unwrap: () => { throw new Error('Cannot unwrap None'); },
    unwrapOr: <T>(defaultValue: ValueOrFn<T>) => BAKUtilsGetFnValue(defaultValue),
    unwrapOrU: <T>() => undefined as T | undefined,
    isSome(this: Option<never>, _value?: never): this is SomeType<never> { return false; },
    isNone(this: Option<never>): this is NoneType<never> { return true; },
    map: () => None,
    flatMap: (_fn) => None,
    flatMapAsync: async (_fn) => None,
    okOr: (err) => Err(BAKUtilsGetFnValue(err)),
    mapOr: (_fn, defaultValue) => Option(BAKUtilsGetFnValue(defaultValue)),
    toJSON: () => null,
    flatten: () => None,
    match: (handlers) => handlers.None(),
    clone: () => None,
    toString: () => 'none',
    toSome: <T2>(value: T2): Option<T2> => Option(() => value)
};
Object.freeze(None);

/**
 * 
 * @param value A value that may contain a value or be undefined or null.
 * @returns An Option with the 'some' type if the provided value is not undefined or null, otherwise an Option with the 'none' type.
 * 
 * This wrapper is useful when you want to convert a value that you don't know if it is defined or not.
 */
export function Option<T>(value: ValueOrFn<T> | undefined | null): Option<T> {
    try {
        const result = BAKUtilsGetFnValue(value);
        return (result === undefined || result === null) ? None : Some(result);
    } catch (err) {
        console.error(err);
        return None;
    }
}