import Link from 'next/link';

const BASE = process.env.NODE_ENV === 'production' ? '/tipoca-research' : '';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-top">
          <Link href="/" className="footer-logo-link">
            <img src={`${BASE}/images/logo-dark.png`} alt="TIPOCA" className="footer-logo-img" />
          </Link>
          <nav className="footer-page-nav">
            <Link href="/about">About</Link>
            <Link href="/findings">Findings</Link>
            <Link href="/framework">Framework</Link>
            <Link href="/impact">Impact</Link>
            <Link href="/team">Team</Link>
            <Link href="/publications">Publications</Link>
          </nav>
        </div>

        <div className="footer-bottom">
          <div className="footer-external">
            <a href="https://www.groverlab.ca/" target="_blank" rel="noopener noreferrer">Grover Lab</a>
            <span className="footer-dot">·</span>
            <a href="https://www.shn.ca/shn-research-institute/" target="_blank" rel="noopener noreferrer">SHN Research Institute</a>
          </div>
          <p className="footer-copy">&copy; 2026 TIPOCA Research Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
