// import { ErrorStore } from "../../shared/errors/errorStore.js";

// /**
//  * Validates route params against a schema.
//  */
// export function validateParams(schema) {
//   return (req, _res, next) => {
//     const result = schema.safeParse(req.params);

//     if (!result.success) {
//       return next(
//         ErrorStore.validation(
//           "Invalid route parameters",
//           {
//             issues: result.error.issues
//           }
//         )
//       );
//     }

//     req.params = result.data;
//     next();
//   };
// }

import { z } from "zod";

/**
 * ============================
 * CREATE ORDER
 * ============================
 * Body:
 * {
 *   sessionId: string
 * }
 */
export const createOrderSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});


/**
 * ============================
 * ADD ORDER ITEMS
 * ============================
 * Body:
 * {
 *   items: [
 *     {
 *       menuItemId: string,
 *       quantity: number,
 *       notes?: string
 *     }
 *   ]
 * }
 */
export const addOrderItemsSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1, "menuItemId is required"),
        quantity: z
          .number({
            invalid_type_error: "quantity must be a number",
          })
          .int("quantity must be an integer")
          .positive("quantity must be positive"),
        notes: z.string().max(500).optional(),
      })
    )
    .min(1, "At least one item is required"),
});


/**
 * ============================
 * CONFIRM ORDER
 * ============================
 * Body:
 * {}
 * (No payload required)
 */
export const confirmOrderSchema = z.object({}).strict();


/**
 * ============================
 * COMPLETE ORDER
 * ============================
 * Body:
 * {}
 * (No payload required)
 */
export const completeOrderSchema = z.object({}).strict();