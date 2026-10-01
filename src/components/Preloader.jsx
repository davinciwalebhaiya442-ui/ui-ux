'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const words = [
  "Hello",
  "Bonjour",
  "Ciao",
  "Olá",
  "やあ",
  "Hallå",
  "Guten tag",
  "Hallo"
];

export default function Preloader({ onLoaded }) {
  const preloaderRef = useRef(null);
  const wordRef = useRef(null);
  const wordTextRef = useRef(null);
  const pathRef = useRef(null);
  const [isRendered, setIsRendered] = useState(true);

  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let isMounted = true;
    let index = 0;

    const dimension = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    function getPaths() {
      const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height} L0 0`;
      const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`;
      return { initialPath, targetPath };
    }

    const { initialPath } = getPaths();
    if (pathRef.current) {
      pathRef.current.setAttribute('d', initialPath);
    }

    if (wordTextRef.current) {
      wordTextRef.current.textContent = words[0];
    }

    // Fade in first word
    if (wordRef.current) {
      gsap.to(wordRef.current, {
        opacity: 0.85,
        duration: 0.8,
        delay: 0.2,
      });
    }

    // Word cycling - single pass
    function cycleWords() {
      if (!isMounted || index >= words.length - 1) return;

      const delay = index === 0 ? 0.9 : 0.15;

      gsap.delayedCall(delay, () => {
        if (!isMounted) return;
        index += 1;
        if (wordTextRef.current) {
          wordTextRef.current.textContent = words[index];
        }
        cycleWords();
      });
    }

    cycleWords();

    const totalDelay = words.length * 0.15 + 1.4;

    const exitCall = gsap.delayedCall(totalDelay, () => {
      if (!isMounted || !preloaderRef.current || !pathRef.current) return;

      const { initialPath, targetPath } = getPaths();

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          if (!isMounted) return;
          if (preloaderRef.current) {
            preloaderRef.current.style.display = 'none';
          }
          setIsRendered(false);
          if (onLoadedRef.current) onLoadedRef.current();
        },
      });

      if (wordRef.current) {
        tl.to(
          wordRef.current,
          {
            opacity: 0,
            duration: 0.3,
          },
          0
        );
      }

      tl.to(
        preloaderRef.current,
        {
          y: '-100vh',
          duration: 0.85,
          delay: 0.15,
          ease: 'power4.inOut',
        },
        0
      );

      tl.fromTo(
        pathRef.current,
        {
          attr: { d: initialPath },
        },
        {
          attr: { d: targetPath },
          duration: 0.75,
          delay: 0.25,
          ease: 'power4.inOut',
        },
        0
      );
    });

    const handleResize = () => {
      dimension.width = window.innerWidth;
      dimension.height = window.innerHeight;
      if (pathRef.current) {
        const { initialPath } = getPaths();
        pathRef.current.setAttribute('d', initialPath);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      exitCall.kill();
      if (wordRef.current) gsap.killTweensOf(wordRef.current);
    };
  }, []);

  if (!isRendered) return null;

  return (
    <div className="preloader fixed inset-0 z-[999999]" ref={preloaderRef} id="js-preloader" style={{ zIndex: 999999 }}>
      <p className="preloader__word" ref={wordRef} id="js-word">
        <span className="preloader__dot"></span>
        <span ref={wordTextRef} id="js-word-text">
          Hello
        </span>
      </p>

      <svg className="preloader__svg" id="js-svg" preserveAspectRatio="none">
        <path ref={pathRef} id="js-path"></path>
      </svg>
    </div>
  );
}
