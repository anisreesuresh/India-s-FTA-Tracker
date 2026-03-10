// India FTA Tracker — Application Logic

let activeCharts = [];

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  buildTimeline();
});

function buildTimeline() {
  const container = document.getElementById('timeline');
  
  FTA_DATA.forEach(fta => {
    const btn = document.createElement('button');
    btn.className = 'fta-btn';
    btn.dataset.id = fta.id;
    
    const statusClass = fta.status === 'active' ? 'badge-active' : fta.status === 'pending' ? 'badge-pending' : 'badge-review';
    const statusLabel = fta.status === 'active' ? 'IN FORCE' : fta.status === 'pending' ? 'PENDING' : 'SUSPENDED';
    
    btn.innerHTML = `
      <div class="fta-dot"></div>
      <div class="fta-btn-info">
        <div class="fta-year">${fta.year}</div>
        <div class="fta-name">${fta.name}</div>
        <div class="fta-partner">${fta.partner}</div>
        <span class="fta-status-badge ${statusClass}">${statusLabel}</span>
      </div>
    `;
    
    btn.addEventListener('click', () => selectFTA(fta.id));
    container.appendChild(btn);
  });
}

function selectFTA(id) {
  // Update active button
  document.querySelectorAll('.fta-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-id="${id}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  
  // Hide placeholder
  document.getElementById('placeholder').style.display = 'none';
  
  // Destroy previous charts
  activeCharts.forEach(c => c.destroy());
  activeCharts = [];
  
  // Find FTA data
  const fta = FTA_DATA.find(f => f.id === id);
  if (!fta) return;
  
  // Render
  const container = document.getElementById('fta-content');
  container.innerHTML = renderFTADetail(fta);
  
  // Build charts after DOM is ready
  requestAnimationFrame(() => {
    buildExportsChart(fta);
    buildImportsChart(fta);
    buildTopGoodsChart(fta);
    buildUtilisationBar(fta);
  });
}

function renderFTADetail(fta) {
  const balClass = fta.balanceType === 'surplus' ? 'surplus' : 'deficit';
  const statusClass = fta.status === 'active' ? 'badge-active' : fta.status === 'pending' ? 'badge-pending' : 'badge-review';
  const statusLabel = fta.status === 'active' ? 'IN FORCE' : fta.status === 'pending' ? 'PENDING / RATIFICATION' : 'NEGOTIATIONS SUSPENDED';
  
  const tariffLinesHtml = fta.tariffLines ? `
    <div class="market-access-grid">
      <div class="ma-stat"><div class="mv">${fta.tariffLines.toLocaleString()}</div><div class="ml">Total Tariff Lines</div></div>
      <div class="ma-stat"><div class="mv">${fta.dutyFreeLines ? fta.dutyFreeLines.toLocaleString() : 'TBD'}</div><div class="ml">Zero-Duty Lines</div></div>
      <div class="ma-stat"><div class="mv">${fta.dutyFreePercent}</div><div class="ml">Coverage</div></div>
    </div>
  ` : `<p style="color:var(--white-dim);font-size:0.82rem;margin-top:0.5rem">Tariff schedule not yet finalised — negotiations ongoing.</p>`;

  const utilisationHtml = fta.utilisationRate !== null ? `
    <div class="util-section">
      <div class="section-title">FTA Utilisation Rate</div>
      <div class="util-rate-display">
        <div class="util-gauge">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,107,0,0.1)" stroke-width="10"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--saffron)" stroke-width="10"
              stroke-dasharray="${(fta.utilisationRate / 100) * 251.2} 251.2"
              stroke-linecap="round"/>
          </svg>
          <div class="util-gauge-text">
            <span class="util-pct">${fta.utilisationRate}%</span>
            <span class="util-label">UTILISED</span>
          </div>
        </div>
        <div class="util-breakdown">
          <div class="util-row">
            <span class="util-row-label">Dutiable imports using FTA scheme</span>
            <span class="util-row-val" style="color:var(--saffron)">$${fta.utilImportsFTA?.toLocaleString()}M</span>
          </div>
          <div class="util-row">
            <span class="util-row-label">Total eligible dutiable imports</span>
            <span class="util-row-val">$${fta.utilTotalEligible?.toLocaleString()}M</span>
          </div>
          <div class="util-row">
            <span class="util-row-label">Formula</span>
            <span class="util-row-val" style="font-size:0.65rem;color:var(--white-dim)">(FTA scheme / eligible) × 100</span>
          </div>
        </div>
      </div>
      <div class="util-note">${fta.utilisationNote}</div>
      <div style="height:180px;margin-top:1.25rem;position:relative">
        <canvas id="util-bar-chart"></canvas>
      </div>
    </div>
  ` : `
    <div class="util-section">
      <div class="section-title">FTA Utilisation Rate</div>
      <div class="util-note" style="margin-top:0">⚠ Utilisation rate not calculable — FTA not yet in force. ${fta.utilisationNote}</div>
    </div>
  `;

  return `
    <div class="fta-detail visible">
      <!-- HERO -->
      <div class="detail-hero">
        <div>
          <h2>${fta.fullName.replace(fta.partner, `<em>${fta.partner}</em>`)}</h2>
          <div class="detail-hero-meta">
            <span class="meta-pill">Type: ${fta.type}</span>
            <span class="meta-pill signed">Signed: ${fta.signed}</span>
            <span class="meta-pill effect">In Force: ${fta.effectiveYear ? fta.effectiveYear : 'TBD'}</span>
            <span class="fta-status-badge ${statusClass}" style="font-size:0.65rem;padding:4px 12px">${statusLabel}</span>
          </div>
        </div>
        <div class="balance-badge ${balClass}">
          <div class="bal-label">${fta.balanceType === 'surplus' ? '▲ SURPLUS' : fta.balanceType === 'deficit' ? '▼ DEFICIT' : '⟷ MIXED'}</div>
          <div class="bal-value">${fta.currentBalance}</div>
          <div class="bal-sub">${fta.balanceNote}</div>
        </div>
      </div>

      <!-- SUMMARY CARDS -->
      <div class="summary-grid">
        <div class="summary-card full">
          <div class="sc-label">Agreement Summary</div>
          <div class="sc-value">${fta.summary}</div>
        </div>
        <div class="summary-card">
          <div class="sc-label">Key Market Access Provisions</div>
          <div class="sc-value">${fta.keyProvisions}</div>
        </div>
        <div class="summary-card">
          <div class="sc-label">Tariff Coverage & Market Access</div>
          <div class="sc-value">
            <strong>${fta.coverageNote}</strong>
            ${tariffLinesHtml}
          </div>
        </div>
      </div>

      <!-- TRADE CHARTS -->
      <div class="section-title" style="margin-bottom:1rem">Trade Flow Analysis · 1991–2025</div>
      <div class="chart-grid">
        <div class="chart-card">
          <div class="chart-title">India Exports → ${fta.partner}</div>
          <div class="chart-subtitle">USD Million · FTA signature year marked</div>
          <div class="chart-container"><canvas id="exports-chart"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">India Imports ← ${fta.partner}</div>
          <div class="chart-subtitle">USD Million · FTA signature year marked</div>
          <div class="chart-container"><canvas id="imports-chart"></canvas></div>
        </div>
      </div>

      <!-- TOP GOODS CHART & TABLE -->
      <div class="section-title" style="margin-bottom:1rem">Top 5 Export Goods to ${fta.partner} · 2000–2025</div>
      <div class="chart-grid">
        <div class="chart-card">
          <div class="chart-title">Top Export Goods by Value</div>
          <div class="chart-subtitle">USD Million (2024 est.) · bar chart</div>
          <div class="chart-container"><canvas id="goods-chart"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">Tariff Rate Changes for Top Exports</div>
          <div class="chart-subtitle">Pre-FTA vs Post-FTA tariff applied by ${fta.partner}</div>
          <div style="overflow-x:auto">
            <table class="goods-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Value (2024)</th>
                  <th>Tariff Change</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                ${fta.topExports.map(g => `
                  <tr>
                    <td><span class="rank-num">${g.rank}</span></td>
                    <td>${g.product}</td>
                    <td style="font-family:'JetBrains Mono',monospace;font-size:0.78rem">$${g.value2024.toLocaleString()}M</td>
                    <td>
                      <div class="tariff-change">
                        <span class="tariff-before">${g.tariffBefore}</span>
                        <span class="tariff-arrow">→</span>
                        <span class="tariff-after">${g.tariffAfter}</span>
                      </div>
                    </td>
                    <td>
                      <span style="font-size:0.72rem;color:${g.growth === 'high' ? 'var(--surplus)' : g.growth === 'moderate' ? 'var(--gold)' : 'var(--deficit)'}">
                        ${g.growth === 'high' ? '▲ High' : g.growth === 'moderate' ? '◆ Moderate' : '▼ Low'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- UTILISATION -->
      ${utilisationHtml}

      <!-- DATA NOTE -->
      <div class="data-note">
        📊 <strong>Data Sources:</strong> Ministry of Commerce & Industry (DGFT), UN Comtrade, WTO RTA Database, respective partner government trade fact sheets, Reserve Bank of India, UNCTAD Trade Analysis Portal. 
        Trade values in USD million. FTA utilisation data from DGFT preference certificate issuance records and partner customs data. 
        Historical data (1991–2005) uses DGFT/UN Comtrade estimates; post-2005 data from DGFT annual reports.
        Tariff rates sourced from official FTA schedules and MFN applied tariff rates (WTO Tariff Profiles).
        ⚠ Note: All data is indicative and for analytical purposes. Please verify with official government sources for policy decisions.
      </div>
    </div>
  `;
}

// ─── CHART BUILDERS ───

function getChartYears(fta) {
  const exportYears = Object.keys(fta.exports).map(Number).sort((a, b) => a - b);
  return exportYears;
}

const CHART_DEFAULTS = {
  font: { family: "'Instrument Sans', sans-serif" },
  color: 'rgba(245,240,232,0.5)',
};

function buildExportsChart(fta) {
  const ctx = document.getElementById('exports-chart');
  if (!ctx) return;
  
  const years = getChartYears(fta);
  const values = years.map(y => fta.exports[y] || 0);
  const ftaYear = fta.signedYear;
  
  const annotations = {};
  if (ftaYear && years.includes(ftaYear)) {
    annotations.ftaLine = {
      type: 'line',
      xMin: ftaYear.toString(),
      xMax: ftaYear.toString(),
      borderColor: 'rgba(255,107,0,0.8)',
      borderWidth: 2,
      borderDash: [4, 4],
      label: {
        content: `FTA Signed ${ftaYear}`,
        enabled: true,
        color: '#FF6B00',
        backgroundColor: 'rgba(10,14,26,0.9)',
        font: { size: 10, family: "'JetBrains Mono', monospace" },
        position: 'start',
        yAdjust: -10,
      }
    };
  }

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years.map(String),
      datasets: [{
        label: 'Exports (USD M)',
        data: values,
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34,197,94,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(22,29,46,0.95)',
          titleColor: '#FF6B00',
          bodyColor: 'rgba(245,240,232,0.8)',
          borderColor: 'rgba(255,107,0,0.3)',
          borderWidth: 1,
          callbacks: {
            label: ctx => `$${ctx.parsed.y.toLocaleString()}M`
          }
        },
        annotation: {
          annotations: ftaYear ? {
            ftaLine: {
              type: 'line',
              xMin: years.indexOf(ftaYear),
              xMax: years.indexOf(ftaYear),
              borderColor: 'rgba(255,107,0,0.9)',
              borderWidth: 2,
              borderDash: [5, 4],
              label: {
                display: true,
                content: `← FTA ${ftaYear}`,
                color: '#FF6B00',
                backgroundColor: 'rgba(10,14,26,0.85)',
                font: { size: 9.5, family: "'JetBrains Mono',monospace" },
                position: 'start',
              }
            }
          } : {}
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgba(245,240,232,0.4)', font: { size: 9 }, maxTicksLimit: 8 },
          grid: { color: 'rgba(30,42,66,0.6)' },
        },
        y: {
          ticks: {
            color: 'rgba(245,240,232,0.4)',
            font: { size: 9 },
            callback: v => v >= 1000 ? `$${(v/1000).toFixed(0)}B` : `$${v}M`
          },
          grid: { color: 'rgba(30,42,66,0.6)' },
        }
      }
    },
    plugins: [drawFTAAnnotation(years, ftaYear)]
  });
  activeCharts.push(chart);
}

function buildImportsChart(fta) {
  const ctx = document.getElementById('imports-chart');
  if (!ctx) return;
  
  const years = Object.keys(fta.imports).map(Number).sort((a, b) => a - b);
  const values = years.map(y => fta.imports[y] || 0);
  const ftaYear = fta.signedYear;

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years.map(String),
      datasets: [{
        label: 'Imports (USD M)',
        data: values,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(22,29,46,0.95)',
          titleColor: '#EF4444',
          bodyColor: 'rgba(245,240,232,0.8)',
          borderColor: 'rgba(239,68,68,0.3)',
          borderWidth: 1,
          callbacks: {
            label: ctx => `$${ctx.parsed.y.toLocaleString()}M`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgba(245,240,232,0.4)', font: { size: 9 }, maxTicksLimit: 8 },
          grid: { color: 'rgba(30,42,66,0.6)' },
        },
        y: {
          ticks: {
            color: 'rgba(245,240,232,0.4)',
            font: { size: 9 },
            callback: v => v >= 1000 ? `$${(v/1000).toFixed(0)}B` : `$${v}M`
          },
          grid: { color: 'rgba(30,42,66,0.6)' },
        }
      }
    },
    plugins: [drawFTAAnnotation(years, ftaYear)]
  });
  activeCharts.push(chart);
}

function buildTopGoodsChart(fta) {
  const ctx = document.getElementById('goods-chart');
  if (!ctx) return;

  const goods = fta.topExports;
  const labels = goods.map(g => g.product.length > 18 ? g.product.substring(0, 16) + '…' : g.product);
  const values = goods.map(g => g.value2024);
  const colors = ['#FF6B00', '#FF8C3A', '#F59E0B', '#22C55E', '#06B6D4'];

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Export Value 2024 (USD M)',
        data: values,
        backgroundColor: colors.map(c => c + '99'),
        borderColor: colors,
        borderWidth: 1.5,
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(22,29,46,0.95)',
          titleColor: '#FF6B00',
          bodyColor: 'rgba(245,240,232,0.8)',
          borderColor: 'rgba(255,107,0,0.3)',
          borderWidth: 1,
          callbacks: {
            label: ctx => `$${ctx.parsed.x.toLocaleString()}M`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'rgba(245,240,232,0.4)',
            font: { size: 9 },
            callback: v => v >= 1000 ? `$${(v/1000).toFixed(0)}B` : `$${v}M`
          },
          grid: { color: 'rgba(30,42,66,0.6)' },
        },
        y: {
          ticks: { color: 'rgba(245,240,232,0.6)', font: { size: 9.5 } },
          grid: { display: false },
        }
      }
    }
  });
  activeCharts.push(chart);
}

function buildUtilisationBar(fta) {
  const ctx = document.getElementById('util-bar-chart');
  if (!ctx || fta.utilisationRate === null) return;

  const total = fta.utilTotalEligible;
  const used = fta.utilImportsFTA;
  const unused = total - used;

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Eligible Dutiable Imports'],
      datasets: [
        {
          label: 'Using FTA Scheme',
          data: [used],
          backgroundColor: 'rgba(255,107,0,0.7)',
          borderColor: '#FF6B00',
          borderWidth: 1.5,
          borderRadius: 4,
        },
        {
          label: 'Not Using FTA (MFN or ineligible)',
          data: [unused],
          backgroundColor: 'rgba(30,42,66,0.9)',
          borderColor: 'rgba(255,107,0,0.2)',
          borderWidth: 1.5,
          borderRadius: 4,
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: 'rgba(245,240,232,0.6)',
            font: { size: 10 },
            boxWidth: 12,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(22,29,46,0.95)',
          titleColor: '#FF6B00',
          bodyColor: 'rgba(245,240,232,0.8)',
          borderColor: 'rgba(255,107,0,0.3)',
          borderWidth: 1,
          callbacks: {
            label: ctx => `$${ctx.parsed.x.toLocaleString()}M`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: 'rgba(245,240,232,0.4)',
            font: { size: 9 },
            callback: v => v >= 1000 ? `$${(v/1000).toFixed(0)}B` : `$${v}M`
          },
          grid: { color: 'rgba(30,42,66,0.6)' },
        },
        y: {
          stacked: true,
          ticks: { color: 'rgba(245,240,232,0.4)', font: { size: 9 } },
          grid: { display: false },
        }
      }
    }
  });
  activeCharts.push(chart);
}

// ─── CUSTOM PLUGIN: FTA Annotation Line ───
function drawFTAAnnotation(years, ftaYear) {
  return {
    id: 'ftaAnnotation',
    afterDatasetsDraw(chart) {
      if (!ftaYear) return;
      const idx = years.indexOf(ftaYear);
      if (idx < 0) return;
      
      const { ctx: c, chartArea, scales } = chart;
      const x = scales.x.getPixelForValue(idx);
      
      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = 'rgba(255,107,0,0.85)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(x, chartArea.top);
      c.lineTo(x, chartArea.bottom);
      c.stroke();
      
      c.setLineDash([]);
      c.fillStyle = 'rgba(10,14,26,0.88)';
      const label = `FTA ${ftaYear}`;
      c.font = "9px 'JetBrains Mono', monospace";
      const tw = c.measureText(label).width;
      c.fillRect(x - tw/2 - 5, chartArea.top + 4, tw + 10, 16);
      c.fillStyle = '#FF6B00';
      c.textAlign = 'center';
      c.fillText(label, x, chartArea.top + 15);
      c.restore();
    }
  };
}
