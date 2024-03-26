import { Result } from "./Result";
import { Option } from "./Option";
export interface MatchResult<T, E> {
    match<R>(this: Result<T, E>, handlers: {
        Ok: (value: T) => R;
        Err: (error: E) => R;
    }): R;
}
export interface MatchOption<T> {
    match<R>(this: Option<T>, handlers: {
        Some: (value: T) => R;
        None: () => R;
    }): R;
}
