import { content } from '../content/page';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__divider" aria-hidden="true">
        <span>✦</span><span>♥</span><span>✦</span>
      </div>
      <p className="footer__text">
        {content.footer.line1}
      </p>
      <p className="footer__love">{content.footer.line2}</p>
      <p className="footer__year">2026</p>
    </footer>
  );
}
