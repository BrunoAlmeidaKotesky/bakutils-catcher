import { createOneOf, OneOf } from '../src/OneOf';

describe('OneOf Type Tests', () => {
    type VariantMap = {
        NumberType: number;
        StringType: string;
        BooleanType: boolean;
        DateType: Date;
    };

    let numberVariant: OneOf<VariantMap>;
    let stringVariant: OneOf<VariantMap>;
    let booleanVariant: OneOf<VariantMap>;
    let dateVariant: OneOf<VariantMap>;

    beforeEach(() => {
        numberVariant = createOneOf<VariantMap, 'NumberType'>('NumberType', 42);
        stringVariant = createOneOf<VariantMap, 'StringType'>('StringType', 'Hello, World!');
        booleanVariant = createOneOf<VariantMap, 'BooleanType'>('BooleanType', true);
        dateVariant = createOneOf<VariantMap, 'DateType'>('DateType', new Date('2024-01-01'));
    });

    it('should create variants with correct types and values', () => {
        expect(numberVariant.type).toBe('NumberType');
        expect(numberVariant.value).toBe(42);

        expect(stringVariant.type).toBe('StringType');
        expect(stringVariant.value).toBe('Hello, World!');

        expect(booleanVariant.type).toBe('BooleanType');
        expect(booleanVariant.value).toBe(true);

        expect(dateVariant.type).toBe('DateType');
        expect(dateVariant.value).toEqual(new Date('2024-01-01'));
    });

    it('should correctly match variants using match method', () => {
        const numberResult = numberVariant.match({
            NumberType: (value) => `Number is ${value}`,
            StringType: () => 'Unexpected StringType',
            BooleanType: () => 'Unexpected BooleanType',
            DateType: () => 'Unexpected DateType',
        });
        expect(numberResult).toBe('Number is 42');

        const stringResult = stringVariant.match({
            NumberType: () => 'Unexpected NumberType',
            StringType: (value) => `String is ${value}`,
            BooleanType: () => 'Unexpected BooleanType',
            DateType: () => 'Unexpected DateType',
        });
        expect(stringResult).toBe('String is Hello, World!');

        const booleanResult = booleanVariant.match({
            NumberType: () => 'Unexpected NumberType',
            StringType: () => 'Unexpected StringType',
            BooleanType: (value) => `Boolean is ${value}`,
            DateType: () => 'Unexpected DateType',
        });
        expect(booleanResult).toBe('Boolean is true');

        const dateResult = dateVariant.match({
            NumberType: () => 'Unexpected NumberType',
            StringType: () => 'Unexpected StringType',
            BooleanType: () => 'Unexpected BooleanType',
            DateType: (value) => `Date is ${value.toISOString()}`,
        });
        expect(dateResult).toBe('Date is 2024-01-01T00:00:00.000Z');
    });

    it('should correctly identify variants using is method', () => {
        if (numberVariant.is('NumberType')) {
            // TypeScript knows numberVariant.value is number
            expect(typeof numberVariant.value).toBe('number');
            expect(numberVariant.value).toBe(42);
        } else {
            throw new Error('Expected variant to be NumberType');
        }

        if (stringVariant.is('StringType')) {
            // TypeScript knows stringVariant.value is string
            expect(typeof stringVariant.value).toBe('string');
            expect(stringVariant.value).toBe('Hello, World!');
        } else {
            throw new Error('Expected variant to be StringType');
        }

        if (booleanVariant.is('BooleanType')) {
            // TypeScript knows booleanVariant.value is boolean
            expect(typeof booleanVariant.value).toBe('boolean');
            expect(booleanVariant.value).toBe(true);
        } else {
            throw new Error('Expected variant to be BooleanType');
        }

        if (dateVariant.is('DateType')) {
            // TypeScript knows dateVariant.value is Date
            expect(dateVariant.value instanceof Date).toBe(true);
            expect(dateVariant.value).toEqual(new Date('2024-01-01'));
        } else {
            throw new Error('Expected variant to be DateType');
        }
    });

    it('should not match incorrect variants in is method', () => {
        expect(numberVariant.is('StringType')).toBe(false);
        expect(stringVariant.is('BooleanType')).toBe(false);
        expect(booleanVariant.is('DateType')).toBe(false);
        expect(dateVariant.is('NumberType')).toBe(false);
    });

    it('should handle all variants in a unified function', () => {
        function handleVariant(variant: OneOf<VariantMap>): string {
            return variant.match({
                NumberType: (value) => `Number: ${value}`,
                StringType: (value) => `String: ${value}`,
                BooleanType: (value) => `Boolean: ${value}`,
                DateType: (value) => `Date: ${value.toISOString()}`,
            });
        }

        expect(handleVariant(numberVariant)).toBe('Number: 42');
        expect(handleVariant(stringVariant)).toBe('String: Hello, World!');
        expect(handleVariant(booleanVariant)).toBe('Boolean: true');
        expect(handleVariant(dateVariant)).toBe('Date: 2024-01-01T00:00:00.000Z');
    });

    it('should ensure exhaustive handling in match method', () => {
        // Uncommenting any handler should cause a TypeScript error
        const result = numberVariant.match({
            NumberType: (value) => `Number: ${value}`,
            StringType: (value) => `String: ${value}`,
            BooleanType: (value) => `Boolean: ${value}`,
            DateType: (value) => `Date: ${value.toISOString()}`,
        });
        expect(result).toBe('Number: 42');
    });

    it('should allow adding new variants dynamically', () => {
        type ExtendedVariantMap = VariantMap & {
            NullType: null;
        };

        const nullVariant = createOneOf<ExtendedVariantMap, 'NullType'>('NullType', null);

        const result = nullVariant.match({
            NumberType: () => 'Number',
            StringType: () => 'String',
            BooleanType: () => 'Boolean',
            DateType: () => 'Date',
            NullType: () => 'Null',
        });
        expect(result).toBe('Null');
    });

    it('should enforce type safety when creating variants', () => {
        // @ts-expect-error - Should not allow incorrect value type
        const invalidVariant = createOneOf<VariantMap, 'NumberType'>('NumberType', 'Not a number');

        // @ts-expect-error - Should not allow invalid label
        const invalidLabelVariant = createOneOf<VariantMap, 'InvalidType'>('InvalidType', 'Some value');
    });

    it('should correctly handle complex types', () => {
        type ComplexVariantMap = {
            DataType: { id: number; name: string };
            ErrorType: Error;
        };

        const dataVariant = createOneOf<ComplexVariantMap, 'DataType'>('DataType', { id: 1, name: 'Item 1' });
        const errorVariant = createOneOf<ComplexVariantMap, 'ErrorType'>('ErrorType', new Error('Something went wrong'));

        if (dataVariant.is('DataType')) {
            expect(dataVariant.value).toEqual({ id: 1, name: 'Item 1' });
        }

        if (errorVariant.is('ErrorType')) {
            expect(errorVariant.value.message).toBe('Something went wrong');
        }
    });

    it('should work with async operations', async () => {
        type AsyncVariantMap = {
            Loading: null;
            Success: string;
            Failure: Error;
        };

        let unknowOneOf: OneOf<AsyncVariantMap> = createOneOf<AsyncVariantMap, 'Loading'>('Loading', null);

        // Simulate an async operation
        const asyncOperation = (): Promise<OneOf<AsyncVariantMap>> => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(createOneOf<AsyncVariantMap, 'Success'>('Success', 'Data loaded'));
                }, 100);
            });
        };

        expect(unknowOneOf.is('Loading')).toBe(true);
        unknowOneOf = await asyncOperation();
        const message = unknowOneOf.match({
            Loading: () => 'Loading...',
            Success: (value) => `Success: ${value}`,
            Failure: (error) => `Failure: ${error.message}`,
        });
        expect(unknowOneOf.is('Success')).toBe(true);
        expect(message).toBe('Success: Data loaded');
    });
});
