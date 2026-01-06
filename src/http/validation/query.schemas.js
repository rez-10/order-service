import { z } from "zod";

/**
 * ============================
 * ORDER ID PARAM
 * ============================
 */
export const orderIdParamSchema = z.object({
  orderId: z.string().min(1)
});

/**
 * ============================
 * SESSION ID PARAM
 * ============================
 */
export const sessionIdParamSchema = z.object({
  sessionId: z.string().min(1)
});
