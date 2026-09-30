'use client';
import { useState } from 'react';
export default function PromptCopy({ content }) { const [copied, setCopied] = useState(false); return <button onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="mt-8 rounded-xl bg-white px-4 py-3 text-sm text-black">{copied ? 'Copied' : 'Copy prompt'}</button>; }
