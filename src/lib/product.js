import { z } from 'zod';

const urlOrText = z.preprocess(
  (val) => (val === null || val === undefined ? '' : String(val).trim()),
  z.string().optional()
);

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .transform((val) =>
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    ),
  description: z.string().trim().min(1, 'Description is required'),
  shortDescription: z.preprocess(
    (val) => (val === null || val === undefined ? '' : String(val).trim()),
    z.string().optional()
  ),
  categoryId: z.string().min(1, 'Category is required'),
  type: z.preprocess(
    (val) => String(val || 'FREE').toUpperCase(),
    z.enum(['FREE', 'PAID'])
  ),
  price: z.coerce.number().int().min(0),
  priceUSD: z.coerce.number().int().min(0).optional().default(0),
  currency: z.string().trim().min(3).max(3).default('INR'),
  software: z.preprocess(
    (val) => (Array.isArray(val) ? val : typeof val === 'string' ? val.split(',').map((s) => s.trim()).filter(Boolean) : []),
    z.array(z.string()).default([])
  ),
  os: z.preprocess(
    (val) => (val === null || val === undefined ? '' : String(val).trim()),
    z.string().optional()
  ),
  version: z.preprocess(
    (val) => (val === null || val === undefined ? '1.0' : String(val).trim()),
    z.string().optional()
  ),
  fileSize: z.preprocess(
    (val) => (val === null || val === undefined ? '' : String(val).trim()),
    z.string().optional()
  ),
  previewImages: z.preprocess(
    (val) => (Array.isArray(val) ? val : []),
    z.array(z.string()).default([])
  ),
  thumbnailKey: urlOrText,
  demoVideo: urlOrText,
  beforeImage: urlOrText,
  afterImage: urlOrText,
  installationGuide: z.preprocess(
    (val) => (Array.isArray(val) ? val : typeof val === 'string' ? val.split('\n').map((s) => s.trim()).filter(Boolean) : []),
    z.array(z.string()).default([])
  ),
  included: z.preprocess(
    (val) => (Array.isArray(val) ? val : typeof val === 'string' ? val.split(',').map((s) => s.trim()).filter(Boolean) : []),
    z.array(z.string()).default([])
  ),
  downloadFileKey: urlOrText,
  downloadFileName: urlOrText,
  downloadFileSize: z.preprocess(
    (val) => (val === null || val === undefined || val === '' ? 0 : Number(val)),
    z.number().int().min(0).optional().nullable()
  ),
  featured: z.preprocess(
    (val) => val === true || val === 'true',
    z.boolean().default(false)
  ),
  published: z.preprocess(
    (val) => val === true || val === 'true',
    z.boolean().default(false)
  ),
});

export function toFrontendProduct(product) {
  return {
    ...product,
    dbId: product.id,
    downloadFileKey: product.downloadFileKey || null,
    downloadFileName: product.downloadFileName || null,
    downloadFileSize: product.downloadFileSize || null,
    thumbnailKey: product.thumbnailKey || null,
    beforeImage: product.beforeImage || null,
    afterImage: product.afterImage || null,
    demoVideo: product.demoVideo || null,
    previewImages: Array.isArray(product.previewImages) ? product.previewImages : (typeof product.previewImages === "string" ? (()=>{try{return JSON.parse(product.previewImages)}catch{return []}})() : []),
    id: product.slug,
    tagline: product.shortDescription || product.description,
    category: product.category?.name || '',
    type: product.type.toLowerCase(),
    priceUSD: product.priceUSD || (product.currency === 'USD' ? product.price : Math.round(product.price / 83)),
    compatibility: product.software || [],
    os: product.os || product.software?.join(' / ') || '',
    installation: product.installationGuide || [],
  };
}

export function parseBody(body, partial = false) {
  return (partial ? productSchema.partial() : productSchema).parse(body);
}
