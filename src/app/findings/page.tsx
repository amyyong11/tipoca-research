"use client";
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function FindingsPage() {
  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);

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
      .attr('r', 4).attr('fill', '#5BC8E8').attr('stroke', '#4080D0').attr('stroke-width', 2)
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
          <p className="section-desc">Evaluating multimodal vision-language models on procedural clinical video understanding — from nursing procedures to surgical skill assessment — across core capability and procedural reasoning tasks.</p>
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
              <div className="stat-label">VLMs evaluated — open-source, proprietary frontier, and medically specialized models</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2</div>
              <div className="stat-label">evaluation tiers: core capability tasks and higher-level procedural reasoning assessments</div>
            </div>
          </div>
          <div className="chart-panel">
            <h3 className="chart-title">VLM Performance by Clinical Domain</h3>
            <p className="chart-subtitle">Benchmark accuracy vs. deployed performance across procedure categories</p>
            <div id="bar-chart" ref={barChartRef}></div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot navy-dot"></span>Benchmark</span>
              <span className="legend-item"><span className="dot cyan-dot"></span>Deployed</span>
            </div>
          </div>
        </div>
        <div className="drift-panel">
          <h3 className="chart-title">VLM Calibration Error Over Procedural Complexity</h3>
          <p className="chart-subtitle">Average AUC across models — illustrative benchmark target</p>
          <div id="line-chart" ref={lineChartRef}></div>
        </div>
      </div>
    </section>
  );
}
