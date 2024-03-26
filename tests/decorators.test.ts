import { DefaultCatch, Catch, Result, Ok, Err, Left } from "../src";


class ExtendedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

enum PossibleErrors {
    DEFAULT,
    EXTENDED,
    NO_ERROR
}

const BAR_ERROR_MESSAGE = 'bar';
type ErrorResult = { err: ExtendedError | Error, value: PossibleErrors };
class FooBar {
    //@ts-ignore
    @DefaultCatch<void, Error, [boolean]>((_err, _ctx, params) => params)
    //@ts-ignore
    @Catch<void, ExtendedError, [boolean]>(ExtendedError, (_err, _ctx, params) => {
        return params
    })
    static foo(defaultThrow: boolean) {
        if (defaultThrow) throw new Error('defaultThrow');
        throw new ExtendedError("foo");
    }
    //@ts-ignore
    @DefaultCatch<void, ExtendedError>((err) => err.message)
    async bar() {
        throw new ExtendedError(BAR_ERROR_MESSAGE);
    }
    //@ts-ignore
    @DefaultCatch<ErrorResult, Error>((err, _ctx, params) => Err({ err, value: params }))
    //@ts-ignore
    @Catch<ErrorResult, ExtendedError, [boolean]>(ExtendedError, (err, _ctx, param) => Err({ err, value: param }))
    async resultMethod(value: PossibleErrors): Promise<Result<PossibleErrors, ErrorResult>> {
        if (value === PossibleErrors.EXTENDED) {
            throw new ExtendedError('An error occurred');
        }
        if (value === PossibleErrors.DEFAULT)
            throw new Error('An error occurred');
        return Promise.resolve(Ok(PossibleErrors.NO_ERROR));
    }
}


describe('Error Handling with Decorators', () => {
    let fooBarInstance: InstanceType<typeof FooBar>;

    beforeEach(() => {
        fooBarInstance = new FooBar();
    });

    describe('Static foo method', () => {
        it('should handle default and extended errors correctly', () => {
            expect(FooBar.foo(false)).toBe(false);
            expect(FooBar.foo(true)).toBe(true);
        });
    });

    describe('Instance method bar', () => {
        it('should return an extended error message', async () => {
            expect(await fooBarInstance.bar()).toBe(BAR_ERROR_MESSAGE);
        });
    });

    describe('resultMethod with various error states', () => {
        it('should handle no error case correctly', async () => {
            const result = await fooBarInstance.resultMethod(PossibleErrors.NO_ERROR);
            expect(result.unwrap()).toBe(PossibleErrors.NO_ERROR);
        });

        it('should handle extended error case correctly', async () => {
            const result = await fooBarInstance.resultMethod(PossibleErrors.EXTENDED);
            expect(result.isErr()).toBe(true);
            expect((result as Left<PossibleErrors, ErrorResult>).error).toEqual(expect.objectContaining({
                err: expect.any(ExtendedError),
                value: PossibleErrors.EXTENDED
            }));
        });

        it('should handle default error case correctly', async () => {
            const result = await fooBarInstance.resultMethod(PossibleErrors.DEFAULT);
            expect(result.isErr()).toBe(true);
            expect((result as Left<PossibleErrors, ErrorResult>).error).toEqual(expect.objectContaining({
                err: expect.any(Error),
                value: PossibleErrors.DEFAULT
            }));
        });
    });
});