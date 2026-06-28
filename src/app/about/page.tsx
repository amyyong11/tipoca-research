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
            <div className="card-icon navy"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
            <h3>Multi-Layer Evaluation</h3>
            <p>We evaluate AI systems across technical performance, clinical validity, and real-world deployment conditions to surface risks invisible in benchmark testing.</p>
          </div>
          <div className="about-card">
            <div className="card-icon cyan"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
            <h3>Longitudinal Studies</h3>
            <p>Short-term accuracy does not predict long-term reliability. Our studies track model behaviour over time and across patient populations.</p>
          </div>
          <div className="about-card">
            <div className="card-icon navy"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
            <h3>Stakeholder Integration</h3>
            <p>Clinicians, patients, and administrators co-design our research protocols, ensuring findings translate to actionable practice change.</p>
          </div>
          <div className="about-card">
            <div className="card-icon cyan"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            <h3>Safety First</h3>
            <p>Every recommendation is grounded in evidence of harm prevention. We maintain a living registry of known failure modes in deployed healthcare AI.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
