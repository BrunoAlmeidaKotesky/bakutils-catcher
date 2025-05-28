/**
 * Class representing a variant in the `OneOf` union type.
 *
 * @template LabelMap - A mapping of labels to their corresponding types.
 * @template K - The key in LabelMap representing the current variant.
 */
export declare class OneOfVariant<LabelMap extends Record<string, any>, K extends keyof LabelMap> {
    /** The label identifying the type of the variant. */
    readonly type: K;
    /** The value associated with the variant. */
    readonly value: LabelMap[K];
    /**
     * Creates an instance of OneOfVariant.
     *
     * @param type - The label identifying the variant.
     * @param value - The value associated with the variant.
     *
     * @example
     * ```typescript
     * // Assuming a LabelMap of { Success: string; Error: Error }
     * const successVariant = new OneOfVariant('Success', 'Operation completed');
     * const errorVariant = new OneOfVariant('Error', new Error('Something went wrong'));
     * ```
     */
    constructor(type: K, value: LabelMap[K]);
    /**
     * Matches the variant with the corresponding handler function.
     *
     * @template R - The return type of the handler functions.
     * @param handlers - An object with functions to handle each possible variant.
     * @returns The result of the handler function corresponding to the variant's type.
     *
     * @example
     * ```typescript
     * const result = variant.match({
     *     Success: (value) => `Success: ${value}`,
     *     Error: (error) => `Error: ${error.message}`,
     * });
     * ```
     */
    match<R>(handlers: {
        [H in keyof LabelMap]: (value: LabelMap[H]) => R;
    }): R;
    matchPartial<R>(handlers: Partial<{
        [H in keyof LabelMap]: (value: LabelMap[H]) => R;
    }>, defaultHandler: (value: LabelMap[K]) => R): R;
    /**
     * Type guard to check if the variant matches the specified label.
     *
     * @template T - The label to check against.
     * @param label - The label to compare with the variant's type.
     * @returns True if the variant's type matches the label, false otherwise.
     *
     * @example
     * ```typescript
     * if (variant.is('Success')) {
     *     // TypeScript knows that variant.value is of type LabelMap['Success']
     *     console.log('Operation succeeded with message:', variant.value);
     * }
     * ```
     */
    is<T extends keyof LabelMap>(label: T): this is OneOfVariant<LabelMap, T>;
    /**
    * Checks if the current variant is equal to another variant.
    *
    * @param other - The other variant to compare against.
    * @returns True if both variants have the same type and value, false otherwise.
    *
    * @example
    * ```typescript
    * const variant1 = new OneOfVariant('Success', 'Data loaded');
    * const variant2 = new OneOfVariant('Success', 'Data loaded');
    *
    * variant1.equals(variant2); // true
    * ```*/
    equals(other: OneOfVariant<LabelMap, keyof LabelMap>): boolean;
    /**
    * Serializes the variant into a JSON-compatible object.
    *
    * @returns A JSON object representing the variant.
    *
    * @example
    * ```typescript
    * const variant = new OneOfVariant('Success', 'Completed');
    * const json = variant.toJSON(); // { type: 'Success', value: 'Completed' }
    * ```
    */
    toJSON(): {
        type: K;
        value: LabelMap[K];
    };
    /**
    * Creates a new instance of OneOfVariant from a JSON-compatible object.
    *
    * @param json - The JSON object to deserialize.
    * @returns A new instance of OneOfVariant.
    *
    * @example
    * ```typescript
    * const json = { type: 'Success', value: 'Completed' };
    * const variant = OneOfVariant.fromJSON(json);
    * ```
    */
    static fromJSON<LabelMap extends Record<string, any>, K extends keyof LabelMap>(json: {
        type: K;
        value: LabelMap[K];
    }): OneOfVariant<LabelMap, K>;
    /**
    * Transforms the value of the current variant using the provided mapper function.
    *
    * @template T - The type of the transformed value.
    * @param mapper - A function that transforms the current value.
    * @returns A new OneOfVariant instance with the transformed value.
    *
    * @example
    * ```typescript
    * const variant = new OneOfVariant('Count', 10);
    * const newVariant = variant.map(count => count * 2);
    * console.log(newVariant.value); // 20
    * ```
    */
    map<T>(mapper: (value: LabelMap[K]) => T): OneOfVariant<{
        [P in K]: T;
    }, K>;
}
/**
 * Represents a union of all possible variants defined in LabelMap.
 *
 * @template LabelMap - A mapping of labels to their corresponding types.
 */
export type OneOf<LabelMap extends Record<string, any>> = {
    [K in keyof LabelMap]: OneOfVariant<LabelMap, K>;
}[keyof LabelMap];
/**
 * Factory function to create an instance of `OneOf`.
 *
 * @template LabelMap - A mapping of labels to their corresponding types.
 * @template KKey - The key in LabelMap representing the current variant.
 * @param label - The label identifying the variant.
 * @param value - The value associated with the variant.
 * @returns An instance of `OneOf` corresponding to the specified variant.
 *
 * @example
 * ```typescript
 *  type LabeledData = { Success: string; Error: Error };
 *  // When consuming, you won't always know the type of the variant
 *  const case1 = createOneOf<LabeledData, 'Success'>('Success', 'Data loaded successfully');
 *  const case2 = createOneOf<LabeledData, 'Error'>('Error', new Error('Failed to load data'));
 *  // You can match the variant with the corresponding handler function
 *  console.log(case1.match({
 *      Success: (value) => `Success: ${value}`,
 *      Error: (error) => `Error: ${error.message}`,
 *  }));
 *  // If it is an Error variant, you can access the error message safely
 *  if (case2.is('Error')) {
 *      console.log('Error:', case2.value.message);
 *  }
 * ```
 */
export declare function createOneOf<LabelMap extends Record<string, any>, Key extends keyof LabelMap>(label: Key, value: LabelMap[Key]): OneOf<LabelMap>;
