import { catcher, defaultCatcher, Result, Ok, Err, Left } from "../src";

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

type ErrorResult = { err: ExtendedError | Error, value: PossibleErrors };

function mayThrowDefaultError(throwError: boolean): string {
    if (throwError) throw new Error('default error');
    return 'No Error';
}

function mayThrowExtendedError(throwError: boolean): string {
    if (throwError) throw new ExtendedError('extended error');
    return 'No Error';
}

function asyncMayThrowError(value: PossibleErrors): Promise<Result<PossibleErrors, ErrorResult>> {
    return new Promise((resolve, reject) => {
        if (value === PossibleErrors.EXTENDED) {
            reject(new ExtendedError('An error occurred'));
        } else if (value === PossibleErrors.DEFAULT) {
            reject(new Error('An error occurred'));
        } else {
            resolve(Ok(PossibleErrors.NO_ERROR));
        }
    });
}

describe('Error Handling with catcher and defaultCatcher', () => {
    describe('catcher function', () => {
        it('should handle extended errors correctly', () => {
            const safeFunction = catcher(
                mayThrowExtendedError,
                ExtendedError,
                (err) => `Caught extended error: ${err.message}`
            );

            expect(safeFunction(false)).toBe('No Error');
            expect(safeFunction(true)).toBe('Caught extended error: extended error');
        });

        it('should handle default errors correctly', () => {
            const safeFunction = catcher(
                mayThrowDefaultError,
                Error,
                (err) => `Caught default error: ${err.message}`
            );

            expect(safeFunction(false)).toBe('No Error');
            expect(safeFunction(true)).toBe('Caught default error: default error');
        });
    });

    describe('defaultCatcher function', () => {
        it('should catch any error and return fallback value', () => {
            const safeFunction = defaultCatcher(
                mayThrowDefaultError,
                (err) => `Caught an error: ${err.message}`
            );

            expect(safeFunction(false)).toBe('No Error');
            expect(safeFunction(true)).toBe('Caught an error: default error');
        });

        it('should catch any error in async function', async () => {
            const safeAsyncFunction = defaultCatcher(
                asyncMayThrowError,
                async (err) => Err({ err, value: PossibleErrors.DEFAULT })
            );

            const result = await safeAsyncFunction(PossibleErrors.NO_ERROR);
            expect(result.unwrap()).toBe(PossibleErrors.NO_ERROR);

            const errorResult = await safeAsyncFunction(PossibleErrors.DEFAULT);
            expect(errorResult.isErr()).toBe(true);
            expect((errorResult as Left<PossibleErrors, ErrorResult>).error).toEqual(
                expect.objectContaining({
                    err: expect.any(Error),
                    value: PossibleErrors.DEFAULT
                })
            );
        });

        it('should handle extended error case in async function', async () => {
            const safeAsyncFunction = catcher(
                asyncMayThrowError,
                ExtendedError,
                async (err) => Promise.resolve(Err({ err, value: PossibleErrors.EXTENDED }))
            );

            const result = await safeAsyncFunction(PossibleErrors.NO_ERROR);
            expect(result.unwrap()).toBe(PossibleErrors.NO_ERROR);

            const errorResult = await safeAsyncFunction(PossibleErrors.EXTENDED);
            expect(errorResult.isErr()).toBe(true);
            expect((errorResult as Left<PossibleErrors, ErrorResult>).error).toEqual(
                expect.objectContaining({
                    err: expect.any(ExtendedError),
                    value: PossibleErrors.EXTENDED
                })
            );
        });
    });
});
