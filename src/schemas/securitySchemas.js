/**
 * Security Validation Schemas (Zod)
 * Enforces strict runtime data contracts across forms, checkout payloads, store creation, and admin operations.
 */
import { z } from 'zod';
import { stripHtml, sanitizeUrl } from '../utils/sanitizer.js';

// Sanitized text string that automatically strips any HTML
const cleanString = (min = 1, max = 250) =>
  z
    .string()
    .min(min, { message: `يجب ألا يقل النص عن ${min} حرف` })
    .max(max, { message: `يجب ألا يتجاوز النص ${max} حرف` })
    .transform((val) => stripHtml(val));

// Saudi / International phone regex: 05XXXXXXXX, +9665XXXXXXXX, 9665XXXXXXXX, or international E.164
const phoneRegex = /^(\+9665\d{8}|05\d{8}|9665\d{8}|\+?[1-9]\d{8,14})$/;

// Strict URL validator allowing empty string or HTTPS URLs only
const optionalHttpsUrl = z
  .string()
  .max(500)
  .optional()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      return sanitizeUrl(val, '') !== '';
    },
    { message: 'الرابط غير آمن — يُسمح فقط بروابط HTTPS الصالحة' }
  );

// Logo URL allowing HTTPS, relative paths, or validated base64 images (max ~2MB)
const optionalLogoUrl = z
  .string()
  .max(2000000)
  .optional()
  .nullable()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      if (val.startsWith('data:image/')) {
        return /^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,/i.test(val);
      }
      return sanitizeUrl(val, '') !== '';
    },
    { message: 'صيغة رابط الشعار غير آمنة' }
  );

/**
 * Customer Order Item Schema
 */
export const OrderItemSchema = z.object({
  id: z.string().min(1).max(50),
  titleAr: cleanString(1, 100),
  titleEn: z.string().max(100).optional(),
  price: z.number().positive().max(50000),
  quantity: z.number().int().min(1).max(50),
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
  customPhoto: z.string().max(2000000).optional().nullable(),
});

/**
 * Admin Authentication Schema (Login Gate)
 */
export const AdminLoginSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل' })
    .max(50)
    .regex(/^[a-zA-Z0-9_\-.@]+$/, { message: 'اسم المستخدم يحتوي على محارف غير مسموحة' }),
  password: z
    .string()
    .min(4, { message: 'كلمة المرور يجب ألا تقل عن 4 خانات' })
    .max(128, { message: 'كلمة المرور طويلة جداً' }),
});

/**
 * Strong Password Schema (Enforced for New Merchant Accounts & Admin Vault Setup)
 */
export const StrongPasswordSchema = z
  .string()
  .min(10, { message: 'كلمة المرور يجب أن تكون 10 خانات على الأقل' })
  .max(128, { message: 'كلمة المرور طويلة جداً' })
  .refine((val) => /[A-Z]/.test(val) && /[a-z]/.test(val), {
    message: 'يجب أن تحتوي كلمة المرور على أحرف إنجليزية كبيرة وصغيرة',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل',
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (مثل !@#$)',
  });

/**
 * Merchant / Store Owner Account Provisioning Schema
 */
export const StoreAccountSchema = z.object({
  ownerName: cleanString(2, 80),
  ownerEmail: z
    .string()
    .trim()
    .email({ message: 'البريد الإلكتروني لصاحب المحل غير صالح' })
    .max(120),
  ownerPhone: z
    .string()
    .trim()
    .regex(phoneRegex, { message: 'رقم جوال المالك غير صالح' })
    .optional()
    .or(z.literal('')),
  username: z
    .string()
    .trim()
    .min(3, { message: 'اسم المستخدم للدخول يجب أن يكون 3 أحرف على الأقل' })
    .max(36, { message: 'اسم المستخدم طويل جداً' })
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: 'اسم المستخدم يقبل أحرف إنجليزية وأرقام والنقطة والشرطة فقط',
    }),
  role: z.enum(['store_owner', 'store_manager']).default('store_owner'),
  accountStatus: z.enum(['active', 'pending', 'suspended']).default('active'),
});

/**
 * Complete Flower Storefront Website Builder Schema
 */
export const StoreBuilderSchema = z.object({
  nameAr: cleanString(2, 80),
  nameEn: cleanString(2, 80),
  slug: z
    .string()
    .trim()
    .min(2, { message: 'معرّف الرابط (Slug) يجب أن يكون حرفين على الأقل' })
    .max(64, { message: 'معرّف الرابط طويل جداً' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'معرّف الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات (-) فقط',
    }),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{9,15}$/, { message: 'رقم الواتساب غير صالح (مثال: 966501234567)' }),
  supportPhone: z
    .string()
    .trim()
    .regex(/^[0-9]{9,15}$/, { message: 'رقم خدمة العملاء غير صالح' })
    .optional()
    .or(z.literal('')),
  city: cleanString(2, 50),
  district: cleanString(0, 80).optional(),
  address: cleanString(0, 160).optional(),
  taglineAr: cleanString(0, 160).optional(),
  taglineEn: cleanString(0, 160).optional(),
  crNumber: z
    .string()
    .trim()
    .regex(/^(\d{10}|FL-\d{6,12})$/, {
      message: 'رقم السجل التجاري يجب أن يكون 10 أرقام (أو وثيقة العمل الحر FL-XXXXXX)',
    })
    .optional()
    .or(z.literal('')),
  vatNumber: z
    .string()
    .trim()
    .regex(/^\d{15}$/, { message: 'الرقم الضريبي يجب أن يتكون من 15 رقماً' })
    .optional()
    .or(z.literal('')),
  workingHours: cleanString(0, 80).optional(),
  deliveryFee: z.number().min(0).max(500),
  minOrderFreeDelivery: z.number().min(0).max(10000),
  prepMinutes: z.number().int().min(5).max(360),
  theme: z.enum(['botanical', 'velvet', 'noir', 'minimal']).default('botanical'),
  heroStyle: z.enum(['qlub', 'editorial', 'minimal']).default('qlub'),
  specialsStyle: z
    .enum(['editorial_deck', 'marquee', 'coverflow', 'spotlight', 'stacked_cards', 'floating_filmstrip'])
    .default('editorial_deck'),
  defaultLang: z.enum(['ar', 'en']).default('ar'),
  status: z.enum(['open', 'busy_60m', 'closed']).default('open'),
  googleMapsUrl: optionalHttpsUrl,
  instagramUrl: optionalHttpsUrl,
  logoUrl: optionalLogoUrl,
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
