"use client";
import { useEffect } from 'react';

export default function PublicationsPage() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.in-view { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.1 }
    );

    document.querySelectorAll('.pub-item').forEach(el => {
      (el as HTMLElement).style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity 0.5s ease,transform 0.5s ease;';
      observer.observe(el);
    });

    return () => { observer.disconnect(); style.remove(); };
  }, []);

  const pubs = [
    {
      year: 2026,
      title: 'Benchmarking Vision-Language Models for Clinical Procedural Video Evaluation: Performance, Clinical Risk, and Hallucination in Nursing and Surgical Skill Assessment',
      authors: 'Grover S, Landy J, et al.',
      venue: 'Scarborough Health Network Research Institute · In Preparation',
      tags: ['VLM', 'Hallucination', 'Clinical Risk', 'NurViD', 'AIxSuture'],
    },
  ];

  return (
    <section id="publications" className="section-light">
      <div className="container">
        <div className="section-header">
          <div className="section-header-left">
            <div className="section-numeral">06</div>
            <span className="label">Publications</span>
          </div>
          <div className="section-header-text">
            <h2>Selected Research Output</h2>
          </div>
        </div>
        <div className="pub-list">
          {pubs.map((pub, i) => (
            <div className="pub-item" key={i}>
              <div className="pub-year">{pub.year}</div>
              <div className="pub-body">
                <h4>{pub.title}</h4>
                <p className="pub-authors">{pub.authors}</p>
                <p className="pub-venue">{pub.venue}</p>
                <div className="pub-tags">{pub.tags.map(t => <span className="tag" key={t}>{t}</span>)}</div>
              </div>
              <a href="#" className="pub-link">PDF</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
