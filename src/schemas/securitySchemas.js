/**
 * Security Validation Schemas (Zod)
 * Enforces strict runtime data contracts across forms, checkout payloads, and admin operations.
 */
import { z } from 'zod';
import { stripHtml } from '../utils/sanitizer.js';

// Sanitized text string that automatically strips any HTML
const cleanString = (min = 1, max = 250) =>
  z
    .string()
    .min(min, { message: `يجب ألا يقل النص عن ${min} حرف` })
    .max(max, { message: `يجب ألا يتجاوز النص ${max} حرف` })
    .transform((val) => stripHtml(val));

// Saudi / International phone regex: 05XXXXXXXX, +9665XXXXXXXX, or international E.164
const phoneRegex = /^(\+9665\d{8}|05\d{8}|9665\d{8}|\+[1-9]\d{7,14})$/;

/**
 * Customer Order Item Schema
 */
export const OrderItemSchema = z.object({
  id: z.string().min(1).max(50),
  titleAr: cleanString(1, 100),
  titleEn: z.string().max(100).optional(),
  price: z.number().positive().max(50000), // Max order price sanity bound
  quantity: z.number().int().min(1).max(50), // Prevent negative or absurd quantities
  productType: z.string().max(50).optional(),
  addons: z
    .array(
      z.object({
        id: z.string(),
        nameAr: z.string().max(100).optional(),
        price: z.number().nonnegative(),
        phrase: z.string().max(100).optional(),
      })
    )
    .optional(),
  giftCardMessage: z.string().max(300).optional().nullable(),
});

/**
 * Full Order / Handover Schema
 */
export const OrderPayloadSchema = z.object({
  orderId: z.string().regex(/^[A-Za-z0-9\-_]{4,20}$/),
  items: z.array(OrderItemSchema).min(1, { message: 'يجب أن تحتوي السلة على منتج واحد على الأقل' }),
  handover: z.object({
    type: z.enum(['gift', 'self']),
    timing: z.string().max(50),
    recipientName: z.string().max(100).optional().nullable(),
    recipientPhone: z
      .string()
      .regex(phoneRegex, { message: 'رقم هاتف المستلم غير صحيح (مثال: 05XXXXXXXX)' })
      .optional()
      .nullable(),
  }),
  trustPhoto: z.boolean().default(true),
});

/**
 * Custom Bespoke Order Schema
 */
export const CustomOrderSchema = z.object({
  budget: z.number().min(50).max(50000),
  occasion: cleanString(1, 100),
  recipientName: z.string().max(100).optional(),
  recipientPhone: z.string().regex(phoneRegex, { message: 'رقم الهاتف غير صحيح' }).optional().or(z.literal('')),
  notes: cleanString(0, 500).optional(),
  customPhoto: z.string().max(2000000).optional().nullable(), // Max 2MB base64
});

/**
 * Admin Authentication Schema
 */
export const AdminLoginSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل' })
    .max(50)
    .regex(/^[a-zA-Z0-9_\-\.@]+$/, { message: 'اسم المستخدم يحتوي على محارف غير مسموحة' }),
  password: z
    .string()
    .min(8, { message: 'كلمة المرور يجب ألا تقل عن 8 خانات' })
    .max(128, { message: 'كلمة المرور طويلة جداً' }),
});

/**
 * Store Configuration Validation Schema
 */
export const ShopConfigSchema = z.object({
  shopNameAr: cleanString(2, 60),
  shopNameEn: z.string().max(60).optional(),
  taglineAr: cleanString(0, 150).optional(),
  taglineEn: z.string().max(150).optional(),
  phone: z.string().regex(/^[0-9]{9,15}$/, { message: 'رقم واتساب غير صحيح' }),
  status: z.enum(['open', 'busy_60m', 'closed']),
  theme: z.string().max(30),
  specialsStyle: z.enum(['marquee', 'coverflow', 'spotlight', 'hero']),
  avatarUrl: z.string().max(2000000).optional().nullable(),
});
