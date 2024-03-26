import { Result } from "./Result";
import { type Option } from "./Option";
import { ValueOrFn } from "./Utils";

export interface BaseResultFunctor<T, E> {
    flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
    flatMapAsync<U>(fn: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>>;
}

export interface LeftFunctor<T, E> extends BaseResultFunctor<T, E> {
    map<U>(fn: (value: T) => U): Result<T, E>;
}

export interface RightFunctor<T, E> extends BaseResultFunctor<T, E> {
    map<U>(fn: (value: T) => U): Result<U, E>;
}

export interface BaseOptionFunctor<T> {
    flatMap<U>(fn: (value: T) => Option<U>): Option<U>;
    flatMapAsync<U>(fn: (value: T) => Promise<Option<U>>): Promise<Option<U>>;
    mapOr<U>(fn: (value: T) => Exclude<U, null | undefined>, defaultValue: ValueOrFn<U>): Option<U>;
}

export interface SomeFunctor<T> extends BaseOptionFunctor<T> {
    map<U>(fn: (value: T) => Exclude<U, null | undefined>): Option<U>;
}

export interface NoneFunctor<T> extends BaseOptionFunctor<T> {
    map<U>(fn: (value: T) => U): Option<U>;
}