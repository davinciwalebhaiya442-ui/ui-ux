'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FAQS } from '@/data/content';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FAQSection() {
  const containerRef = useRef(null);
  const [faqs, setFaqs] = useState(FAQS);

  // Load any dynamic FAQs from admin API, fallback to default content
  useEffect(() => {
    fetch('/api/faq')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.faqs && data.faqs.length > 0) {
          setFaqs(data.faqs.map((f) => ({ q: f.question, a: f.answer })));
        }
      })
      .catch(() => {});
  }, []);

  // Core chat-bubble expand animation from files 2 (excluding intro and outro)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ctx = gsap.context(() => {
      // Allow layout and web fonts to complete layout pass
      const timer = setTimeout(() => {
        const section = containerRef.current;
        if (!section) return;

        const messages = section.querySelectorAll('.faq-message');
        if (!messages || messages.length === 0) return;

        const isMobile = window.innerWidth <= 768;
        const padX = isMobile ? '1.5rem' : '2rem';
        const padY = isMobile ? '1.25rem' : '1.5rem';

        messages.forEach((message) => {
          const faqRow = message.parentElement;
          const typingIndicator = message.querySelector('.typing-indicator');
          const messageCopy = message.querySelectorAll('.faq-content p');

          const expandedWidth = message.offsetWidth;
          message.style.width = `${expandedWidth}px`;
          const expandedHeight = message.offsetHeight;
          if (faqRow) {
            faqRow.style.minHeight = `${expandedHeight}px`;
          }

          gsap.set(message, {
            width: 64,
            height: 64,
            borderRadius: '50%',
            padding: 0,
            scale: 0,
          });

          let collapseWhenDone = false;

          const enterTimeline = gsap.timeline({ paused: true });

          enterTimeline.to(message, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });

          const expandTimeline = gsap.timeline({
            paused: true,
            onReverseComplete: () => {
              if (collapseWhenDone) {
                collapseWhenDone = false;
                enterTimeline.reverse();
              }
            },
          });

          expandTimeline
            .to(typingIndicator, {
              autoAlpha: 0,
              duration: 0.2,
            })
            .to(message, {
              width: expandedWidth,
              borderRadius: '2rem',
              paddingLeft: padX,
              paddingRight: padX,
              duration: 0.4,
              ease: 'power3.inOut',
            })
            .to(
              message,
              {
                height: expandedHeight,
                paddingTop: padY,
                paddingBottom: padY,
                duration: 0.4,
                ease: 'power3.inOut',
              },
              '-=0.2'
            )
            .to(
              messageCopy,
              {
                opacity: 1,
                duration: 0.3,
                stagger: 0.05,
              },
              '-=0.25'
            );

          ScrollTrigger.create({
            trigger: message,
            start: 'top 85%',
            onEnter: () => {
              collapseWhenDone = false;
              enterTimeline.play();
            },
            onLeaveBack: () => {
              if (expandTimeline.progress() > 0) {
                collapseWhenDone = true;
              } else {
                enterTimeline.reverse();
              }
            },
          });

          ScrollTrigger.create({
            trigger: message,
            start: 'top 75%',
            onEnter: () => expandTimeline.play(),
            onLeaveBack: () => expandTimeline.reverse(),
          });
        });

        ScrollTrigger.refresh();
      }, 150);

      return () => clearTimeout(timer);
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [faqs]);

  return (
    <section id="faq" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/[0.08]">
      {/* Header */}
      <div className="mb-16 text-center">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 block mb-2">
          07 / Clarifications
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-sans">
          Frequently Answered Questions
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-white/50 max-w-lg mx-auto">
          Common inquiries about licenses, downloads, DaVinci Resolve compatibility, and custom studio workflows.
        </p>
      </div>

      {/* Animated Scroll-Powered FAQ Chat Bubbles */}
      <div ref={containerRef} className="faq-container">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            {/* Question Bubble (Left Aligned) */}
            <div className="faq-row faq-question-slot">
              <div className="faq-question faq-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="faq-content">
                  <p>{faq.q}</p>
                </div>
              </div>
            </div>

            {/* Answer Bubble (Right Aligned) */}
            <div className="faq-row faq-answer-slot">
              <div className="faq-answer faq-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="faq-content">
                  {String(faq.a || '')
                    .split('\n\n')
                    .filter(Boolean)
                    .map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
