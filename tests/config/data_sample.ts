import { Err, Ok, Result, Option } from "../../src";

export class OrderError extends Error { }
export class UserError extends Error { }
export class NotificationError extends Error { }

export function orderService(orderId: string): Result<string, OrderError> {
    if (orderId === "valid")
        return Ok("Order details");
    return Err(new OrderError("Invalid order ID"));
}

export function userService(userId: string): Result<string, UserError> {
    if (userId === "valid")
        return Ok("User details");
    return Err(new UserError("Invalid user ID"));
}

export function notificationService(message: string): Result<string, NotificationError> {
    if (message !== "")
        return Ok("Notification sent");
    return Err(new NotificationError("Message is empty"));
}

export type PossibleErrors = OrderError | UserError | NotificationError;
export type OrderResult = Result<string, PossibleErrors>;
export const processOrder = (orderId: string, userId: string, message: string): OrderResult =>
    orderService(orderId)
        .flatMap(orderDetails =>
            userService(userId)
                .flatMap(userDetails =>
                    notificationService(message)
                        .map(notificationResult => `Order processed: ${orderDetails}, ${userDetails}, ${notificationResult}`)
                )
        );


export const processOrderAsync = async (orderId: string, userId: string, message: string): Promise<Result<string, PossibleErrors>> => {
    return orderService(orderId).flatMapAsync(async orderDetails =>
        userService(userId).flatMapAsync(async userDetails =>
            notificationService(message).map(notificationMessage =>
                `Order processed: ${orderDetails}, ${userDetails}, ${notificationMessage}`
            )
        )
    );
};


export const OPTION_TEST_CASE = [
    { value: 1, resultType: ['some', 'number'] },
    { value: null, resultType: ['none', 'string'] },
] as const;
export const getUserById = (id: number | null) => {
    const users = [{ id: 1, name: "John Doe" }];
    const user = users.find(user => user.id === id);
    return Option(user);
};
export const getUserNameLength = (user: { id: number; name: string }) => Option(user.name.length);