"use client";
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function FindingsPage() {
  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const statColRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const container = barChartRef.current;
    if (!container) return;
    d3.select(container).selectAll('*').remove();

    const data = [
      { task: 'Procedure\nClass.', gemini: 74.68, qwen27: 58.21, qwen35: 55.01 },
      { task: 'Action\nClass.', gemini: 65.33, qwen27: 44.20, qwen35: 38.59 },
      { task: 'Joint\nClass.', gemini: 49.28, qwen27: 29.68, qwen35: 27.44 },
    ];

    const margin = { top: 10, right: 10, bottom: 48, left: 44 };
    const W = container.clientWidth || 480;
    const H = 220;
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%');
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand().domain(data.map(d => d.task)).range([0, w]).padding(0.28);
    const x1 = d3.scaleBand().domain(['gemini', 'qwen27', 'qwen35']).range([0, x0.bandwidth()]).padding(0.06);
    const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat('' as never))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('line').attr('stroke', 'rgba(255,255,255,0.1)'));

    const colors: Record<string, string> = { gemini: '#5BC8E8', qwen27: '#4080D0', qwen35: '#5590D8' };

    const groups = g.selectAll('.bar-group').data(data).enter().append('g')
      .attr('transform', d => `translate(${x0(d.task)},0)`);

    (['gemini', 'qwen27', 'qwen35'] as const).forEach(key => {
      groups.append('rect')
        .attr('x', x1(key)!).attr('width', x1.bandwidth())
        .attr('y', h).attr('height', 0)
        .attr('fill', colors[key]).attr('rx', 3)
        .transition().duration(800).delay((_, i) => i * 80)
        .attr('y', d => y(d[key])).attr('height', d => h - y(d[key]));
    });

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .call(gg => gg.select('.domain').attr('stroke', 'rgba(255,255,255,0.2)'))
      .call(gg => {
        gg.selectAll('text').remove();
        gg.selectAll('.tick').each(function(d) {
          const parts = (d as string).split('\n');
          const tick = d3.select(this);
          parts.forEach((line, i) => {
            tick.append('text')
              .attr('y', 12 + i * 13).attr('x', 0)
              .attr('text-anchor', 'middle')
              .attr('fill', 'rgba(255,255,255,0.6)').attr('font-size', 10)
              .text(line);
          });
        });
      });

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('text').attr('fill', 'rgba(255,255,255,0.6)').attr('font-size', 10));
  }, []);

  useEffect(() => {
    const container = lineChartRef.current;
    if (!container) return;
    d3.select(container).selectAll('*').remove();

    type ModelKey = 'gemini' | 'qwen27' | 'qwen35';
    const kValues = [1, 2, 3, 4, 5];
    const series: { key: ModelKey; label: string; color: string; values: number[] }[] = [
      { key: 'gemini', label: 'Gemini 3.5 Flash', color: '#5BC8E8', values: [74.68, 85.01, 89.20, 90.15, 91.42] },
      { key: 'qwen27', label: 'Qwen 3.6 27B',     color: '#4080D0', values: [58.21, 69.46, 72.67, 75.76, 77.83] },
      { key: 'qwen35', label: 'Qwen 3.6 35B',     color: '#5590D8', values: [55.01, 67.97, 73.42, 76.15, 77.76] },
    ];

    const margin = { top: 16, right: 24, bottom: 48, left: 52 };
    const W = container.clientWidth || 760;
    const H = 220;
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%');
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([1, 5]).range([0, w]);
    const y = d3.scaleLinear().domain([40, 100]).range([h, 0]);

    g.append('g')
      .call(d3.axisLeft(y).ticks(6).tickSize(-w).tickFormat('' as never))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('line').attr('stroke', 'rgba(255,255,255,0.08)'));

    type Datum = { k: number; v: number };
    const line = d3.line<Datum>().x(d => x(d.k)).y(d => y(d.v)).curve(d3.curveCatmullRom);

    series.forEach(s => {
      const datum = kValues.map((k, i) => ({ k, v: s.values[i] }));
      const path = g.append('path').datum(datum).attr('d', line)
        .attr('fill', 'none').attr('stroke', s.color).attr('stroke-width', 2.5);
      const totalLen = (path.node() as SVGPathElement).getTotalLength();
      path.attr('stroke-dasharray', totalLen).attr('stroke-dashoffset', totalLen)
        .transition().duration(1400).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0);

      g.selectAll<SVGCircleElement, Datum>(`.dot-${s.key}`).data(datum).enter().append('circle')
        .attr('cx', d => x(d.k)).attr('cy', d => y(d.v))
        .attr('r', 4).attr('fill', s.color).attr('stroke', '#000').attr('stroke-width', 1.5);
    });

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `Top-${d}`))
      .call(gg => gg.select('.domain').attr('stroke', 'rgba(255,255,255,0.2)'))
      .call(gg => gg.selectAll('text').attr('fill', 'rgba(255,255,255,0.55)').attr('font-size', 10).attr('dy', 12));

    g.append('g')
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d}%`))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('text').attr('fill', 'rgba(255,255,255,0.55)').attr('font-size', 10));

    g.append('text').attr('transform', 'rotate(-90)').attr('x', -h/2).attr('y', -42)
      .attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', 10).text('Accuracy (%)');
  }, []);

  useEffect(() => {
    const targets = [1538, 314, 12, 4];
    const duration = 1600;
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setCounts(targets.map(v => Math.round(v * ease)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (statColRef.current) observer.observe(statColRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.in-view { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.1 }
    );

    document.querySelectorAll('.stat-card').forEach(el => {
      (el as HTMLElement).style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity 0.5s ease,transform 0.5s ease;';
      observer.observe(el);
    });
    document.querySelectorAll('.stat-column').forEach(group => {
      [...group.children].forEach((child, i) => {
        (child as HTMLElement).style.transitionDelay = `${i * 80}ms`;
      });
    });

    return () => { observer.disconnect(); style.remove(); };
  }, []);

  return (
    <section id="findings" className="section-dark">
      <div className="container">
        <div className="section-header light">
          <span className="label">Current Study</span>
          <h2>Benchmarking VLM Reliability in Healthcare</h2>
          <p className="section-desc">We evaluate 12+ VLMs — open-source, closed-source, and medically-specialized — on nursing procedural recognition (NurViD) and surgical skill assessment (AIxSuture), spanning perception, procedural reasoning, and hallucination detection.</p>
        </div>
        <div className="findings-grid">
          <div className="stat-column" ref={statColRef}>
            <div className="stat-card">
              <div className="stat-number">{counts[0].toLocaleString()}</div>
              <div className="stat-label">nursing procedural videos (144 hours) across 51 procedure categories in the NurViD dataset</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{counts[1]}</div>
              <div className="stat-label">surgical suturing assessment videos (~26 hours) with expert OSATS skill ratings in AIxSuture</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{counts[2]}<span>+</span></div>
              <div className="stat-label">VLMs evaluated — open-source, proprietary frontier, and medically specialized models</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{counts[3]}</div>
              <div className="stat-label">evaluation tiers: from core perception and classification through clinical risk, hallucination, and real-world SHN deployment</div>
            </div>
          </div>
          <div className="chart-panel">
            <h3 className="chart-title">Top-1 Accuracy by Task — NurViD</h3>
            <p className="chart-subtitle">Procedure, action step, and joint classification across 3 models</p>
            <div id="bar-chart" ref={barChartRef}></div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot cyan-dot"></span>Gemini 3.5 Flash</span>
              <span className="legend-item"><span className="dot" style={{background:'#4080D0',borderRadius:'50%',display:'inline-block',width:10,height:10}}></span>Qwen 3.6 27B</span>
              <span className="legend-item"><span className="dot" style={{background:'#5590D8',borderRadius:'50%',display:'inline-block',width:10,height:10}}></span>Qwen 3.6 35B</span>
            </div>
          </div>
        </div>
        <div className="drift-panel">
          <h3 className="chart-title">Top-K Accuracy — Procedure Classification</h3>
          <p className="chart-subtitle">Cumulative accuracy at k=1–5 for procedure classification (1,122 clips)</p>
          <div id="line-chart" ref={lineChartRef}></div>
        </div>
      </div>
    </section>
  );
}
