import { z } from 'zod';

const urlOrText = z.string().trim().optional().or(z.literal(''));

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .transform((s) =>
      s
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    ),
  description: z.string().trim().min(1, 'Description is required'),
  shortDescription: z.string().trim().optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  type: z.enum(['FREE', 'PAID']),
  price: z.coerce.number().int().min(0),
  priceUSD: z.coerce.number().int().min(0).optional().default(0),
  currency: z.string().trim().min(3).max(3).default('INR'),
  software: z.array(z.string()).default([]),
  os: z.string().trim().optional().nullable(),
  version: z.string().trim().optional().nullable(),
  fileSize: z.string().trim().optional().nullable(),
  previewImages: z.array(urlOrText).default([]),
  thumbnailKey: urlOrText,
  demoVideo: urlOrText,
  beforeImage: urlOrText,
  afterImage: urlOrText,
  installationGuide: z.array(z.string()).default([]),
  included: z.array(z.string()).default([]),
  downloadFileKey: urlOrText,
  downloadFileName: urlOrText,
  downloadFileSize: z.coerce.number().int().min(0).optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
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
