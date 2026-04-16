// India FTA Tracker — Application Logic v3

let activeCharts = [];

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  buildTimeline();
  selectFTA('executive-summary');
});

// ─── TIMELINE ───
function buildTimeline() {
  const container = document.getElementById('timeline');

  // Executive Summary button at the top
  const execBtn = document.createElement('button');
  execBtn.className = 'fta-btn exec-summary-btn';
  execBtn.dataset.id = 'executive-summary';
  execBtn.innerHTML = `
    <div class="fta-dot"></div>
    <div class="fta-btn-info">
      <div class="fta-name" style="font-size:0.92rem">Executive Summary</div>
      <div class="fta-partner">Overview &amp; Key Statistics</div>
    </div>
  `;
  execBtn.addEventListener('click', () => selectFTA('executive-summary'));
  container.appendChild(execBtn);

  // Divider
  const divider = document.createElement('div');
  divider.className = 'timeline-divider';
  container.appendChild(divider);

  // FTA buttons
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

  // Bottom divider
  const divider2 = document.createElement('div');
  divider2.className = 'timeline-divider';
  container.appendChild(divider2);

  // Conclusion button
  const concBtn = document.createElement('button');
  concBtn.className = 'fta-btn exec-summary-btn';
  concBtn.dataset.id = 'conclusion';
  concBtn.innerHTML = `
    <div class="fta-dot"></div>
    <div class="fta-btn-info">
      <div class="fta-name" style="font-size:0.88rem">Conclusion</div>
      <div class="fta-partner">Summary &amp; Assessment</div>
    </div>
  `;
  concBtn.addEventListener('click', () => selectFTA('conclusion'));
  container.appendChild(concBtn);

  // Limitations button
  const limBtn = document.createElement('button');
  limBtn.className = 'fta-btn exec-summary-btn';
  limBtn.dataset.id = 'limitations';
  limBtn.innerHTML = `
    <div class="fta-dot"></div>
    <div class="fta-btn-info">
      <div class="fta-name" style="font-size:0.88rem">Limitations of this Study</div>
      <div class="fta-partner">Methodology Caveats</div>
    </div>
  `;
  limBtn.addEventListener('click', () => selectFTA('limitations'));
  container.appendChild(limBtn);
}

// ─── SELECT FTA ───
function selectFTA(id) {
  document.querySelectorAll('.fta-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-id="${id}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  document.getElementById('placeholder').style.display = 'none';

  activeCharts.forEach(c => c.destroy());
  activeCharts = [];

  const container = document.getElementById('fta-content');

  if (id === 'executive-summary') {
    container.innerHTML = renderExecutiveSummary();
    return;
  }

  if (id === 'conclusion') {
    container.innerHTML = renderConclusion();
    return;
  }

  if (id === 'limitations') {
    container.innerHTML = renderLimitations();
    return;
  }

  const fta = FTA_DATA.find(f => f.id === id);
  if (!fta) return;

  container.innerHTML = renderFTADetail(fta);

  requestAnimationFrame(() => {
    buildExportsChart(fta);
    buildImportsChart(fta);
    buildUtilisationBar(fta);
  });
}

// ─── EXECUTIVE SUMMARY ───
function renderExecutiveSummary() {
  return `
    <div class="fta-detail visible">
      <div class="exec-summary-header">
        <h2>Executive Summary</h2>
        <p class="exec-summary-sub">India's Free Trade Agreements — Empirical Assessment · 1996–2026</p>
      </div>

      <div class="exec-placeholder">
        <div class="exec-placeholder-icon">✏</div>
        <p><em>Executive summary to be added. Use this space to present the key findings, policy implications, and overall assessment of India's FTA programme.</em></p>
        <p class="exec-placeholder-note">Select individual FTAs from the index on the left to explore detailed analysis.</p>
      </div>

      <div class="section-title" style="margin-bottom:1rem">Key Statistics</div>
      <div class="exec-stats-grid">
        <div class="exec-stat"><div class="exec-stat-val">15</div><div class="exec-stat-label">Signed FTAs</div></div>
        <div class="exec-stat"><div class="exec-stat-val">55</div><div class="exec-stat-label">Partner Countries</div></div>
        <div class="exec-stat"><div class="exec-stat-val">30yr</div><div class="exec-stat-label">Timeline (1996–2026)</div></div>
        <div class="exec-stat"><div class="exec-stat-val">9</div><div class="exec-stat-label">In Force</div></div>
      </div>

      <div class="util-methodology" style="margin-bottom:2rem">
        <div class="util-method-title">FTA Utilisation Rate — Methodology</div>
        <p>The FTA Utilisation Rate measures what share of eligible dutiable imports actually claim the preferential tariff:<br>
        <code class="util-formula">(Dutiable imports under FTA scheme ÷ Total eligible dutiable imports) × 100</code></p>

        <div class="util-method-title">Data Source</div>
        <p>Based on <a href="https://dgft.gov.in/" target="_blank" rel="noopener">DGFT preference certificate issuance records</a> and partner customs authorities' Certificate of Origin / Form A data. Cross-referenced with the <a href="https://unctad.org/topic/trade-analysis/trade-and-tariff-data" target="_blank" rel="noopener">UNCTAD Trade Analysis Portal</a> and <a href="https://tradestat.commerce.gov.in/" target="_blank" rel="noopener">MoC Export-Import Data Bank</a>. India's active FTAs average a utilisation rate of approximately 42%.</p>
      </div>

      <div class="report-footer">
        For comments and feedback, contact <a href="mailto:anisree@takshashila.org.in">anisree@takshashila.org.in</a>
      </div>
    </div>
  `;
}

// ─── CONCLUSION ───
function renderConclusion() {
  const rows = FTA_DATA.map(fta => {
    const exportYears = Object.keys(fta.exports).map(Number).sort((a, b) => a - b);
    const latestYr = exportYears[exportYears.length - 1];
    const signedYr = typeof fta.signedYear === 'number' ? fta.signedYear : null;

    let exportChangeHtml = '<span style="color:var(--white-dim)">N/A</span>';
    if (signedYr && fta.exports[signedYr] && fta.exports[latestYr]) {
      const pct = Math.round(((fta.exports[latestYr] - fta.exports[signedYr]) / fta.exports[signedYr]) * 100);
      const color = pct >= 0 ? 'var(--surplus)' : 'var(--deficit)';
      exportChangeHtml = `<span style="color:${color};font-weight:600">${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}%</span>`;
    }

    let utilHtml = '<span style="color:var(--white-dim)">N/A</span>';
    if (fta.utilisationRate !== null) {
      const uColor = fta.utilisationRate >= 60 ? 'var(--surplus)' : fta.utilisationRate >= 40 ? 'var(--gold)' : 'var(--deficit)';
      utilHtml = `<span style="color:${uColor};font-weight:600">${fta.utilisationRate}%</span>`;
    }

    const statusClass = fta.status === 'active' ? 'badge-active' : fta.status === 'pending' ? 'badge-pending' : 'badge-review';
    const statusLabel = fta.status === 'active' ? 'IN FORCE' : fta.status === 'pending' ? 'PENDING' : 'SUSPENDED';
    const balColor = fta.balanceType === 'surplus' ? 'var(--surplus)' : fta.balanceType === 'deficit' ? 'var(--deficit)' : 'var(--gold)';

    return `
      <tr>
        <td style="font-weight:600">${fta.name}</td>
        <td style="color:var(--white-dim)">${fta.partner}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:0.78rem">${fta.effectiveYear || 'TBD'}</td>
        <td><span class="fta-status-badge ${statusClass}">${statusLabel}</span></td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:0.78rem;color:${balColor}">${fta.currentBalance}</td>
        <td>${exportChangeHtml}</td>
        <td>${utilHtml}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="fta-detail visible">
      <div class="exec-summary-header">
        <h2>Conclusion</h2>
        <p class="exec-summary-sub">Overall Assessment of India's FTA Programme</p>
      </div>

      <div class="exec-placeholder">
        <div class="exec-placeholder-icon">✏</div>
        <p><em>Conclusion to be added. Summarise overall findings on India's FTA performance — including which agreements have delivered for Indian exporters, where utilisation is low, and what policy reforms are needed.</em></p>
      </div>

      <div class="section-title" style="margin-bottom:1rem">Summary of All 15 FTAs</div>
      <div style="overflow-x:auto">
        <table class="conclusion-table">
          <thead>
            <tr>
              <th>Agreement</th>
              <th>Partner</th>
              <th>In Force</th>
              <th>Status</th>
              <th>Trade Balance</th>
              <th>Export Change (since signing)</th>
              <th>Utilisation Rate</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <div class="chart-source" style="margin-top:0.75rem">
        Export change calculated from the year of signing to most recent data year. N/A where signing year data is unavailable.
        Utilisation rate: share of eligible dutiable imports claiming FTA preference (DGFT data).
        Green ≥60% · Amber 40–59% · Red &lt;40% · Grey = not yet applicable.
      </div>

      <div class="report-footer">
        For comments and feedback, contact <a href="mailto:anisree@takshashila.org.in">anisree@takshashila.org.in</a>
      </div>
    </div>
  `;
}

// ─── LIMITATIONS ───
function renderLimitations() {
  return `
    <div class="fta-detail visible">
      <div class="exec-summary-header">
        <h2>Limitations of this Study</h2>
        <p class="exec-summary-sub">Methodology Caveats &amp; Data Quality Notes</p>
      </div>

      <div class="util-methodology" style="margin-bottom:1.5rem">
        <div class="util-method-title">1 — FTA Utilisation Rate Measurement</div>
        <p>The utilisation rate figures in this report are estimates derived from DGFT preference certificate issuance data and should be treated as indicative, not definitive. Known limitations:</p>
        <ul class="util-limitations" style="margin-top:0.5rem">
          <li>DGFT data tracks certificates <em>issued</em>, not goods actually cleared — some certificates are issued but shipments are subsequently cancelled.</li>
          <li>Partner customs may use different base years or eligibility criteria, causing denominator mismatches between Indian and partner-side estimates.</li>
          <li>Goods transshipped through third countries may not be correctly attributed to the bilateral FTA.</li>
          <li>Utilisation rates for recently-signed agreements (UAE, Australia, UK, Oman, New Zealand, EU) may be underestimated as exporters take time to learn Rules of Origin (RoO) requirements — research shows utilisation typically rises 10–15 percentage points in years 2–5 after entry into force.</li>
          <li>Data lag: DGFT preference certificate data is typically available with a 12–18 month delay, so recent-year figures are preliminary.</li>
        </ul>
      </div>

      <div class="util-methodology" style="margin-bottom:1.5rem">
        <div class="util-method-title">2 — Trade Data Quality</div>
        <p>Trade values (exports, imports) in this report are sourced from DGFT Annual Reports, MoC Export-Import Data Bank, and UN Comtrade. Known data quality issues in this dataset:</p>
        <ul class="util-limitations" style="margin-top:0.5rem">
          <li><strong>UAE CEPA:</strong> The original dataset had exports and imports transposed — corrected in this version. DGFT FY2023-24 reports India's exports to UAE at ~$35.6B and imports at ~$49.2B. The 2024 values used here (exports $40.2B / imports $52B) reflect the correction plus partial-year estimate.</li>
          <li><strong>Australia ECTA:</strong> Absolute trade values in this report appear approximately 2× the figures in DGFT's FY2023-24 Annual Report (DGFT: exports ~$8.6B, imports ~$16.6B). The direction of balance (India deficit, driven by coal/LNG) is correct. Verification required against official sources.</li>
          <li><strong>Oman, New Zealand, EU (2024):</strong> The 2024 data points for these three FTAs are FY 2024-25 (April 2024 – March 2025) full-year figures, not calendar year 2024. This causes an apparent sharp drop on the chart for these partners in the year 2024 (transition from CY to FY basis).</li>
          <li><strong>Historical series (1991–2005):</strong> These are estimates reconstructed from UN Comtrade and DGFT records; they have wider error margins than post-2005 data.</li>
        </ul>
      </div>

      <div class="util-methodology" style="margin-bottom:1.5rem">
        <div class="util-method-title">3 — Attribution Challenges</div>
        <p>A core analytical challenge is separating the effect of an FTA from other factors driving trade growth. The export growth figures shown (% change since signing) should not be interpreted as caused by the FTA alone. Confounding factors include:</p>
        <ul class="util-limitations" style="margin-top:0.5rem">
          <li>Global commodity price cycles (especially petroleum, which dominates many bilateral totals)</li>
          <li>Exchange rate movements (USD/INR, USD/partner currency)</li>
          <li>India's overall economic growth and increasing domestic manufacturing capacity</li>
          <li>Unilateral MFN tariff reductions by partner countries independent of the FTA</li>
          <li>Non-tariff barriers (SPS measures, technical standards, port procedures) that may constrain or enable trade independent of tariff changes</li>
          <li>Global trade disruptions (2008–09 financial crisis, 2020 COVID-19 pandemic) that affect all bilateral trade flows</li>
        </ul>
        <p style="margin-top:0.75rem">This report uses the FTA signing year as a breakpoint on trade charts and calculates export change since signing — but makes no causal claim that the FTA alone drove those changes.</p>
      </div>

      <div class="report-footer">
        For comments and feedback, contact <a href="mailto:anisree@takshashila.org.in">anisree@takshashila.org.in</a>
      </div>
    </div>
  `;
}

// ─── HELPERS ───
function splitToBullets(text, mode) {
  let parts;
  if (mode === 'sentence') {
    parts = text.split(/\.\s+/);
  } else {
    // Try semicolons first; fall back to sentences
    parts = text.includes(';') ? text.split(/;\s*/) : text.split(/\.\s+/);
  }
  return parts
    .map(s => s.trim().replace(/^[–\-•]\s*/, '').replace(/\.+$/, ''))
    .filter(s => s.length > 8)
    .map(s => `<li>${s}.</li>`)
    .join('');
}

function generateKeyFindings(fta) {
  const findings = [];

  // Trade balance
  const balDir = fta.balanceType === 'surplus' ? 'trade surplus'
    : fta.balanceType === 'deficit' ? 'trade deficit' : 'mixed trade balance';
  findings.push(`India maintains a ${balDir} of <strong>${fta.currentBalance}</strong> with ${fta.partner}. ${fta.balanceNote}.`);

  // Utilisation
  if (fta.utilisationRate !== null) {
    const level = fta.utilisationRate >= 60 ? 'high' : fta.utilisationRate >= 40 ? 'moderate' : 'low';
    findings.push(`FTA preference utilisation is <strong>${level} at ${fta.utilisationRate}%</strong> — meaning only ${fta.utilisationRate}% of eligible imports use the preferential tariff scheme. ${fta.utilisationNote}.`);
  } else {
    const reason = fta.status === 'pending' ? 'the agreement is pending ratification' : 'the agreement is not yet in force';
    findings.push(`FTA utilisation data is not yet available as ${reason}. Comparable agreements typically see initial utilisation of 40–60% within the first two years of implementation.`);
  }

  // Top export
  if (fta.topExports && fta.topExports.length > 0) {
    const top = fta.topExports[0];
    findings.push(`India's largest export to ${fta.partner}: <strong>${top.product}</strong> (est. $${top.value2024.toLocaleString()}M in 2024), with the tariff reduced from ${top.tariffBefore} → <strong>${top.tariffAfter}</strong> under the agreement.`);
  }

  // Tariff coverage
  if (fta.tariffLines) {
    findings.push(`The agreement covers <strong>${fta.tariffLines.toLocaleString()} tariff lines</strong> with <strong>${fta.dutyFreePercent}</strong> duty-free coverage. ${fta.coverageNote}.`);
  }

  return findings;
}

// ─── FTA DETAIL RENDERER ───
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

  // Key provisions: use detailed array if available, else split string
  const keyProvisionsHtml = fta.keyProvisionsDetailed
    ? fta.keyProvisionsDetailed.map(p => `<li><strong>${p.title}</strong> — ${p.note}</li>`).join('')
    : splitToBullets(fta.keyProvisions, 'semi');

  // Top goods: full-width table with inline value bars + legend
  const maxVal = Math.max(...fta.topExports.map(g => g.value2024));
  const goodsTableHtml = `
    <div class="table-legend">
      <span class="legend-bar-sample"></span>
      Bar width = proportion of value relative to the largest export product shown (100% bar = highest-value product in this table).
    </div>
    <div style="overflow-x:auto">
      <table class="goods-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Value (2024 est.)</th>
            <th>Tariff Change (Partner Applied)</th>
            <th>Growth</th>
          </tr>
        </thead>
        <tbody>
          ${fta.topExports.map(g => `
            <tr>
              <td><span class="rank-num">${g.rank}</span></td>
              <td>${g.product}</td>
              <td>
                <div class="value-bar-cell">
                  <div class="value-bar-bg">
                    <div class="value-bar-fill" style="width:${Math.round((g.value2024 / maxVal) * 100)}%"></div>
                  </div>
                  <span class="value-bar-label">$${g.value2024.toLocaleString()}M</span>
                </div>
              </td>
              <td>
                <div class="tariff-change">
                  <span class="tariff-before">${g.tariffBefore}</span>
                  <span class="tariff-arrow">→</span>
                  <span class="tariff-after">${g.tariffAfter}</span>
                </div>
              </td>
              <td>
                <span style="font-size:0.74rem;color:${g.growth === 'high' ? 'var(--surplus)' : g.growth === 'moderate' ? 'var(--gold)' : 'var(--deficit)'}">
                  ${g.growth === 'high' ? '▲ High' : g.growth === 'moderate' ? '◆ Moderate' : '▼ Low'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="chart-source">
      Source: <a href="https://dgft.gov.in/" target="_blank" rel="noopener">DGFT Annual Report</a>
      &amp; <a href="https://www.wto.org/english/res_e/statis_e/tariff_profiles_e.htm" target="_blank" rel="noopener">WTO Tariff Profiles</a> · 2024 estimates · tariff rates from official FTA schedules vs MFN applied rates
    </div>
  `;

  // Utilisation HTML — methodology box removed (moved to Executive Summary)
  const utilisationHtml = fta.utilisationRate !== null ? `
    <div class="util-section">
      <div class="section-title">FTA Utilisation Rate</div>
      <div class="util-rate-display">
        <div class="util-gauge">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" style="stroke:var(--saffron-dim)" stroke-width="10"/>
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
            <span class="util-row-val" style="font-size:0.64rem;color:var(--white-dim)">(FTA scheme ÷ eligible) × 100</span>
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
      <div class="util-note" style="margin-top:0.75rem">⚠ Utilisation rate not yet calculable — FTA not in force. ${fta.utilisationNote}</div>
    </div>
  `;

  // Auto-generated key analysis
  const findings = generateKeyFindings(fta);
  const keyAnalysisHtml = `
    <div class="key-findings-section">
      <div class="section-title" style="margin-bottom:1rem">Key Analysis</div>
      <div class="key-findings-card">
        <ul class="findings-list">
          ${findings.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
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
            <span class="fta-status-badge ${statusClass}" style="font-size:0.65rem;padding:4px 12px;margin-top:0">${statusLabel}</span>
          </div>
        </div>
        <div class="balance-badge ${balClass}">
          <div class="bal-label">${fta.balanceType === 'surplus' ? '▲ SURPLUS' : fta.balanceType === 'deficit' ? '▼ DEFICIT' : '⟷ MIXED'}</div>
          <div class="bal-value">${fta.currentBalance}</div>
          <div class="bal-sub">${fta.balanceNote}</div>
        </div>
      </div>

      <!-- COMBINED SUMMARY CARD -->
      <div class="summary-grid">
        <div class="summary-card full">
          <div class="sc-label">Agreement Summary</div>
          <ul class="sc-bullets">${splitToBullets(fta.summary, 'sentence')}</ul>

          <div class="sc-sub-label">Key Market Access Provisions</div>
          <ul class="sc-bullets">${keyProvisionsHtml}</ul>

          <div class="sc-sub-label">Tariff Coverage &amp; Market Access</div>
          <div class="sc-value"><strong>${fta.coverageNote}</strong>
            ${tariffLinesHtml}
          </div>
        </div>
      </div>

      <!-- TRADE FLOW CHARTS -->
      <div class="section-title" style="margin-bottom:1rem">Trade Flow Analysis · 1991–2025</div>
      <div class="chart-grid">
        <div class="chart-card">
          <div class="chart-title">India Exports → ${fta.partner}</div>
          <div class="chart-subtitle">USD Million · FTA signature year marked</div>
          <div class="chart-container"><canvas id="exports-chart"></canvas></div>
          <div class="chart-source">
            Source: <a href="https://tradestat.commerce.gov.in/" target="_blank" rel="noopener">MoC Export-Import Data Bank</a>
            &amp; <a href="https://comtradeplus.un.org/" target="_blank" rel="noopener">UN Comtrade</a> · USD Million · annual figures
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">India Imports ← ${fta.partner}</div>
          <div class="chart-subtitle">USD Million · FTA signature year marked</div>
          <div class="chart-container"><canvas id="imports-chart"></canvas></div>
          <div class="chart-source">
            Source: <a href="https://tradestat.commerce.gov.in/" target="_blank" rel="noopener">MoC Export-Import Data Bank</a>
            &amp; <a href="https://comtradeplus.un.org/" target="_blank" rel="noopener">UN Comtrade</a> · USD Million · annual figures
          </div>
        </div>
      </div>

      <!-- TOP GOODS — full-width table only -->
      <div class="section-title" style="margin-bottom:1rem">Top 5 Export Goods to ${fta.partner} · Tariff &amp; Value Analysis</div>
      <div class="chart-card" style="margin-bottom:2rem">
        <div class="chart-title">Tariff Rate Changes &amp; Export Values · 2024 est.</div>
        <div class="chart-subtitle">Pre-FTA vs post-FTA tariff applied by ${fta.partner} on Indian exports</div>
        ${goodsTableHtml}
      </div>

      <!-- UTILISATION -->
      ${utilisationHtml}

      <!-- KEY ANALYSIS -->
      ${keyAnalysisHtml}

      <!-- DATA NOTE -->
      <div class="data-note">
        📊 <strong>Data Sources:</strong> Ministry of Commerce &amp; Industry (DGFT), UN Comtrade, WTO RTA Database, partner government trade fact sheets, Reserve Bank of India, UNCTAD Trade Analysis Portal.
        Trade values in USD million. FTA utilisation data from DGFT preference certificate records and partner customs data.
        Historical data (1991–2005) uses DGFT/UN Comtrade estimates; post-2005 from DGFT annual reports.
        Tariff rates from official FTA schedules and MFN applied rates (WTO Tariff Profiles).
        ⚠ All data is indicative and for analytical purposes. Please verify with official government sources before policy use.
      </div>

      <div class="report-footer">
        For comments and feedback, contact <a href="mailto:anisree@takshashila.org.in">anisree@takshashila.org.in</a>
      </div>
    </div>
  `;
}

// ─── CHART BUILDERS ───

function getChartYears(fta) {
  return Object.keys(fta.exports).map(Number).sort((a, b) => a - b);
}

function buildExportsChart(fta) {
  const ctx = document.getElementById('exports-chart');
  if (!ctx) return;

  const years = getChartYears(fta);
  const values = years.map(y => fta.exports[y] || 0);
  const ftaYear = fta.signedYear;

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years.map(String),
      datasets: [{
        label: 'Exports (USD M)',
        data: values,
        borderColor: '#2D6A2D',
        backgroundColor: 'rgba(45,106,45,0.07)',
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
          backgroundColor: 'rgba(255,252,248,0.97)',
          titleColor: '#A0670A',
          bodyColor: 'rgba(28,26,20,0.75)',
          borderColor: 'rgba(200,134,10,0.3)',
          borderWidth: 1,
          callbacks: { label: ctx => `$${ctx.parsed.y.toLocaleString()}M` }
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgba(28,26,20,0.45)', font: { size: 9 }, maxTicksLimit: 8 },
          grid: { color: 'rgba(180,170,150,0.25)' },
        },
        y: {
          ticks: {
            color: 'rgba(28,26,20,0.45)',
            font: { size: 9 },
            callback: v => v >= 1000 ? `$${(v / 1000).toFixed(0)}B` : `$${v}M`
          },
          grid: { color: 'rgba(180,170,150,0.25)' },
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
        borderColor: '#B91C1C',
        backgroundColor: 'rgba(185,28,28,0.07)',
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
          backgroundColor: 'rgba(255,252,248,0.97)',
          titleColor: '#B91C1C',
          bodyColor: 'rgba(28,26,20,0.75)',
          borderColor: 'rgba(185,28,28,0.3)',
          borderWidth: 1,
          callbacks: { label: ctx => `$${ctx.parsed.y.toLocaleString()}M` }
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgba(28,26,20,0.45)', font: { size: 9 }, maxTicksLimit: 8 },
          grid: { color: 'rgba(180,170,150,0.25)' },
        },
        y: {
          ticks: {
            color: 'rgba(28,26,20,0.45)',
            font: { size: 9 },
            callback: v => v >= 1000 ? `$${(v / 1000).toFixed(0)}B` : `$${v}M`
          },
          grid: { color: 'rgba(180,170,150,0.25)' },
        }
      }
    },
    plugins: [drawFTAAnnotation(years, ftaYear)]
  });
  activeCharts.push(chart);
}

function buildUtilisationBar(fta) {
  const ctx = document.getElementById('util-bar-chart');
  if (!ctx || fta.utilisationRate === null) return;

  const used = fta.utilImportsFTA;
  const unused = fta.utilTotalEligible - used;

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Eligible Dutiable Imports'],
      datasets: [
        {
          label: 'Using FTA Scheme',
          data: [used],
          backgroundColor: 'rgba(200,134,10,0.75)',
          borderColor: '#C8860A',
          borderWidth: 1.5,
          borderRadius: 4,
        },
        {
          label: 'Not Using FTA (MFN or ineligible)',
          data: [unused],
          backgroundColor: 'rgba(221,216,204,0.85)',
          borderColor: 'rgba(200,134,10,0.2)',
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
          labels: { color: 'rgba(28,26,20,0.65)', font: { size: 10 }, boxWidth: 12 }
        },
        tooltip: {
          backgroundColor: 'rgba(255,252,248,0.97)',
          titleColor: '#A0670A',
          bodyColor: 'rgba(28,26,20,0.75)',
          borderColor: 'rgba(200,134,10,0.3)',
          borderWidth: 1,
          callbacks: { label: ctx => `$${ctx.parsed.x.toLocaleString()}M` }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: 'rgba(28,26,20,0.45)',
            font: { size: 9 },
            callback: v => v >= 1000 ? `$${(v / 1000).toFixed(0)}B` : `$${v}M`
          },
          grid: { color: 'rgba(180,170,150,0.25)' },
        },
        y: {
          stacked: true,
          ticks: { color: 'rgba(28,26,20,0.45)', font: { size: 9 } },
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
      c.strokeStyle = 'rgba(200,134,10,0.6)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(x, chartArea.top);
      c.lineTo(x, chartArea.bottom);
      c.stroke();

      c.setLineDash([]);
      c.fillStyle = 'rgba(248,246,241,0.93)';
      const label = `FTA ${ftaYear}`;
      c.font = "9px 'JetBrains Mono', monospace";
      const tw = c.measureText(label).width;
      c.fillRect(x - tw / 2 - 5, chartArea.top + 4, tw + 10, 16);
      c.strokeStyle = 'rgba(200,134,10,0.4)';
      c.lineWidth = 1;
      c.setLineDash([]);
      c.strokeRect(x - tw / 2 - 5, chartArea.top + 4, tw + 10, 16);
      c.fillStyle = '#A0670A';
      c.textAlign = 'center';
      c.fillText(label, x, chartArea.top + 15);
      c.restore();
    }
  };
}
