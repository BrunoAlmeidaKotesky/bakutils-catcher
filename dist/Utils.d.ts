export declare function isPromise<T = any>(object: any): object is Promise<T>;
export declare function isFunction(func: any): func is Function;
export type ValueOrFn<T> = T | (() => T);
/**
* Internal function to get the value of a ValueOrFn type.
* If the provided value is a function, it will be called and its result will be returned.
* Otherwise, the value itself will be returned.
*/
export declare const getFnValue: <T>(df: ValueOrFn<T>) => T;
