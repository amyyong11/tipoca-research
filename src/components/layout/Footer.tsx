import Link from 'next/link';

const BASE = process.env.NODE_ENV === 'production' ? '/tipoca-research' : '';

export default function Footer() {
  return (
    <footer>
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src={`${BASE}/images/logo-dark.png`} alt="TIPOCA" className="footer-logo-img" />
          <p>Operationalizing AI in Healthcare Research Initiative</p>
        </div>
        <div className="footer-links">
          <Link href="/about">About</Link>
          <Link href="/findings">Findings</Link>
          <Link href="/framework">Framework</Link>
          <Link href="/publications">Publications</Link>
        </div>
        <div className="footer-copy">
          <p>&copy; 2025 TIPOCA Research Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
