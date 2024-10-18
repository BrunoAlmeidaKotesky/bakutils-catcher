/**
 * Class representing a variant in the `OneOf` union type.
 *
 * @template LabelMap - A mapping of labels to their corresponding types.
 * @template K - The key in LabelMap representing the current variant.
 */
export class OneOfVariant<LabelMap extends Record<string, any>, K extends keyof LabelMap> {
    /** The label identifying the type of the variant. */
    public readonly type: K;
    /** The value associated with the variant. */
    public readonly value: LabelMap[K];

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
    constructor(type: K, value: LabelMap[K]) {
        this.type = type;
        this.value = value;
    }

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
    match<R>(handlers: { [H in keyof LabelMap]: (value: LabelMap[H]) => R }): R {
        return handlers[this.type](this.value);
    }

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
    is<T extends keyof LabelMap>(label: T): this is OneOfVariant<LabelMap, T> {
        return this.type === (label as unknown as K);
    }
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
export function createOneOf<LabelMap extends Record<string, any>, Key extends keyof LabelMap>(
    label: Key,
    value: LabelMap[Key]
): OneOf<LabelMap> {
    return new OneOfVariant(label, value);
}