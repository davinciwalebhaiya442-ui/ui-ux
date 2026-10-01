import PromptCopy from '@/components/PromptCopy';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getPost(slug) {
  try {
    const post = await prisma.contentPost.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!post || !post.published) return { error: 'CONTENT_NOT_FOUND' };
    return { post };
  } catch {
    return { error: 'QUERY_FAILED' };
  }
}

export default async function ContentDetailPage({ params }) {
  const data = await getPost(params.slug);
  if (data.error || !data.post) {
    return <main className="min-h-screen bg-black p-20 text-white font-sans">Content not found.</main>;
  }

  return (
    <main className="min-h-screen bg-black px-5 py-32 text-white sm:px-10 font-sans">
      <article className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-blue-300/70">{data.post.category.name}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{data.post.title}</h1>
        {data.post.excerpt && <p className="mt-4 text-white/55 leading-relaxed">{data.post.excerpt}</p>}
        <div className="mt-10 whitespace-pre-wrap border-t border-white/10 pt-8 text-sm leading-8 text-white/75">
          {data.post.content}
        </div>
        {data.post.category?.slug === 'prompts' && <PromptCopy content={data.post.content} />}
      </article>
    </main>
  );
}
