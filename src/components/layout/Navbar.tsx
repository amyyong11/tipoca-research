"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const BASE = process.env.NODE_ENV === 'production' ? '/tipoca-research' : '';

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const navbar = navRef.current;
    if (!navbar) return;
    const handleScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav id="navbar" ref={navRef}>
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <img src={`${BASE}/images/logo-dark.png`} alt="TIPOCA" className="nav-logo-img" />
        </Link>
        <button type="button" className="nav-toggle" onClick={() => setNavOpen(o => !o)} aria-label="Toggle menu">&#9776;</button>
        <ul className={`nav-links${navOpen ? ' open' : ''}`} id="nav-links">
          <li><Link href="/about">About</Link></li>
          <li><Link href="/findings">Findings</Link></li>
          <li><Link href="/framework">Framework</Link></li>
          <li><Link href="/impact">Impact</Link></li>
          <li><Link href="/team">Team</Link></li>
          <li><Link href="/publications">Publications</Link></li>
        </ul>
      </div>
    </nav>
  );
}
