import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
export async function GET() { return Response.json({ faqs: await prisma.faq.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } }) }); }
export async function POST(request) { const unauthorized = await requireAdmin(request); if (unauthorized) return unauthorized; const b = await request.json(); return Response.json({ faq: await prisma.faq.create({ data: { question: b.question, answer: b.answer, category: b.category, sortOrder: Number(b.sortOrder || 0), published: Boolean(b.published) } }) }, { status: 201 }); }
