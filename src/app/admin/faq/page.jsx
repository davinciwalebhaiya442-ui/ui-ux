'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '../AdminShell';

export default function FaqAdminPage() {
  const [faqs, setFaqs] = useState([]); const [question, setQuestion] = useState(''); const [answer, setAnswer] = useState('');
  const load = () => fetch('/api/admin/faq').then((response) => response.json()).then((data) => setFaqs(data.faqs || []));
  useEffect(() => { load(); }, []);
  const create = async (event) => { event.preventDefault(); const response = await fetch('/api/admin/faq', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question, answer }) }); if (response.ok) { setQuestion(''); setAnswer(''); load(); } };
  return <AdminLayout title="FAQ"><div className="mb-7"><p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">Content / Support</p><h2 className="mt-2 text-3xl font-semibold">FAQ</h2></div><div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]"><form onSubmit={create} className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-5 space-y-4"><p className="font-mono text-[10px] uppercase tracking-widest text-white/35">Add question</p><input required className="w-full rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-sm" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} /><textarea required rows="6" className="w-full rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-sm" placeholder="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} /><button className="rounded-xl bg-white px-4 py-3 text-xs text-black">Add FAQ</button></form><div className="space-y-3">{faqs.map((faq) => <article key={faq.id} className="rounded-2xl border border-white/[.08] bg-[#0a0f1b] p-5"><h3 className="font-medium">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-white/50">{faq.answer}</p></article>)}{!faqs.length && <p className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">No FAQs yet.</p>}</div></div></AdminLayout>;
}
