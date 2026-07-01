interface ConfettiOptions {
  count?: number;
  colors?: string[];
  duration?: number;
}

const DEFAULT_COLORS = ['#D4A5A5', '#C9B99A', '#9B1B30', '#FFFDD0', '#722F37'];

export function createConfetti(options: ConfettiOptions = {}): void {
  const { count = 60, colors = DEFAULT_COLORS, duration = 3000 } = options;
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; inset: 0; pointer-events: none; z-index: 99999;
    overflow: hidden;
  `;
  document.body.appendChild(container);

  const particles: HTMLDivElement[] = [];

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8;
    const startX = Math.random() * 100;
    const delay = Math.random() * 500;
    const rotation = Math.random() * 360;
    const drift = (Math.random() - 0.5) * 200;
    const endRotation = 360 + Math.random() * 720; // per-particle random spin

    particle.style.cssText = `
      position: absolute;
      top: -20px;
      left: ${startX}%;
      width: ${size}px;
      height: ${size * 0.6}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      opacity: 1;
      transform: rotate(${rotation}deg);
      animation: confetti-fall ${1.5 + Math.random() * 1.5}s ease-in ${delay}ms forwards;
      --drift: ${drift}px;
      --end-rotate: ${endRotation}deg;
    `;

    container.appendChild(particle);
    particles.push(particle);
  }

  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes confetti-fall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(var(--end-rotate, 360deg)) translateX(var(--drift, 0px)); opacity: 0; }
    }
  `;
  document.head.appendChild(styleSheet);

  setTimeout(() => {
    container.remove();
    styleSheet.remove();
  }, duration + 1000);
}
