
export function BAKUtilsIsPromise<T = any>(object: any): object is Promise<T> {
    return object && object instanceof Promise;
}

export function BAKUtilsIsFunction(func: any): func is Function {
    return typeof func === "function" || func instanceof Function;
}
export type ValueOrFn<T> = T | (() => T);
/**
* Internal function to get the value of a ValueOrFn type. 
* If the provided value is a function, it will be called and its result will be returned.
* Otherwise, the value itself will be returned.
*/
export const BAKUtilsGetFnValue = <T>(df: ValueOrFn<T>) => typeof df === 'function' ? (df as (() => T))() : df;
