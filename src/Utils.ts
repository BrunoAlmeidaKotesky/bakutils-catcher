/* ---------- Type-guards -------------------------------------------------- */
export function BAKUtilsIsPromise<T = any>(o: any): o is Promise<T> {
    return !!o && o instanceof Promise;
}

export function BAKUtilsIsThenable<T = any>(o: any): o is PromiseLike<T> {
    return !!o && typeof o === 'object' && typeof o.then === 'function';
}

export function BAKUtilsIsXrmPromiseLike<T = any>(
    o: any
): o is PromiseLike<T> & { catch: Function } {
    return BAKUtilsIsThenable(o) && typeof (o as any).catch === 'function';
}

export function BAKUtilsIsFunction(fn: any): fn is Function {
    return typeof fn === 'function' || fn instanceof Function;
}

/* ---------- Xrm error object -------------------------------------------- */
export interface ErrorCallbackObject {
    errorCode: number;
    message: string;
    [k: string]: any;
}
export function BAKUtilsIsXrmError(obj: any): obj is ErrorCallbackObject {
    return obj && typeof obj.errorCode === 'number' && typeof obj.message === 'string';
}

export type ValueOrFn<T> = T | (() => T);
/**
* Internal function to get the value of a ValueOrFn type. 
* If the provided value is a function, it will be called and its result will be returned.
* Otherwise, the value itself will be returned.
*/
export const BAKUtilsGetFnValue = <T>(df: ValueOrFn<T>) => typeof df === 'function' ? (df as (() => T))() : df;