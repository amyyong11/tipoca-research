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
      { domain: 'Sepsis',      benchmark: 0.89, deployed: 0.71 },
      { domain: 'Radiology',   benchmark: 0.93, deployed: 0.81 },
      { domain: 'Cardiology',  benchmark: 0.87, deployed: 0.68 },
      { domain: 'Oncology',    benchmark: 0.91, deployed: 0.74 },
      { domain: 'Readmission', benchmark: 0.83, deployed: 0.65 },
    ];

    const margin = { top: 10, right: 10, bottom: 40, left: 44 };
    const W = container.clientWidth || 480;
    const H = 220;
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('width', '100%');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand().domain(data.map(d => d.domain)).range([0, w]).padding(0.28);
    const x1 = d3.scaleBand().domain(['benchmark', 'deployed']).range([0, x0.bandwidth()]).padding(0.08);
    const y  = d3.scaleLinear().domain([0.5, 1]).range([h, 0]);

    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(4).tickSize(-w).tickFormat('' as never))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('line').attr('stroke', 'rgba(255,255,255,0.1)'));

    const groups = g.selectAll('.bar-group').data(data).enter().append('g')
      .attr('transform', d => `translate(${x0(d.domain)},0)`);

    groups.append('rect')
      .attr('x', x1('benchmark')!)
      .attr('width', x1.bandwidth())
      .attr('y', h).attr('height', 0)
      .attr('fill', 'rgba(255,255,255,0.8)').attr('rx', 3)
      .transition().duration(800).delay((_, i) => i * 80)
      .attr('y', d => y(d.benchmark))
      .attr('height', d => h - y(d.benchmark));

    groups.append('rect')
      .attr('x', x1('deployed')!)
      .attr('width', x1.bandwidth())
      .attr('y', h).attr('height', 0)
      .attr('fill', '#5BC8E8').attr('rx', 3)
      .transition().duration(800).delay((_, i) => i * 80 + 100)
      .attr('y', d => y(d.deployed))
      .attr('height', d => h - y(d.deployed));

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .call(gg => gg.select('.domain').attr('stroke', 'rgba(255,255,255,0.2)'))
      .call(gg => gg.selectAll('text').attr('fill', 'rgba(255,255,255,0.6)').attr('font-size', '11'));

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('.0%')))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('text').attr('fill', 'rgba(255,255,255,0.6)').attr('font-size', '10'));
  }, []);

  // Line chart
  useEffect(() => {
    const container = lineChartRef.current;
    if (!container) return;
    d3.select(container).selectAll('*').remove();

    const months = ['Jan 23','Apr 23','Jul 23','Oct 23','Jan 24','Apr 24','Jul 24','Oct 24','Jan 25','Apr 25'];
    const data = [
      { m: 0, auc: 0.88 }, { m: 1, auc: 0.87 }, { m: 2, auc: 0.86 },
      { m: 3, auc: 0.84 }, { m: 4, auc: 0.82 }, { m: 5, auc: 0.79 },
      { m: 6, auc: 0.76 }, { m: 7, auc: 0.74 }, { m: 8, auc: 0.72 }, { m: 9, auc: 0.70 },
    ];

    const margin = { top: 16, right: 24, bottom: 48, left: 52 };
    const W = container.clientWidth || 760;
    const H = 220;
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('width', '100%');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 9]).range([0, w]);
    const y = d3.scaleLinear().domain([0.60, 0.95]).range([h, 0]);

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat('' as never))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('line').attr('stroke', 'rgba(255,255,255,0.08)'));

    g.append('rect')
      .attr('x', 0).attr('y', y(0.75)).attr('width', w).attr('height', h - y(0.75))
      .attr('fill', 'rgba(255,80,80,0.06)');

    g.append('line')
      .attr('x1', 0).attr('x2', w).attr('y1', y(0.75)).attr('y2', y(0.75))
      .attr('stroke', 'rgba(255,120,120,0.4)').attr('stroke-dasharray', '5 4').attr('stroke-width', 1.5);

    g.append('text')
      .attr('x', w - 4).attr('y', y(0.75) - 5)
      .attr('fill', 'rgba(255,150,150,0.7)').attr('text-anchor', 'end').attr('font-size', 10)
      .text('Concern threshold (AUC < 0.75)');

    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', 'areaGrad')
      .attr('x1','0').attr('x2','0').attr('y1','0').attr('y2','1');
    grad.append('stop').attr('offset','0%').attr('stop-color','#5BC8E8').attr('stop-opacity',0.3);
    grad.append('stop').attr('offset','100%').attr('stop-color','#5BC8E8').attr('stop-opacity',0.02);

    type Datum = { m: number; auc: number };
    const area = d3.area<Datum>().x(d => x(d.m)).y0(h).y1(d => y(d.auc)).curve(d3.curveCatmullRom);
    const line = d3.line<Datum>().x(d => x(d.m)).y(d => y(d.auc)).curve(d3.curveCatmullRom);

    g.append('path').datum(data).attr('d', area).attr('fill', 'url(#areaGrad)');

    const path = g.append('path').datum(data).attr('d', line)
      .attr('fill', 'none').attr('stroke', '#5BC8E8').attr('stroke-width', 2.5);

    const totalLen = (path.node() as SVGPathElement).getTotalLength();
    path.attr('stroke-dasharray', totalLen).attr('stroke-dashoffset', totalLen)
      .transition().duration(1800).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0);

    const tip = d3.select('body').append('div')
      .attr('class', 'd3-tooltip').style('opacity', 0).style('position', 'absolute');

    g.selectAll<SVGCircleElement, Datum>('circle').data(data).enter().append('circle')
      .attr('cx', d => x(d.m)).attr('cy', d => y(d.auc))
      .attr('r', 4).attr('fill', '#5BC8E8').attr('stroke', '#1B2D6B').attr('stroke-width', 2)
      .on('mouseover', (event, d) => {
        tip.transition().duration(150).style('opacity', 1);
        tip.html(`<strong>${months[d.m]}</strong><br/>AUC: ${d.auc.toFixed(2)}`)
          .style('left', (event.pageX + 12) + 'px')
          .style('top',  (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => tip.transition().duration(200).style('opacity', 0));

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(9).tickFormat(i => months[i as number]))
      .call(gg => gg.select('.domain').attr('stroke', 'rgba(255,255,255,0.2)'))
      .call(gg => gg.selectAll('text').attr('fill', 'rgba(255,255,255,0.55)').attr('font-size', 10).attr('dy', 12));

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2f')))
      .call(gg => gg.select('.domain').remove())
      .call(gg => gg.selectAll('text').attr('fill', 'rgba(255,255,255,0.55)').attr('font-size', 10));

    g.append('text').attr('transform', 'rotate(-90)').attr('x', -h/2).attr('y', -42)
      .attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', 10).text('AUC-ROC');

    return () => { tip.remove(); };
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
        .attr('fill', r === 1 ? 'rgba(27,45,107,0.05)' : 'none')
        .attr('stroke', 'rgba(27,45,107,0.15)').attr('stroke-width', 1);
    });

    d3.range(N).forEach(i => {
      const [x2, y2] = coords(1, i);
      svg.append('line')
        .attr('x1', cx).attr('y1', cy).attr('x2', x2).attr('y2', y2)
        .attr('stroke', 'rgba(27,45,107,0.2)').attr('stroke-width', 1);
    });

    const defs = svg.append('defs');
    const radarGrad = defs.append('radialGradient').attr('id', 'radarGrad');
    radarGrad.append('stop').attr('offset', '0%').attr('stop-color', '#5BC8E8').attr('stop-opacity', 0.45);
    radarGrad.append('stop').attr('offset', '100%').attr('stop-color', '#1B2D6B').attr('stop-opacity', 0.15);

    svg.append('polygon')
      .attr('points', pillars.map((d, i) => coords(d.value, i).join(',')).join(' '))
      .attr('fill', 'url(#radarGrad)').attr('stroke', '#5BC8E8')
      .attr('stroke-width', 2.5).attr('stroke-linejoin', 'round');

    pillars.forEach((d, i) => {
      const [px, py] = coords(d.value, i);
      svg.append('circle').attr('cx', px).attr('cy', py).attr('r', 6)
        .attr('fill', '#5BC8E8').attr('stroke', '#1B2D6B').attr('stroke-width', 2);

      const [lx, ly] = coords(1.22, i);
      const textEl = svg.append('text')
        .attr('x', lx).attr('y', ly)
        .attr('text-anchor', lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 12).attr('font-weight', 700).attr('fill', '#1B2D6B');
      d.axis.split('\n').forEach((line, li) => {
        textEl.append('tspan').attr('x', lx).attr('dy', li === 0 ? 0 : 14).text(line);
      });

      const [vx, vy] = coords(d.value - 0.13, i);
      svg.append('text')
        .attr('x', vx).attr('y', vy)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('font-size', 10).attr('font-weight', 600).attr('fill', '#1B2D6B')
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

    const colors = ['#1B2D6B', '#5BC8E8', '#2D5A9E'];
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
      .attr('stroke', 'rgba(27,45,107,0.18)').attr('stroke-width', 1.5);

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
      .attr('stroke', d => d.group === 0 ? '#5BC8E8' : d.group === 1 ? '#1B2D6B' : '#8DDAF0')
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
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('font-size', d => d.size > 16 ? 10 : 8.5)
      .attr('font-weight', 700)
      .attr('fill', d => d.group === 1 ? '#1B2D6B' : '#FFFFFF')
      .attr('pointer-events', 'none')
      .each(function(d) {
        const words = d.id.split(' / ');
        if (words.length > 1) {
          d3.select(this).append('tspan').attr('x', 0).attr('dy', '-0.5em').text(words[0]);
          d3.select(this).append('tspan').attr('x', 0).attr('dy', '1.1em').text(words[1]);
        } else {
          d3.select(this).text(d.id);
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
          <h1>Operationalizing<br /><span className="accent">AI in Healthcare</span></h1>
          <p className="hero-sub">TIPOCA conducts rigorous supporting research to bridge the gap between cutting-edge machine learning and safe, equitable clinical deployment.</p>
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

      {/* KEY FINDINGS */}
      <section id="findings" className="section-dark">
        <div className="container">
          <div className="section-header light">
            <span className="label">Key Findings</span>
            <h2>What the Research Reveals</h2>
            <p className="section-desc">Across five clinical domains and three years of study, we identified consistent patterns in where AI succeeds and where it struggles in real hospital environments.</p>
          </div>
          <div className="findings-grid">
            <div className="stat-column">
              <div className="stat-card">
                <div className="stat-number">73<span>%</span></div>
                <div className="stat-label">of AI systems showed significant performance degradation within 18 months of deployment due to data drift</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">4.2<span>×</span></div>
                <div className="stat-label">greater disparity in model accuracy across racial subgroups compared to aggregate benchmark scores</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">61<span>%</span></div>
                <div className="stat-label">reduction in clinical adoption when AI outputs lacked explainability features trusted by clinicians</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">2.1<span>×</span></div>
                <div className="stat-label">higher patient safety event rate when AI alerts fired without human-in-the-loop review protocols</div>
              </div>
            </div>
            <div className="chart-panel">
              <h3 className="chart-title">Model Performance by Clinical Domain</h3>
              <p className="chart-subtitle">Benchmark accuracy vs. real-world deployment accuracy</p>
              <div id="bar-chart" ref={barChartRef}></div>
              <div className="chart-legend">
                <span className="legend-item"><span className="dot navy-dot"></span>Benchmark</span>
                <span className="legend-item"><span className="dot cyan-dot"></span>Deployed</span>
              </div>
            </div>
          </div>
          <div className="drift-panel">
            <h3 className="chart-title">Model Accuracy Drift Over Time</h3>
            <p className="chart-subtitle">Average AUC across 12 deployed models, 6-month rolling window</p>
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
                <p>Direct measurement of patient safety metrics, care quality, and experience — not proxy metrics.</p>
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
            <span className="label">Real-World Impact</span>
            <h2>Evidence from the Field</h2>
            <p className="section-desc">Partner institutions applying the TIPOCA framework show measurable improvements in safe AI integration outcomes.</p>
          </div>
          <div className="impact-timeline" id="impact-timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-year">2022</div>
              <div className="timeline-content">
                <h4>Sepsis Early Warning Study</h4>
                <p>Partnered with 3 hospital systems to evaluate sepsis prediction models. Identified 3 models with critical subgroup failures not visible in aggregate metrics.</p>
                <div className="timeline-tags"><span>Safety</span><span>Sepsis</span><span>Subgroup Analysis</span></div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-year">2023</div>
              <div className="timeline-content">
                <h4>Radiology AI Deployment Audit</h4>
                <p>Audited 8 radiology AI deployments across chest X-ray interpretation. Developed the first standardized radiology AI performance monitoring protocol.</p>
                <div className="timeline-tags"><span>Radiology</span><span>Monitoring</span><span>Standards</span></div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-year">2024</div>
              <div className="timeline-content">
                <h4>Equity-Centered Evaluation Toolkit</h4>
                <p>Released open-source toolkit for detecting and quantifying healthcare AI disparities, adopted by 47 institutions in year one.</p>
                <div className="timeline-tags"><span>Equity</span><span>Open Source</span><span>Toolkit</span></div>
              </div>
            </div>
            <div className="timeline-item active">
              <div className="timeline-dot"></div>
              <div className="timeline-year">2025–</div>
              <div className="timeline-content">
                <h4>National AI Monitoring Consortium</h4>
                <p>Leading a multi-site consortium to establish shared post-deployment surveillance infrastructure for clinical AI across 20+ health systems.</p>
                <div className="timeline-tags"><span>Ongoing</span><span>Consortium</span><span>Surveillance</span></div>
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
              <div className="team-avatar" style={{ background: '#5BC8E8' }}>SK</div>
              <h4>Dr. Sarah Kim</h4>
              <p className="team-role">Principal Investigator</p>
              <p className="team-focus">Clinical AI safety, post-deployment surveillance</p>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#1B2D6B' }}>MP</div>
              <h4>Dr. Marcus Patel</h4>
              <p className="team-role">Co-Investigator</p>
              <p className="team-focus">ML fairness, subgroup evaluation methodology</p>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#5BC8E8' }}>LN</div>
              <h4>Dr. Linh Nguyen</h4>
              <p className="team-role">Clinical Lead</p>
              <p className="team-focus">Emergency medicine, sepsis prediction systems</p>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#1B2D6B' }}>JR</div>
              <h4>Jordan Reyes, PhD</h4>
              <p className="team-role">Research Scientist</p>
              <p className="team-focus">NLP, clinical notes, LLM evaluation</p>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#5BC8E8' }}>AT</div>
              <h4>Aisha Thompson</h4>
              <p className="team-role">Research Engineer</p>
              <p className="team-focus">Monitoring infrastructure, open-source tooling</p>
            </div>
            <div className="team-card">
              <div className="team-avatar" style={{ background: '#1B2D6B' }}>CF</div>
              <h4>Dr. Carlos Fuentes</h4>
              <p className="team-role">Health Policy Advisor</p>
              <p className="team-focus">Regulatory frameworks, FDA AI/ML guidance</p>
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
              { year: 2025, title: 'Post-Deployment Surveillance of Clinical AI: A Multi-Site Framework', authors: 'Kim S, Patel M, Nguyen L, et al.', venue: 'Nature Medicine · 2025', tags: ['Monitoring', 'Safety'] },
              { year: 2024, title: 'Measuring Racial Disparities in Deployed Sepsis Prediction Models', authors: 'Patel M, Thompson A, Kim S.', venue: 'NEJM AI · 2024', tags: ['Equity', 'Sepsis'] },
              { year: 2024, title: 'Alert Fatigue in AI-Augmented Clinical Workflows: A Systematic Review', authors: 'Nguyen L, Reyes J, Kim S.', venue: 'JAMIA · 2024', tags: ['Workflow', 'Adoption'] },
              { year: 2023, title: 'Temporal Stability of Radiology AI: Lessons from an 8-Site Audit', authors: 'Kim S, Fuentes C, Patel M, et al.', venue: 'Radiology: Artificial Intelligence · 2023', tags: ['Radiology', 'Drift'] },
              { year: 2023, title: 'The TIPOCA Framework: Five Pillars for Operationalizing Healthcare AI', authors: 'Kim S, Patel M, Nguyen L, Reyes J, Thompson A, Fuentes C.', venue: 'The Lancet Digital Health · 2023', tags: ['Framework', 'Policy'] },
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
