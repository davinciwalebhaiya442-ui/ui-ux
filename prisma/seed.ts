import { PrismaClient, ProductType } from '@prisma/client';
import { ASSETS } from '../src/data/assets.js';
import { PROMPTS, GEAR_PICKS, TUTORIALS } from '../src/data/content.js';

const prisma = new PrismaClient();

const categoryDescriptions: Record<string, string> = {
  Templates: 'Production-ready templates for editors and colorists.',
  Presets: 'Reusable looks and presets for fast creative iteration.',
  'Color Grading': 'DCTLs, PowerGrades, and film-inspired color tools.',
  Effects: 'Visual effects and compositing tools.',
  Transitions: 'Transitions and motion graphics for editorial work.',
  Plugins: 'Native plugins for professional post-production software.',
  Tools: 'Practical utilities for creative workflows.',
  'Free Assets': 'Free downloads from the DavinciWaleBhaiya library.',
};

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  const categoryNames = [...new Set([...Object.keys(categoryDescriptions), ...ASSETS.map((asset) => asset.category)])];
  const categories = new Map<string, { id: string }>();
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name, description: categoryDescriptions[name] || null, published: true },
      create: { name, slug: slugify(name), description: categoryDescriptions[name] || null, published: true },
    });
    categories.set(name, category);
  }

  for (const asset of ASSETS) {
    const category = categories.get(asset.category);
    if (!category) continue;
    await prisma.product.upsert({
      where: { slug: asset.slug },
      update: {
        name: asset.name,
        description: asset.description,
        shortDescription: asset.tagline,
        categoryId: category.id,
        type: asset.type === 'paid' ? ProductType.PAID : ProductType.FREE,
        price: asset.price,
        priceUSD: asset.priceUSD,
        currency: 'INR',
        software: asset.compatibility,
        os: asset.os,
        included: asset.included,
        version: asset.version,
        fileSize: asset.fileSize,
        installationGuide: asset.installation,
        published: true,
      },
      create: {
        name: asset.name,
        slug: asset.slug,
        description: asset.description,
        shortDescription: asset.tagline,
        categoryId: category.id,
        type: asset.type === 'paid' ? ProductType.PAID : ProductType.FREE,
        price: asset.price,
        priceUSD: asset.priceUSD,
        currency: 'INR',
        software: asset.compatibility,
        os: asset.os,
        version: asset.version,
        fileSize: asset.fileSize,
        previewImages: [],
        installationGuide: asset.installation,
        included: asset.included,
        published: true,
        featured: ['auto-tracer', 'ripple-effect', 'yt-downloader', 'metallic-liquid', 'grid-effect-transition'].includes(asset.slug),
      },
    });
  }

  const contentSeeds = [
    ...PROMPTS.map((item) => ({ title: item.title, slug: item.id, excerpt: item.description, content: `${item.description}\n\n${item.promptText}\n\n${item.notes}`, category: ['Prompts', 'prompts'] })),
    ...GEAR_PICKS.map((item) => ({ title: item.name, slug: item.id, excerpt: item.role, content: item.notes, category: ['Gear & Picks', 'gear'] })),
    ...TUTORIALS.map((item) => ({ title: item.title, slug: item.id, excerpt: item.summary, content: `${item.summary}\n\n${item.breakdown.join('\n')}`, category: ['Tutorials', 'tutorials'] })),
  ];
  for (const item of contentSeeds) {
    const category = await prisma.contentCategory.upsert({ where: { slug: item.category[1] }, update: { name: item.category[0], published: true }, create: { name: item.category[0], slug: item.category[1], published: true } });
    await prisma.contentPost.upsert({ where: { slug: item.slug }, update: { title: item.title, excerpt: item.excerpt, content: item.content, categoryId: category.id, published: true }, create: { title: item.title, slug: item.slug, excerpt: item.excerpt, content: item.content, categoryId: category.id, tags: [], published: true } });
  }
}

main().finally(() => prisma.$disconnect());
