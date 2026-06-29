"use client";
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function FrameworkPage() {
  const radarRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svgEl = radarRef.current;
    if (!svgEl) return;
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const pillars = [
      { axis: 'Technical Validity',      value: 0.85 },
      { axis: 'Implementation',          value: 0.78 },
      { axis: 'Patient Outcomes',        value: 0.72 },
      { axis: 'Operational\nContinuity', value: 0.80 },
      { axis: 'Clinician Adoption',      value: 0.68 },
    ];

    const N = pillars.length;
    const W = 500, H = 440, cx = W / 2, cy = H / 2 + 10, R = 155;
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    const angleSlice = (2 * Math.PI) / N;
    const rScale = d3.scaleLinear().domain([0, 1]).range([0, R]);
    const coords = (val: number, i: number): [number, number] => {
      const angle = angleSlice * i - Math.PI / 2;
      return [cx + rScale(val) * Math.cos(angle), cy + rScale(val) * Math.sin(angle)];
    };

    [0.25, 0.5, 0.75, 1].forEach(r => {
      const pts = d3.range(N).map(i => coords(r, i));
      svg.append('polygon')
        .attr('points', pts.map(p => p.join(',')).join(' '))
        .attr('fill', r === 1 ? 'rgba(91,200,232,0.05)' : 'none')
        .attr('stroke', 'rgba(91,200,232,0.15)').attr('stroke-width', 1);
    });

    d3.range(N).forEach(i => {
      const [x2, y2] = coords(1, i);
      svg.append('line')
        .attr('x1', cx).attr('y1', cy).attr('x2', x2).attr('y2', y2)
        .attr('stroke', 'rgba(91,200,232,0.2)').attr('stroke-width', 1);
    });

    const defs = svg.append('defs');
    const radarGrad = defs.append('radialGradient').attr('id', 'radarGrad');
    radarGrad.append('stop').attr('offset', '0%').attr('stop-color', '#5BC8E8').attr('stop-opacity', 0.45);
    radarGrad.append('stop').attr('offset', '100%').attr('stop-color', '#4080D0').attr('stop-opacity', 0.15);

    svg.append('polygon')
      .attr('points', pillars.map((d, i) => coords(d.value, i).join(',')).join(' '))
      .attr('fill', 'url(#radarGrad)').attr('stroke', '#5BC8E8')
      .attr('stroke-width', 2.5).attr('stroke-linejoin', 'round');

    pillars.forEach((d, i) => {
      const [px, py] = coords(d.value, i);
      svg.append('circle').attr('cx', px).attr('cy', py).attr('r', 6)
        .attr('fill', '#5BC8E8').attr('stroke', '#4080D0').attr('stroke-width', 2);

      const [lx, ly] = coords(1.22, i);
      const textEl = svg.append('text')
        .attr('x', lx).attr('y', ly)
        .attr('text-anchor', lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#4080D0');
      d.axis.split('\n').forEach((line, li) => {
        textEl.append('tspan').attr('x', lx).attr('dy', li === 0 ? 0 : 14).text(line);
      });

      const [vx, vy] = coords(d.value - 0.13, i);
      svg.append('text')
        .attr('x', vx).attr('y', vy)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('font-size', 10).attr('font-weight', 600).attr('fill', '#4080D0')
        .text(`${Math.round(d.value * 100)}%`);
    });
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.in-view { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.1 }
    );

    document.querySelectorAll('.pillar').forEach(el => {
      (el as HTMLElement).style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity 0.5s ease,transform 0.5s ease;';
      observer.observe(el);
    });

    return () => { observer.disconnect(); style.remove(); };
  }, []);

  return (
    <section id="framework" className="section-light">
      <div className="container">
        <div className="section-header">
          <div className="section-header-left">
            <div className="section-numeral">03</div>
            <span className="label">The TIPOCA Framework</span>
          </div>
          <div className="section-header-text">
            <h2>A Five-Pillar Approach to AI Operationalization</h2>
            <p className="section-desc">Based on our findings, we developed a structured framework that healthcare organizations can use to evaluate, deploy, and monitor AI systems responsibly.</p>
          </div>
        </div>
        <div className="framework-vis">
          <svg id="radar-chart" ref={radarRef} viewBox="0 0 500 440"></svg>
          <div className="framework-pillars">
            <div className="pillar" data-index="0">
              <div className="pillar-num">01</div>
              <h4>Technical Validity</h4>
              <p>Rigorous evaluation of model performance across diverse, representative datasets before any clinical use.</p>
            </div>
            <div className="pillar" data-index="1">
              <div className="pillar-num">02</div>
              <h4>Implementation</h4>
              <p>Workflow integration, EHR compatibility, alert fatigue mitigation, and clinician interface design.</p>
            </div>
            <div className="pillar" data-index="2">
              <div className="pillar-num">03</div>
              <h4>Patient Outcomes</h4>
              <p>Direct measurement of patient safety metrics, care quality, and experience - not proxy metrics.</p>
            </div>
            <div className="pillar" data-index="3">
              <div className="pillar-num">04</div>
              <h4>Operational Continuity</h4>
              <p>Ongoing monitoring, retraining pipelines, and governance structures to maintain performance over time.</p>
            </div>
            <div className="pillar" data-index="4">
              <div className="pillar-num">05</div>
              <h4>Clinician Adoption</h4>
              <p>Trust-building, transparency mechanisms, training, and change management for sustainable use.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
