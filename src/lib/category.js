import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers and hyphens'),
  description: z.string().trim().optional().nullable(),
  image: z.string().trim().optional().nullable(),
  published: z.boolean().default(true),
});
