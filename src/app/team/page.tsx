"use client";
import { useEffect } from 'react';

export default function TeamPage() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.in-view { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.1 }
    );

    document.querySelectorAll('.team-card').forEach(el => {
      (el as HTMLElement).style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity 0.5s ease,transform 0.5s ease;';
      observer.observe(el);
    });
    document.querySelectorAll('.team-grid').forEach(group => {
      [...group.children].forEach((child, i) => {
        (child as HTMLElement).style.transitionDelay = `${i * 80}ms`;
      });
    });

    return () => { observer.disconnect(); style.remove(); };
  }, []);

  return (
    <section id="team" className="section-dark">
      <div className="container">
        <div className="section-header light">
          <span className="label">Our Team</span>
          <h2>Researchers &amp; Collaborators</h2>
        </div>
        <div className="team-grid">
          <div className="team-card">
            <div className="team-avatar" style={{ background: '#5BC8E8' }}>SG</div>
            <h4>Dr. Samir Grover</h4>
            <p className="team-role">Principal Investigator</p>
            <p className="team-focus">Scarborough Health Network Research Institute</p>
          </div>
          <div className="team-card">
            <div className="team-avatar" style={{ background: '#5BC8E8' }}>JL</div>
            <h4>Dr. Joshua Landy</h4>
            <p className="team-role">Co-Investigator</p>
            <p className="team-focus">Scarborough Health Network Research Institute</p>
          </div>
        </div>
      </div>
    </section>
  );
}
