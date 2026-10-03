'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AdminLayout, useAdmin } from '../AdminShell';
import { notifyAdminChange } from '@/lib/events';

export default function FaqAdminPage() {
  const { toast, confirm } = useAdmin();
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const load = () =>
    fetch('/api/admin/faq')
      .then((response) => response.json())
      .then((data) => setFaqs(data.faqs || []))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/admin/faq', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create FAQ');
      toast('FAQ added successfully', 'success');
      setQuestion('');
      setAnswer('');
      notifyAdminChange();
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const remove = async (id) => {
    const ok = await confirm({
      title: 'Delete FAQ?',
      message: 'Are you sure you want to delete this FAQ item? This action cannot be undone.',
      confirmText: 'Delete FAQ',
      destructive: true,
    });
    if (!ok) return;

    try {
      const response = await fetch(`/api/admin/faq?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete FAQ');
      toast('FAQ deleted successfully', 'success');
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      notifyAdminChange();
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <AdminLayout title="FAQ">
      <div className="mb-7">
        <p className="font-mono text-[10px] uppercase tracking-[.24em] text-blue-300/70">Content / Support</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Frequently Asked Questions</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <form onSubmit={create} className="rounded-2xl border border-white/[.08] bg-[#080c16] p-6 space-y-4 h-fit">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">Add New FAQ</p>
          <input
            required
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400"
            placeholder="Question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <textarea
            required
            rows={6}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400"
            placeholder="Answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button className="w-full rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black hover:bg-white/90 transition-colors">
            Add FAQ
          </button>
        </form>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <article
              key={faq.id}
              className="rounded-2xl border border-white/[.08] bg-[#080c16] p-5 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <h3 className="font-medium text-white text-sm">{faq.question}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/50">{faq.answer}</p>
              </div>
              <button
                onClick={() => remove(faq.id)}
                className="p-1.5 text-white/30 hover:text-red-400 transition-colors shrink-0"
                title="Delete FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </article>
          ))}
          {!faqs.length && (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-xs text-white/40">
              No FAQs added yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
