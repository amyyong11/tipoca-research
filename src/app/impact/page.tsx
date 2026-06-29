"use client";
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function ImpactPage() {
  const networkRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `.in-view { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.1 }
    );

    document.querySelectorAll('.timeline-item').forEach(el => {
      (el as HTMLElement).style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity 0.5s ease,transform 0.5s ease;';
      observer.observe(el);
    });

    return () => { observer.disconnect(); style.remove(); };
  }, []);

  return (
    <>
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
    </>
  );
}
