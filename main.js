/* ============================================================
   TIPOCA — D3.js Visualizations + UI Interactions
   ============================================================ */

// ── Navbar scroll effect ────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile nav toggle ───────────────────────────────────────
document.getElementById('nav-toggle').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('open');
});

// ── Tooltip helper ──────────────────────────────────────────
function createTooltip() {
  return d3.select('body')
    .append('div')
    .attr('class', 'd3-tooltip')
    .style('opacity', 0)
    .style('position', 'absolute');
}

// ============================================================
// 1. HERO ANIMATED NETWORK BACKGROUND
// ============================================================
(function heroNetwork() {
  const svg = d3.select('#hero-network');
  const W = window.innerWidth, H = window.innerHeight;
  svg.attr('viewBox', `0 0 ${W} ${H}`);

  const N = 60;
  const nodes = d3.range(N).map(i => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 3 + 1.5,
  }));

  const lineGroup = svg.append('g');
  const nodeGroup = svg.append('g');

  const links = lineGroup.selectAll('line').data([]);
  const circles = nodeGroup.selectAll('circle')
    .data(nodes).enter().append('circle')
    .attr('r', d => d.r)
    .attr('fill', (_, i) => i % 5 === 0 ? '#5BC8E8' : 'rgba(255,255,255,0.5)');

  function tick() {
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    circles.attr('cx', d => d.x).attr('cy', d => d.y);

    const connected = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) connected.push({ s: nodes[i], t: nodes[j], d: dist });
      }
    }

    const lines = lineGroup.selectAll('line').data(connected);
    lines.enter().append('line').merge(lines)
      .attr('x1', d => d.s.x).attr('y1', d => d.s.y)
      .attr('x2', d => d.t.x).attr('y2', d => d.t.y)
      .attr('stroke', 'rgba(91,200,232,0.35)')
      .attr('stroke-width', d => 1.2 - d.d / 120);
    lines.exit().remove();
  }

  d3.timer(tick);
})();

// ============================================================
// 2. BAR CHART — Benchmark vs Deployed Accuracy
// ============================================================
(function barChart() {
  const data = [
    { domain: 'Sepsis',      benchmark: 0.89, deployed: 0.71 },
    { domain: 'Radiology',   benchmark: 0.93, deployed: 0.81 },
    { domain: 'Cardiology',  benchmark: 0.87, deployed: 0.68 },
    { domain: 'Oncology',    benchmark: 0.91, deployed: 0.74 },
    { domain: 'Readmission', benchmark: 0.83, deployed: 0.65 },
  ];

  const container = document.getElementById('bar-chart');
  const margin = { top: 10, right: 10, bottom: 40, left: 44 };
  const W = container.clientWidth  || 480;
  const H = 220;
  const w = W - margin.left - margin.right;
  const h = H - margin.top  - margin.bottom;

  const svg = d3.select('#bar-chart')
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x0 = d3.scaleBand().domain(data.map(d => d.domain)).range([0, w]).padding(0.28);
  const x1 = d3.scaleBand().domain(['benchmark','deployed']).range([0, x0.bandwidth()]).padding(0.08);
  const y  = d3.scaleLinear().domain([0.5, 1]).range([h, 0]);

  // Grid lines
  g.append('g').attr('class', 'grid')
    .call(d3.axisLeft(y).ticks(4).tickSize(-w).tickFormat(''))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('line').attr('stroke', 'rgba(255,255,255,0.1)'));

  // Bars
  const groups = g.selectAll('.bar-group').data(data).enter().append('g')
    .attr('transform', d => `translate(${x0(d.domain)},0)`);

  groups.append('rect')
    .attr('x', x1('benchmark'))
    .attr('width', x1.bandwidth())
    .attr('y', h)
    .attr('height', 0)
    .attr('fill', 'rgba(255,255,255,0.8)')
    .attr('rx', 3)
    .transition().duration(800).delay((_, i) => i * 80)
    .attr('y', d => y(d.benchmark))
    .attr('height', d => h - y(d.benchmark));

  groups.append('rect')
    .attr('x', x1('deployed'))
    .attr('width', x1.bandwidth())
    .attr('y', h)
    .attr('height', 0)
    .attr('fill', '#5BC8E8')
    .attr('rx', 3)
    .transition().duration(800).delay((_, i) => i * 80 + 100)
    .attr('y', d => y(d.deployed))
    .attr('height', d => h - y(d.deployed));

  // Axes
  g.append('g').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x0).tickSize(0))
    .call(g => g.select('.domain').attr('stroke', 'rgba(255,255,255,0.2)'))
    .call(g => g.selectAll('text').attr('fill', 'rgba(255,255,255,0.6)').attr('font-size', '11'));

  g.append('g')
    .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('.0%')))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text').attr('fill', 'rgba(255,255,255,0.6)').attr('font-size', '10'));
})();

// ============================================================
// 3. LINE CHART — Accuracy Drift Over Time
// ============================================================
(function lineChart() {
  const months = ['Jan 23','Apr 23','Jul 23','Oct 23','Jan 24','Apr 24','Jul 24','Oct 24','Jan 25','Apr 25'];
  const data = [
    { m: 0, auc: 0.88 }, { m: 1, auc: 0.87 }, { m: 2, auc: 0.86 },
    { m: 3, auc: 0.84 }, { m: 4, auc: 0.82 }, { m: 5, auc: 0.79 },
    { m: 6, auc: 0.76 }, { m: 7, auc: 0.74 }, { m: 8, auc: 0.72 }, { m: 9, auc: 0.70 },
  ];

  const container = document.getElementById('line-chart');
  const margin = { top: 16, right: 24, bottom: 48, left: 52 };
  const W = container.clientWidth  || 760;
  const H = 220;
  const w = W - margin.left - margin.right;
  const h = H - margin.top  - margin.bottom;

  const svg = d3.select('#line-chart')
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%');

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 9]).range([0, w]);
  const y = d3.scaleLinear().domain([0.60, 0.95]).range([h, 0]);

  // Grid
  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(''))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('line').attr('stroke', 'rgba(255,255,255,0.08)'));

  // Danger zone shading
  g.append('rect')
    .attr('x', 0).attr('y', y(0.75)).attr('width', w).attr('height', h - y(0.75))
    .attr('fill', 'rgba(255,80,80,0.06)');

  g.append('line')
    .attr('x1', 0).attr('x2', w)
    .attr('y1', y(0.75)).attr('y2', y(0.75))
    .attr('stroke', 'rgba(255,120,120,0.4)')
    .attr('stroke-dasharray', '5 4')
    .attr('stroke-width', 1.5);

  g.append('text')
    .attr('x', w - 4).attr('y', y(0.75) - 5)
    .attr('fill', 'rgba(255,150,150,0.7)')
    .attr('text-anchor', 'end')
    .attr('font-size', 10)
    .text('Concern threshold (AUC < 0.75)');

  // Gradient area fill
  const defs = svg.append('defs');
  const grad = defs.append('linearGradient').attr('id', 'areaGrad').attr('x1','0').attr('x2','0').attr('y1','0').attr('y2','1');
  grad.append('stop').attr('offset','0%').attr('stop-color','#5BC8E8').attr('stop-opacity',0.3);
  grad.append('stop').attr('offset','100%').attr('stop-color','#5BC8E8').attr('stop-opacity',0.02);

  const area = d3.area().x(d => x(d.m)).y0(h).y1(d => y(d.auc)).curve(d3.curveCatmullRom);
  const line = d3.line().x(d => x(d.m)).y(d => y(d.auc)).curve(d3.curveCatmullRom);

  g.append('path').datum(data).attr('d', area).attr('fill', 'url(#areaGrad)');

  // Animated line
  const path = g.append('path').datum(data).attr('d', line)
    .attr('fill', 'none').attr('stroke', '#5BC8E8').attr('stroke-width', 2.5);

  const totalLen = path.node().getTotalLength();
  path.attr('stroke-dasharray', totalLen).attr('stroke-dashoffset', totalLen)
    .transition().duration(1800).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0);

  // Points
  const tip = createTooltip();
  g.selectAll('circle').data(data).enter().append('circle')
    .attr('cx', d => x(d.m)).attr('cy', d => y(d.auc))
    .attr('r', 4).attr('fill', '#5BC8E8').attr('stroke', '#1B2D6B').attr('stroke-width', 2)
    .on('mouseover', (event, d) => {
      tip.transition().duration(150).style('opacity', 1);
      tip.html(`<strong>${months[d.m]}</strong><br/>AUC: ${d.auc.toFixed(2)}`)
        .style('left', (event.pageX + 12) + 'px')
        .style('top',  (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => tip.transition().duration(200).style('opacity', 0));

  // Axes
  g.append('g').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(9).tickFormat(i => months[i]))
    .call(g => g.select('.domain').attr('stroke', 'rgba(255,255,255,0.2)'))
    .call(g => g.selectAll('text').attr('fill', 'rgba(255,255,255,0.55)').attr('font-size', 10).attr('dy', 12));

  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2f')))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text').attr('fill', 'rgba(255,255,255,0.55)').attr('font-size', 10));

  g.append('text').attr('transform', 'rotate(-90)').attr('x', -h/2).attr('y', -42)
    .attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', 10).text('AUC-ROC');
})();

// ============================================================
// 4. RADAR CHART — TIPOCA Framework Pillars
// ============================================================
(function radarChart() {
  const pillars = [
    { axis: 'Technical Validity',   value: 0.85 },
    { axis: 'Implementation',       value: 0.78 },
    { axis: 'Patient Outcomes',     value: 0.72 },
    { axis: 'Operational\nContinuity', value: 0.80 },
    { axis: 'Clinician Adoption',   value: 0.68 },
  ];

  const N = pillars.length;
  const W = 500, H = 440;
  const cx = W / 2, cy = H / 2 + 10;
  const R = 155;

  const svg = d3.select('#radar-chart')
    .attr('viewBox', `0 0 ${W} ${H}`);

  const angleSlice = (2 * Math.PI) / N;
  const rScale = d3.scaleLinear().domain([0, 1]).range([0, R]);

  const coords = (val, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    return [cx + rScale(val) * Math.cos(angle), cy + rScale(val) * Math.sin(angle)];
  };

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach(r => {
    const pts = d3.range(N).map(i => coords(r, i));
    svg.append('polygon')
      .attr('points', pts.map(p => p.join(',')).join(' '))
      .attr('fill', r === 1 ? 'rgba(27,45,107,0.05)' : 'none')
      .attr('stroke', 'rgba(27,45,107,0.15)')
      .attr('stroke-width', 1);
  });

  // Spokes
  d3.range(N).forEach(i => {
    const [x2, y2] = coords(1, i);
    svg.append('line')
      .attr('x1', cx).attr('y1', cy)
      .attr('x2', x2).attr('y2', y2)
      .attr('stroke', 'rgba(27,45,107,0.2)').attr('stroke-width', 1);
  });

  // Filled polygon
  const polyPoints = pillars.map((d, i) => coords(d.value, i));

  const defs = svg.append('defs');
  const radarGrad = defs.append('radialGradient').attr('id', 'radarGrad');
  radarGrad.append('stop').attr('offset', '0%').attr('stop-color', '#5BC8E8').attr('stop-opacity', 0.45);
  radarGrad.append('stop').attr('offset', '100%').attr('stop-color', '#1B2D6B').attr('stop-opacity', 0.15);

  svg.append('polygon')
    .attr('points', polyPoints.map(p => p.join(',')).join(' '))
    .attr('fill', 'url(#radarGrad)')
    .attr('stroke', '#5BC8E8')
    .attr('stroke-width', 2.5)
    .attr('stroke-linejoin', 'round');

  // Points
  pillars.forEach((d, i) => {
    const [px, py] = coords(d.value, i);
    svg.append('circle').attr('cx', px).attr('cy', py).attr('r', 6)
      .attr('fill', '#5BC8E8').attr('stroke', '#1B2D6B').attr('stroke-width', 2);
  });

  // Labels
  pillars.forEach((d, i) => {
    const [lx, ly] = coords(1.22, i);
    const lines = d.axis.split('\n');
    const textEl = svg.append('text')
      .attr('x', lx).attr('y', ly)
      .attr('text-anchor', lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 12)
      .attr('font-weight', 700)
      .attr('fill', '#1B2D6B');

    lines.forEach((line, li) => {
      textEl.append('tspan')
        .attr('x', lx)
        .attr('dy', li === 0 ? 0 : 14)
        .text(line);
    });

    // Value label
    const [vx, vy] = coords(d.value - 0.13, i);
    svg.append('text')
      .attr('x', vx).attr('y', vy)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('font-size', 10).attr('font-weight', 600).attr('fill', '#1B2D6B')
      .text(`${Math.round(d.value * 100)}%`);
  });
})();

// ============================================================
// 5. FORCE-DIRECTED NETWORK — Research Domain Graph
// ============================================================
(function networkChart() {
  const nodes = [
    { id: 'ML / AI',           group: 0, size: 22 },
    { id: 'Clinical Safety',   group: 1, size: 18 },
    { id: 'Health Equity',     group: 1, size: 16 },
    { id: 'EHR Integration',   group: 2, size: 14 },
    { id: 'Model Monitoring',  group: 0, size: 16 },
    { id: 'Explainability',    group: 0, size: 14 },
    { id: 'Regulatory',        group: 2, size: 13 },
    { id: 'Alert Fatigue',     group: 2, size: 12 },
    { id: 'Data Drift',        group: 0, size: 13 },
    { id: 'Patient Trust',     group: 1, size: 12 },
    { id: 'Clinician UX',      group: 2, size: 13 },
    { id: 'Bias Detection',    group: 1, size: 14 },
    { id: 'Workflow Design',   group: 2, size: 12 },
    { id: 'Governance',        group: 2, size: 12 },
  ];

  const links = [
    { source: 'ML / AI',          target: 'Clinical Safety'  },
    { source: 'ML / AI',          target: 'Model Monitoring' },
    { source: 'ML / AI',          target: 'Explainability'   },
    { source: 'ML / AI',          target: 'Data Drift'       },
    { source: 'ML / AI',          target: 'Bias Detection'   },
    { source: 'Clinical Safety',  target: 'Alert Fatigue'    },
    { source: 'Clinical Safety',  target: 'Patient Trust'    },
    { source: 'Clinical Safety',  target: 'Regulatory'       },
    { source: 'Health Equity',    target: 'Bias Detection'   },
    { source: 'Health Equity',    target: 'Patient Trust'    },
    { source: 'Health Equity',    target: 'Data Drift'       },
    { source: 'EHR Integration',  target: 'Alert Fatigue'    },
    { source: 'EHR Integration',  target: 'Workflow Design'  },
    { source: 'EHR Integration',  target: 'Clinician UX'     },
    { source: 'Model Monitoring', target: 'Data Drift'       },
    { source: 'Model Monitoring', target: 'Governance'       },
    { source: 'Explainability',   target: 'Clinician UX'     },
    { source: 'Explainability',   target: 'Patient Trust'    },
    { source: 'Regulatory',       target: 'Governance'       },
    { source: 'Alert Fatigue',    target: 'Clinician UX'     },
    { source: 'Clinician UX',     target: 'Workflow Design'  },
    { source: 'Governance',       target: 'Regulatory'       },
  ];

  const colors = ['#1B2D6B', '#5BC8E8', '#2D5A9E'];
  const container = document.getElementById('network-chart');
  const W = container.clientWidth || 900;
  const H = 480;

  const svg = d3.select('#network-chart')
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%');

  const sim = d3.forceSimulation(nodes)
    .force('link',    d3.forceLink(links).id(d => d.id).distance(90).strength(0.7))
    .force('charge',  d3.forceManyBody().strength(-280))
    .force('center',  d3.forceCenter(W / 2, H / 2))
    .force('collide', d3.forceCollide().radius(d => d.size + 14));

  const link = svg.append('g').selectAll('line').data(links).enter().append('line')
    .attr('stroke', 'rgba(27,45,107,0.18)').attr('stroke-width', 1.5);

  const tip = createTooltip();

  const node = svg.append('g').selectAll('g').data(nodes).enter().append('g')
    .call(d3.drag()
      .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on('end',   (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

  node.append('circle')
    .attr('r', d => d.size)
    .attr('fill', d => colors[d.group])
    .attr('stroke', d => d.group === 0 ? '#5BC8E8' : d.group === 1 ? '#1B2D6B' : '#8DDAF0')
    .attr('stroke-width', 2)
    .style('cursor', 'grab')
    .on('mouseover', (event, d) => {
      tip.transition().duration(150).style('opacity', 1);
      tip.html(`<strong>${d.id}</strong>`)
        .style('left', (event.pageX + 12) + 'px')
        .style('top',  (event.pageY - 28) + 'px');
      d3.select(event.currentTarget).attr('stroke-width', 4);
    })
    .on('mouseout', (event) => {
      tip.transition().duration(200).style('opacity', 0);
      d3.select(event.currentTarget).attr('stroke-width', 2);
    });

  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
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
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
})();

// ============================================================
// 6. INTERSECTION OBSERVER — Animate sections on scroll
// ============================================================
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in-view');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.about-card, .stat-card, .pillar, .team-card, .pub-item, .timeline-item')
  .forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

document.addEventListener('animationend', () => {});

const styleSheet = document.createElement('style');
styleSheet.textContent = `.in-view { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(styleSheet);

// Stagger children
document.querySelectorAll('.about-grid, .stat-column, .team-grid').forEach(group => {
  [...group.children].forEach((child, i) => {
    child.style.transitionDelay = `${i * 80}ms`;
  });
});
