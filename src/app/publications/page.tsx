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
      title: 'Benchmarking VLM Reliability in Healthcare: A Comprehensive Audit Framework for Procedural Clinical Video Understanding',
      authors: 'Grover S, Landy J, et al.',
      venue: 'Scarborough Health Network Research Institute · In Preparation',
      tags: ['VLM', 'Benchmarking', 'Clinical Safety'],
    },
  ];

  return (
    <section id="publications" className="section-light">
      <div className="container">
        <div className="section-header">
          <span className="label">Publications</span>
          <h2>Selected Research Output</h2>
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
