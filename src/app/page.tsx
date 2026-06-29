"use client";
import Link from 'next/link';
import { AntiGravityCanvas } from '@/components/ui/particle-effect-for-hero';

const BASE = process.env.NODE_ENV === 'production' ? '/tipoca-research' : '';

export default function Home() {
  return (
    <section id="hero" style={{ position: 'relative' }}>
      <AntiGravityCanvas />
      <div className="hero-content" style={{ position: 'relative', zIndex: 10 }}>
        <img src={`${BASE}/images/logo-dark.png`} alt="TIPOCA" className="hero-logo" />
        <p className="hero-eyebrow">Research Initiative</p>
        <h1 className="hero-title-metallic">Operationalizing<br /><span className="accent">AI in Healthcare</span></h1>
        <p className="hero-sub">We audit vision-language models on clinical procedural video understanding — benchmarking performance, hallucination, and clinical risk across nursing procedures and surgical skill assessment to determine readiness for real-world deployment.</p>
        <div className="hero-cta">
          <Link href="/findings" className="btn-primary">Explore Findings</Link>
          <Link href="/publications" className="btn-ghost">Publications</Link>
        </div>
        <div className="hero-scroll-hint">
          <span>Scroll to explore</span>
          <div className="scroll-arrow"></div>
        </div>
      </div>
    </section>
  );
}
