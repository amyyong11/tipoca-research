"use client";
import { useEffect } from 'react';

export default function AboutPage() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.in-view { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.1 }
    );

    document.querySelectorAll('.about-card').forEach(el => {
      (el as HTMLElement).style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity 0.5s ease,transform 0.5s ease;';
      observer.observe(el);
    });
    document.querySelectorAll('.about-grid').forEach(group => {
      [...group.children].forEach((child, i) => {
        (child as HTMLElement).style.transitionDelay = `${i * 80}ms`;
      });
    });

    return () => { observer.disconnect(); style.remove(); };
  }, []);

  return (
    <section id="about" className="section-light">
      <div className="container">
        <div className="section-header">
          <span className="label">About the Project</span>
          <h2>Why Supporting Research Matters</h2>
          <p className="section-desc">Deploying AI in clinical settings is not merely a technical problem. It demands rigorous evaluation of safety, fairness, workflow integration, and trust — the infrastructure that makes AI work <em>for</em> patients and clinicians.</p>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <div className="card-icon navy"><svg viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 1 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg></div>
            <h3>Four-Tier Evaluation</h3>
            <p>We assess VLMs across perception and classification (Tier 1), procedural reasoning (Tier 2), clinical risk and hallucination (Tier 3), and real-world SHN deployment (Tier 4) — moving beyond simple accuracy benchmarks.</p>
          </div>
          <div className="about-card">
            <div className="card-icon cyan"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>
            <h3>12+ Models Compared</h3>
            <p>Open-source (Qwen3.6, InternVL), closed-source (Gemini, GPT), and medically-specialized models (LLaVA-Med, Med-Flamingo, MedVInT, RadFM) are evaluated under identical conditions.</p>
          </div>
          <div className="about-card">
            <div className="card-icon navy"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <h3>Hallucination &amp; Clinical Risk</h3>
            <p>We measure procedural, object, anatomical, and sequential hallucinations — and classify VLM errors by clinical risk level (critical, major, minor) to surface the failure modes most dangerous for patient safety.</p>
          </div>
          <div className="about-card">
            <div className="card-icon cyan"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            <h3>Reusable Audit Framework</h3>
            <p>Rather than asking "which model is best?", our framework defines the capability gaps required for deployment — providing a reusable standard any developer can use to test their clinical VLM before release.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
