import { OPTION_TEST_CASE, OrderError, UserError, getUserById, getUserNameLength, processOrder, processOrderAsync } from "./config/data_sample";

describe("Chaining operations on Result", () => {

    it('Should process an order with valid data', () => {
        const result = processOrder("valid", "valid", "Hello");
        if (result.isErr()) console.log(result.error);
        else console.log(result.value);
        result.match({
            Ok: (value) => expect(value).toBe("Order processed: Order details, User details, Notification sent"),
            Err: (error) => expect(error).toBeInstanceOf(Error)
        })
    });

    it('Should process an order with invalid data', () => {
        const result = processOrder("valid", "invalid", "Hello");
        result.match({
            Ok: (value) => {
                console.log(value);
                expect(value).toBe("Order processed: Order details, User details, Notification sentaaa")
            },
            Err: (error) => expect(error).toBeInstanceOf(UserError)
        })
    });

    it('Should process an order with valid data asynchronously', async () => {
        const result = await processOrderAsync("valid", "valid", "Hello");
        result.match({
            Ok: (value) => expect(value).toBe("Order processed: Order details, User details, Notification sent"),
            Err: (error) => expect(error).toBeInstanceOf(Error)
        })
    });

    it('Should process an order with invalid data asynchronously', async () => {
        const result = await processOrderAsync("invalid", "valid", "Hello");
        result.match({
            Ok: (value) => expect(value).toBe("Order processed: Order details, User details, Notification sent"),
            Err: (error) => expect(error).toBeInstanceOf(OrderError)
        })
    });
});

describe("Chaining operations on Option", () => {

    it('Should process an order with valid data asynchronously', async () => {
        const result = await processOrderAsync("valid", "valid", "Hello");
        const resultToOption = result.toOption();
        const noneHandler = jest.fn();
        resultToOption.match({
            Some: (value) => expect(value).toBe("Order processed: Order details, User details, Notification sent"),
            None: noneHandler
        });
        expect(noneHandler).not.toHaveBeenCalled();
    });

    it.each(OPTION_TEST_CASE)("Should return the length of the user's name if the user exists", ({ value, resultType }) => {
        const optionRes = getUserById(value).flatMap(getUserNameLength);
        const matched = optionRes.match<string | number>({
            Some: length => length,
            None: () => "No user found or user has no name"
        });

        expect([optionRes.type, typeof matched]).toEqual(resultType);
    });
});