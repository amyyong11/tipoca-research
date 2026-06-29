"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { AntiGravityCanvas } from '@/components/ui/particle-effect-for-hero';

const BASE = process.env.NODE_ENV === 'production' ? '/tipoca-research' : '';

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<SVGSVGElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);

  // Navbar scroll effect
  useEffect(() => {
    const navbar = navRef.current;
    if (!navbar) return;
    const handleScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bar chart
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

  // Line chart
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

  // Radar chart
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

  // Force-directed network
  useEffect(() => {
    const container = networkRef.current;
    if (!container) return;
    d3.select(container).selectAll('*').remove();

    type NodeDatum = d3.SimulationNodeDatum & { id: string; group: number; size: number };
    type LinkDatum = d3.SimulationLinkDatum<NodeDatum> & { source: string; target: string };

    const nodes: NodeDatum[] = [
      { id: 'ML / AI',          group: 0, size: 22 },
      { id: 'Clinical Safety',  group: 1, size: 18 },
      { id: 'Health Equity',    group: 1, size: 16 },
      { id: 'EHR Integration',  group: 2, size: 14 },
      { id: 'Model Monitoring', group: 0, size: 16 },
      { id: 'Explainability',   group: 0, size: 14 },
      { id: 'Regulatory',       group: 2, size: 13 },
      { id: 'Alert Fatigue',    group: 2, size: 12 },
      { id: 'Data Drift',       group: 0, size: 13 },
      { id: 'Patient Trust',    group: 1, size: 12 },
      { id: 'Clinician UX',     group: 2, size: 13 },
      { id: 'Bias Detection',   group: 1, size: 14 },
      { id: 'Workflow Design',  group: 2, size: 12 },
      { id: 'Governance',       group: 2, size: 12 },
    ];

    const links: LinkDatum[] = [
      { source: 'ML / AI', target: 'Clinical Safety'  },
      { source: 'ML / AI', target: 'Model Monitoring' },
      { source: 'ML / AI', target: 'Explainability'   },
      { source: 'ML / AI', target: 'Data Drift'       },
      { source: 'ML / AI', target: 'Bias Detection'   },
      { source: 'Clinical Safety', target: 'Alert Fatigue'  },
      { source: 'Clinical Safety', target: 'Patient Trust'  },
      { source: 'Clinical Safety', target: 'Regulatory'     },
      { source: 'Health Equity',   target: 'Bias Detection' },
      { source: 'Health Equity',   target: 'Patient Trust'  },
      { source: 'Health Equity',   target: 'Data Drift'     },
      { source: 'EHR Integration', target: 'Alert Fatigue'  },
      { source: 'EHR Integration', target: 'Workflow Design'},
      { source: 'EHR Integration', target: 'Clinician UX'   },
      { source: 'Model Monitoring',target: 'Data Drift'     },
      { source: 'Model Monitoring',target: 'Governance'     },
      { source: 'Explainability',  target: 'Clinician UX'   },
      { source: 'Explainability',  target: 'Patient Trust'  },
      { source: 'Regulatory',      target: 'Governance'     },
      { source: 'Alert Fatigue',   target: 'Clinician UX'   },
      { source: 'Clinician UX',    target: 'Workflow Design'},
      { source: 'Governance',      target: 'Regulatory'     },
    ];

    const colors = ['#4080D0', '#5BC8E8', '#5590D8'];
    const W = container.clientWidth || 900;
    const H = 480;

    const svg = d3.select(container)
      .append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%');

    const sim = d3.forceSimulation<NodeDatum>(nodes)
      .force('link', d3.forceLink<NodeDatum, LinkDatum>(links).id(d => d.id).distance(90).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide<NodeDatum>().radius(d => d.size + 14));

    const link = svg.append('g').selectAll('line').data(links).enter().append('line')
      .attr('stroke', 'rgba(91,200,232,0.18)').attr('stroke-width', 1.5);

    const tip = d3.select('body').append('div')
      .attr('class', 'd3-tooltip').style('opacity', 0).style('position', 'absolute');

    const node = svg.append('g').selectAll<SVGGElement, NodeDatum>('g').data(nodes).enter().append('g')
      .call(d3.drag<SVGGElement, NodeDatum>()
        .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end',   (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => colors[d.group])
      .attr('stroke', d => d.group === 0 ? '#5BC8E8' : d.group === 1 ? '#4080D0' : '#8DDAF0')
      .attr('stroke-width', 2).style('cursor', 'grab')
      .on('mouseover', (event, d) => {
        tip.transition().duration(150).style('opacity', 1);
        tip.html(`<strong>${d.id}</strong>`)
          .style('left', (event.pageX + 12) + 'px')
          .style('top',  (event.pageY - 28) + 'px');
        d3.select(event.currentTarget as SVGCircleElement).attr('stroke-width', 4);
      })
      .on('mouseout', event => {
        tip.transition().duration(200).style('opacity', 0);
        d3.select(event.currentTarget as SVGCircleElement).attr('stroke-width', 2);
      });

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('y', d => d.size + 6)
      .attr('font-size', 10)
      .attr('font-weight', 600)
      .attr('fill', '#FFFFFF')
      .attr('pointer-events', 'none')
      .each(function(d) {
        const slashParts = d.id.split(' / ');
        const spaceParts = d.id.split(' ');
        if (slashParts.length > 1) {
          d3.select(this).append('tspan').attr('x', 0).attr('dy', 0).text(slashParts[0]);
          d3.select(this).append('tspan').attr('x', 0).attr('dy', '1.3em').text(slashParts[1]);
        } else if (spaceParts.length > 1) {
          const mid = Math.ceil(spaceParts.length / 2);
          d3.select(this).append('tspan').attr('x', 0).attr('dy', 0).text(spaceParts.slice(0, mid).join(' '));
          d3.select(this).append('tspan').attr('x', 0).attr('dy', '1.3em').text(spaceParts.slice(mid).join(' '));
        } else {
          d3.select(this).append('tspan').attr('x', 0).attr('dy', 0).text(d.id);
        }
      });

    sim.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeDatum).x!)
        .attr('y1', d => (d.source as NodeDatum).y!)
        .attr('x2', d => (d.target as NodeDatum).x!)
        .attr('y2', d => (d.target as NodeDatum).y!);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => { sim.stop(); tip.remove(); };
  }, []);

  // Scroll-in animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.in-view { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
    }, { threshold: 0.1 });

    document.querySelectorAll('.about-card, .stat-card, .pillar, .team-card, .pub-item, .timeline-item')
      .forEach(el => {
        (el as HTMLElement).style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity 0.5s ease,transform 0.5s ease;';
        observer.observe(el);
      });

    document.querySelectorAll('.about-grid, .stat-column, .team-grid').forEach(group => {
      [...group.children].forEach((child, i) => {
        (child as HTMLElement).style.transitionDelay = `${i * 80}ms`;
      });
    });

    return () => { observer.disconnect(); style.remove(); };
  }, []);

  return (
    <>
      {/* NAV */}
      <nav id="navbar" ref={navRef}>
        <div className="nav-inner">
          <a href="#hero" className="nav-logo">
            <img src={`${BASE}/images/logo-dark.png`} alt="TIPOCA" className="nav-logo-img" />
          </a>
          <button type="button" className="nav-toggle" onClick={() => setNavOpen(o => !o)} aria-label="Toggle menu">&#9776;</button>
          <ul className={`nav-links${navOpen ? ' open' : ''}`} id="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#findings">Findings</a></li>
            <li><a href="#framework">Framework</a></li>
            <li><a href="#impact">Impact</a></li>
            <li><a href="#team">Team</a></li>
            <li><a href="#publications">Publications</a></li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" style={{ position: 'relative' }}>
        <AntiGravityCanvas />
        <div className="hero-content" style={{ position: 'relative', zIndex: 10 }}>
          <img src={`${BASE}/images/logo-dark.png`} alt="TIPOCA" className="hero-logo" />
          <p className="hero-eyebrow">Research Initiative</p>
          <h1 className="hero-title-metallic">Operationalizing<br /><span className="accent">AI in Healthcare</span></h1>
          <p className="hero-sub">We audit vision-language models on clinical procedural video understanding - benchmarking performance, hallucination, and clinical risk across nursing procedures and surgical skill assessment to determine readiness for real-world deployment.</p>
          <div className="hero-cta">
            <a href="#findings" className="btn-primary">Explore Findings</a>
            <a href="#publications" className="btn-ghost">Publications</a>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>Scroll to explore</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section-light">
        <div className="container">
          <div className="section-header">
            <span className="label">About the Project</span>
            <h2>Why Supporting Research Matters</h2>
            <p className="section-desc">Deploying AI in clinical settings is not merely a technical problem. It demands rigorous evaluation of safety, fairness, workflow integration, and trust - the infrastructure that makes AI work <em>for</em> patients and clinicians.</p>
          </div>
          <div className="about-grid">
            <div className="about-card">
              <div className="card-icon navy"><svg viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 1 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg></div>
              <h3>Four-Tier Evaluation</h3>
              <p>We assess VLMs across perception and classification (Tier 1), procedural reasoning (Tier 2), clinical risk and hallucination (Tier 3), and real-world SHN deployment (Tier 4) - moving beyond simple accuracy benchmarks.</p>
            </div>
            <div className="about-card">
              <div className="card-icon cyan"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>
              <h3>12+ Models Compared</h3>
              <p>Open-source (Qwen3.6, InternVL), closed-source (Gemini, GPT), and medically-specialized models (LLaVA-Med, Med-Flamingo, MedVInT, RadFM) are evaluated under identical conditions.</p>
            </div>
            <div className="about-card">
              <div className="card-icon navy"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <h3>Hallucination &amp; Clinical Risk</h3>
              <p>We measure procedural, object, anatomical, and sequential hallucinations - and classify VLM errors by clinical risk level (critical, major, minor) to surface the failure modes most dangerous for patient safety.</p>
            </div>
            <div className="about-card">
              <div className="card-icon cyan"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
              <h3>Reusable Audit Framework</h3>
              <p>Rather than asking "which model is best?", our framework defines the capability gaps required for deployment - providing a reusable standard any developer can use to test their clinical VLM before release.</p>
            </div>
          </div>
        </div>
      </section>

      {/* KEY FINDINGS */}
      <section id="findings" className="section-dark">
        <div className="container">
          <div className="section-header light">
            <span className="label">Current Study</span>
            <h2>Benchmarking VLM Reliability in Healthcare</h2>
            <p className="section-desc">We evaluate 12+ VLMs - open-source, closed-source, and medically-specialized - on nursing procedural recognition (NurViD) and surgical skill assessment (AIxSuture), spanning perception, procedural reasoning, and hallucination detection.</p>
          </div>
          <div className="findings-grid">
            <div className="stat-column">
              <div className="stat-card">
                <div className="stat-number">1,538</div>
                <div className="stat-label">nursing procedural videos (144 hours) across 51 procedure categories in the NurViD dataset</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">314</div>
                <div className="stat-label">surgical suturing assessment videos (~26 hours) with expert OSATS skill ratings in AIxSuture</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">12<span>+</span></div>
                <div className="stat-label">VLMs evaluated - open-source, proprietary frontier, and medically specialized models</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">4</div>
                <div className="stat-label">evaluation tiers: from core perception and classification through clinical risk, hallucination, and real-world SHN deployment</div>
              </div>
            </div>
            <div className="chart-panel">
              <h3 className="chart-title">Top-1 Accuracy by Task - NurViD</h3>
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
            <h3 className="chart-title">Top-K Accuracy - Procedure Classification</h3>
            <p className="chart-subtitle">Cumulative accuracy at k=1–5 for procedure classification (1,122 clips)</p>
            <div id="line-chart" ref={lineChartRef}></div>
          </div>
        </div>
      </section>

      {/* FRAMEWORK */}
      <section id="framework" className="section-light">
        <div className="container">
          <div className="section-header">
            <span className="label">The TIPOCA Framework</span>
            <h2>A Five-Pillar Approach to AI Operationalization</h2>
            <p className="section-desc">Based on our findings, we developed a structured framework that healthcare organizations can use to evaluate, deploy, and monitor AI systems responsibly.</p>
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
                <h4>Implementation</h4>
                <div className="pillar-num">02</div>
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

      {/* IMPACT */}
      <section id="impact" className="section-dark">
        <div className="container">
          <div className="section-header light">
            <span className="label">Study Phases</span>
            <h2>Research Roadmap</h2>
            <p className="section-desc">The study is conducted in three phases, from dataset preparation and baseline benchmarking through to hallucination analysis and deployment readiness assessment.</p>
          </div>
          <div className="impact-timeline" id="impact-timeline">
            <div className="timeline-item active">
              <div className="timeline-dot"></div>
              <div className="timeline-year">Phase 1</div>
              <div className="timeline-content">
                <h4>Dataset Preparation &amp; Tier 1 Benchmarking</h4>
                <p>Preprocessing NurViD (1,538 nursing videos, 51 procedures, 177 action steps) and AIxSuture (314 suturing videos with OSATS ratings). Running Tier 1 core capability tasks - procedure identification, action step recognition, joint classification, and skill quality assessment - across all VLMs under identical conditions.</p>
                <div className="timeline-tags"><span>NurViD</span><span>AIxSuture</span><span>Core Capability</span></div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-year">Phase 2</div>
              <div className="timeline-content">
                <h4>Procedural Reasoning &amp; Hallucination Analysis</h4>
                <p>Tier 2 evaluates higher-order reasoning - temporal ordering of shuffled clips, missing action detection, and rubric-grounded surgical assessment. Tier 3 characterizes hallucination subtypes (procedural, object, anatomical, sequential) and classifies VLM errors by clinical risk level: critical, major, minor, or no error.</p>
                <div className="timeline-tags"><span>Procedural Reasoning</span><span>Hallucination</span><span>Clinical Risk</span></div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-year">Phase 3</div>
              <div className="timeline-content">
                <h4>Real-World Generalization at SHN</h4>
                <p>Collecting 20–30 videos from Scarborough Health Network's skills lab to evaluate all models on this out-of-distribution set. Quantifying the curated-vs-real performance gap to assess deployment readiness and identify where benchmark performance breaks down in authentic clinical environments.</p>
                <div className="timeline-tags"><span>SHN</span><span>Out-of-Distribution</span><span>Generalization</span></div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-year">Output</div>
              <div className="timeline-content">
                <h4>Open-Source Audit Framework &amp; Publications</h4>
                <p>A reusable evaluation codebase that any developer can use to test a clinical VLM before deployment - moving the field from "which model is best?" to "which capabilities are missing for real-world use?" Accompanied by peer-reviewed publications and open-access protocols.</p>
                <div className="timeline-tags"><span>Open Source</span><span>Audit Framework</span><span>Publication</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOMAIN NETWORK */}
      <section id="network-section" className="section-light">
        <div className="container">
          <div className="section-header">
            <span className="label">Research Connections</span>
            <h2>Interdisciplinary Knowledge Graph</h2>
            <p className="section-desc">Our work sits at the intersection of ML, clinical informatics, ethics, and health policy. Drag nodes to explore relationships.</p>
          </div>
          <div id="network-chart" ref={networkRef}></div>
        </div>
      </section>

      {/* TEAM */}
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

      {/* PUBLICATIONS */}
      <section id="publications" className="section-light">
        <div className="container">
          <div className="section-header">
            <span className="label">Publications</span>
            <h2>Selected Research Output</h2>
          </div>
          <div className="pub-list">
            {[
              { year: 2026, title: 'Benchmarking Vision-Language Models for Clinical Procedural Video Evaluation: Performance, Clinical Risk, and Hallucination in Nursing and Surgical Skill Assessment', authors: 'Grover S, Landy J, et al.', venue: 'Scarborough Health Network Research Institute · In Preparation', tags: ['VLM', 'Hallucination', 'Clinical Risk', 'NurViD', 'AIxSuture'] },
            ].map((pub, i) => (
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

      {/* FOOTER */}
      <footer>
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src={`${BASE}/images/logo-dark.png`} alt="TIPOCA" className="footer-logo-img" />
            <p>Operationalizing AI in Healthcare Research Initiative</p>
          </div>
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#findings">Findings</a>
            <a href="#framework">Framework</a>
            <a href="#publications">Publications</a>
          </div>
          <div className="footer-copy">
            <p>&copy; 2025 TIPOCA Research Lab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
