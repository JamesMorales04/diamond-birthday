import { useState, useRef, useEffect, useCallback } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { createConfetti } from '../utils/confetti';

const SCRATCH_RADIUS = 24;
const REVEAL_THRESHOLD = 0.4; // 40% scratched to reveal

const hiddenMessage = `You are the most beautiful thing that has ever happened to me. Every day with you is a gift. I love you beyond measure. ♥`;

export default function ScratchCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const isDrawing = useRef(false);
  const reducedMotion = useReducedMotion();
  const hasInitialized = useRef(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = rect ? Math.min(rect.width, 500) : 500;
    const h = rect ? Math.min(rect.height * 0.7, 350) : 300;
    canvas.width = w * 2;
    canvas.height = h * 2;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(2, 2);

    // Scratch layer — warm gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#722F37');
    gradient.addColorStop(0.5, '#9B1B30');
    gradient.addColorStop(1, '#722F37');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Text on scratch layer
    ctx.fillStyle = '#FFFDD0';
    ctx.font = 'bold 22px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Scratch Here ✨', w / 2, h / 2 - 10);
    ctx.font = '16px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Gently rub to reveal', w / 2, h / 2 + 30);

    if (reducedMotion) {
      // Auto-reveal for reduced motion
      setTimeout(() => reveal(), 500);
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (isVisible && !hasInitialized.current) {
      hasInitialized.current = true;
      initCanvas();
    }
  }, [isVisible, initCanvas]);

  const reveal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsRevealed(true);
    setScratchPercent(100);
    createConfetti({ count: 30, duration: 2000 });
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const scratch = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      // Check percentage revealed
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparent = 0;
      const total = pixels.length / 4;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparent++;
      }
      const percent = (transparent / total) * 100;
      setScratchPercent(percent);

      if (percent > REVEAL_THRESHOLD * 100 && !isRevealed) {
        reveal();
      }
    },
    [isRevealed, reveal],
  );

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return;
    isDrawing.current = true;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || isRevealed) return;
    e.preventDefault();
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

  return (
    <section
      ref={ref}
      className={`section scratch ${isVisible ? 'scratch--visible' : ''}`}
      aria-labelledby="scratch-title"
    >
      <h2 id="scratch-title" className="section__title">
        A Message for You
      </h2>
      <p className="section__subtitle">Scratch to reveal what is in my heart</p>

      <div
        className={`scratch__card ${isRevealed ? 'scratch__card--revealed' : ''}`}
        role="img"
        aria-label={isRevealed ? hiddenMessage : 'Scratch card with hidden message'}
      >
        <div className="scratch__message" aria-hidden={!isRevealed}>
          <div className="scratch__ornament" aria-hidden="true">~ ♥ ~</div>
          <p>{hiddenMessage}</p>
        </div>

        <canvas
          ref={canvasRef}
          className={`scratch__canvas ${isRevealed ? 'scratch__canvas--hidden' : ''}`}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />

        {isRevealed && (
          <div className="scratch__sparkles" aria-hidden="true">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="scratch__sparkle" style={{ animationDelay: `${i * 0.2}s` }}>
                ✦
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="scratch__progress" aria-hidden="true">
        <div className="scratch__progress-bar" style={{ width: `${scratchPercent}%` }} />
      </div>
    </section>
  );
}
