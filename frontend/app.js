/* ── Config ─────────────────────────────────────────────────────────────── */
const API = 'https://nepseinsight.onrender.com/api';

const C = {
  red:      '#c0392b', redSoft:   '#e74c3c', redGlow: 'rgba(192,57,43,.18)',
  green:    '#27ae60', greenSoft: '#2ecc71',
  amber:    '#f39c12', purple:    '#9b59b6',
  muted:    '#8892a4', border:    '#252a38',
  surface2: '#1a1e28', text:      '#e8ecf4',
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const el  = id => document.getElementById(id);
const fmt = {
  rs:   n => 'Rs. ' + Number(n).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2}),
  num:  n => Number(n).toLocaleString('en-IN'),
  pct:  n => (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%',
  short:n => n >= 1e9 ? (n/1e9).toFixed(2)+'B' : n >= 1e7 ? (n/1e7).toFixed(1)+'Cr' : n >= 1e5 ? (n/1e5).toFixed(1)+'L' : n,
};

function setChange(element, value, pct) {
  element.className = 'hero-change ' + (value >= 0 ? 'up' : 'down');
  element.textContent = (value >= 0 ? '▲ +' : '▼ ') + Math.abs(value).toFixed(2)
    + '  (' + (value >= 0 ? '+' : '') + pct.toFixed(2) + '%)';
}

function chartBase() {
  return {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode:'index', intersect:false },
    plugins: {
      legend: { display:false },
      tooltip: {
        backgroundColor: C.surface2, borderColor: C.border, borderWidth:1,
        titleColor: C.muted, bodyColor: C.text, padding:10,
      }
    },
    scales: {
      x: { grid:{ color:C.border }, ticks:{ color:C.muted, font:{family:'DM Mono',size:10}, maxTicksLimit:8 } },
      y: { grid:{ color:C.border }, ticks:{ color:C.muted, font:{family:'DM Mono',size:10} } },
    }
  };
}

/* ── Fetch all ────────────────────────────────────────────────────────────── */
let allStocksData = [];
let candleChartInst = null, volChartInst = null;

async function fetchAll() {
  try {
    const [summary, gainers, losers, sectors, history, stocks] = await Promise.all([
      fetch(`${API}/summary`).then(r=>r.json()),
      fetch(`${API}/gainers`).then(r=>r.json()),
      fetch(`${API}/losers`).then(r=>r.json()),
      fetch(`${API}/sectors`).then(r=>r.json()),
      fetch(`${API}/index-history`).then(r=>r.json()),
      fetch(`${API}/stocks`).then(r=>r.json()),
    ]);
    renderSummary(summary);
    renderGainersLosers(gainers, losers);
    renderIndexChart(history);
    renderSectorChart(sectors);
    renderStocksTable(stocks);
  } catch(err) {
    console.error(err);
    el('nepseIndex').textContent  = 'API offline';
    el('nepseChange').textContent = 'Run: python backend/app.py';
    el('nepseChange').className   = 'hero-change down';
  }
}

/* ── Summary ─────────────────────────────────────────────────────────────── */
function renderSummary(d) {
  el('nepseIndex').textContent    = Number(d.nepse_index).toLocaleString('en-IN',{minimumFractionDigits:2});
  setChange(el('nepseChange'), d.index_change, d.index_change_pct);
  el('turnover').textContent      = fmt.short(d.total_turnover);
  el('marketCap').textContent     = fmt.short(d.market_cap);
  el('tradedShares').textContent  = fmt.num(d.traded_shares);
  el('gainersCount').textContent  = `▲ ${d.gainers} up`;
  el('unchangedCount').textContent= `· ${d.unchanged} flat ·`;
  el('losersCount').textContent   = `▼ ${d.losers} down`;
  el('asOf').textContent          = 'As of ' + d.as_of_date;
  const total = d.total_stocks;
  const gP = (d.gainers/total*100).toFixed(1), lP = (d.losers/total*100).toFixed(1);
  el('breadthBar').style.cssText =
    `background:linear-gradient(to right,${C.green} ${gP}%,${C.border} ${gP}% ${100-lP}%,${C.red} ${100-lP}%);width:100%`;
}

/* ── Gainers / Losers ────────────────────────────────────────────────────── */
function stockRow(s, up) {
  const d = up ? 'up' : 'down', sg = up ? '+' : '';
  return `<tr data-symbol="${s.symbol}">
    <td><span class="sym">${s.symbol}</span></td>
    <td class="ltp">${fmt.rs(s.ltp)}</td>
    <td class="${d}">${sg}${Number(s.change_pct).toFixed(2)}%</td>
    <td class="ltp">${fmt.num(s.volume)}</td>
  </tr>`;
}
function renderGainersLosers(gainers, losers) {
  el('gainersTable').querySelector('tbody').innerHTML = gainers.map(s=>stockRow(s,true)).join('');
  el('losersTable').querySelector('tbody').innerHTML  = losers.map(s=>stockRow(s,false)).join('');
  document.querySelectorAll('#gainersTable tbody tr, #losersTable tbody tr')
    .forEach(r => r.addEventListener('click', ()=> openModal(r.dataset.symbol)));
}

/* ── Index Chart with MA lines ───────────────────────────────────────────── */
function renderIndexChart(history) {
  const labels = history.map(h => h.date.slice(5));
  const vals   = history.map(h => h.nepse_index);
  const ma7    = history.map(h => h.ma7);
  const ma30   = history.map(h => h.ma30);
  const first  = vals[0], last = vals[vals.length-1];
  const up     = last >= first;
  const badge  = el('trendBadge');
  badge.textContent = `60D: ${up?'▲ +':'▼ '}${((last-first)/first*100).toFixed(2)}%`;
  badge.className   = 'chart-badge ' + (up?'up':'down');

  new Chart(el('indexChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'NEPSE',
          data: vals,
          borderColor: up ? C.greenSoft : C.redSoft,
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          backgroundColor: ctx => {
            const g = ctx.chart.ctx.createLinearGradient(0,0,0,240);
            g.addColorStop(0, up ? 'rgba(39,174,96,.2)' : 'rgba(192,57,43,.2)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            return g;
          },
          tension: 0.4,
        },
        {
          label: 'MA7',
          data: ma7,
          borderColor: C.amber,
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0.4,
          borderDash: [4,3],
        },
        {
          label: 'MA30',
          data: ma30,
          borderColor: C.purple,
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0.4,
          borderDash: [8,4],
        },
      ]
    },
    options: {
      ...chartBase(),
      plugins: {
        ...chartBase().plugins,
        tooltip: {
          ...chartBase().plugins.tooltip,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}` }
        }
      }
    }
  });
}

/* ── Sector Chart ────────────────────────────────────────────────────────── */
function renderSectorChart(sectors) {
  const sorted = [...sectors].sort((a,b) => b.avg_change - a.avg_change);
  new Chart(el('sectorChart'), {
    type: 'bar',
    data: {
      labels: sorted.map(s=>s.sector),
      datasets: [{
        data: sorted.map(s=>s.avg_change),
        backgroundColor: sorted.map(s=> s.avg_change>=0 ? C.green+'88' : C.red+'88'),
        borderColor:     sorted.map(s=> s.avg_change>=0 ? C.greenSoft : C.redSoft),
        borderWidth: 1.5, borderRadius: 5,
      }]
    },
    options: {
      ...chartBase(),
      plugins: { ...chartBase().plugins,
        tooltip: { ...chartBase().plugins.tooltip,
          callbacks: { label: ctx => ` ${ctx.parsed.y>=0?'+':''}${ctx.parsed.y.toFixed(2)}%` }
        }
      }
    }
  });
}

/* ── Stocks Table ─────────────────────────────────────────────────────────── */
function renderStocksTable(stocks, filter='') {
  allStocksData = stocks;
  const q = filter.toLowerCase();
  const rows = stocks
    .filter(s => !q || s.symbol.toLowerCase().includes(q) || s.company.toLowerCase().includes(q))
    .map(s => {
      const d = s.change>=0?'up':'down', sg = s.change>=0?'+':'';
      return `<tr data-symbol="${s.symbol}" style="cursor:pointer">
        <td><span class="sym">${s.symbol}</span></td>
        <td class="co-name">${s.company}</td>
        <td><span class="sector-tag">${s.sector}</span></td>
        <td class="ltp">${Number(s.ltp).toFixed(2)}</td>
        <td class="${d} ltp">${sg}${Number(s.change).toFixed(2)}</td>
        <td class="${d}">${sg}${Number(s.change_pct).toFixed(2)}%</td>
        <td class="ltp">${fmt.num(s.volume)}</td>
        <td class="wk-range">${s.week52_high} / ${s.week52_low}</td>
      </tr>`;
    }).join('');
  el('allStocksTable').querySelector('tbody').innerHTML =
    rows || '<tr><td colspan="8" style="color:var(--muted);padding:1rem">No results</td></tr>';
  document.querySelectorAll('#allStocksTable tbody tr')
    .forEach(r => r.addEventListener('click', ()=> openModal(r.dataset.symbol)));
}

el('stockSearch').addEventListener('input', e => renderStocksTable(allStocksData, e.target.value));

/* ── Candlestick Modal ────────────────────────────────────────────────────── */
async function openModal(symbol) {
  // get stock meta
  const stock = allStocksData.find(s => s.symbol === symbol);
  if (!stock) return;

  el('modalTitle').textContent = `${symbol} — ${stock.company}`;
  el('modalSub').textContent   = `${stock.sector} · 30-Day OHLC`;

  const dir = stock.change >= 0 ? 'up' : 'down';
  const sg  = stock.change >= 0 ? '+' : '';
  el('modalStats').innerHTML = `
    <div><div class="mstat-label">LTP</div><div class="mstat-value">Rs. ${Number(stock.ltp).toFixed(2)}</div></div>
    <div><div class="mstat-label">Change</div><div class="mstat-value ${dir}">${sg}${Number(stock.change).toFixed(2)} (${sg}${Number(stock.change_pct).toFixed(2)}%)</div></div>
    <div><div class="mstat-label">52W High</div><div class="mstat-value up">Rs. ${stock.week52_high}</div></div>
    <div><div class="mstat-label">52W Low</div><div class="mstat-value down">Rs. ${stock.week52_low}</div></div>
  `;

  el('modalOverlay').classList.add('open');

  // destroy previous charts
  if (candleChartInst) { candleChartInst.destroy(); candleChartInst = null; }
  if (volChartInst)    { volChartInst.destroy();    volChartInst = null; }

  // fetch OHLC
  try {
    const ohlc = await fetch(`${API}/ohlc/${symbol}`).then(r=>r.json());
    renderCandleChart(ohlc);
    renderVolChart(ohlc);
  } catch(e) {
    console.error('OHLC fetch error', e);
  }
}

function renderCandleChart(ohlc) {
  const labels = ohlc.map(d => d.date.slice(5));
  const opens  = ohlc.map(d => d.open);
  const highs  = ohlc.map(d => d.high);
  const lows   = ohlc.map(d => d.low);
  const closes = ohlc.map(d => d.close);

  // Draw candlesticks manually using a bar chart trick with floating bars
  const bodyData = ohlc.map(d => ({
    x: d.date.slice(5),
    y: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
    up: d.close >= d.open,
  }));

  const wickData = ohlc.map((d,i) => ({
    x: d.date.slice(5),
    y: [d.low, d.high],
  }));

  candleChartInst = new Chart(el('candleChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Wick',
          data: wickData.map(w => w.y),
          backgroundColor: ohlc.map(d => d.close>=d.open ? C.green+'88' : C.red+'88'),
          borderColor:     ohlc.map(d => d.close>=d.open ? C.greenSoft : C.redSoft),
          borderWidth: 1,
          barPercentage: 0.15,
        },
        {
          label: 'Body',
          data: bodyData.map(b => b.y),
          backgroundColor: ohlc.map(d => d.close>=d.open ? C.green : C.red),
          borderColor:     ohlc.map(d => d.close>=d.open ? C.greenSoft : C.redSoft),
          borderWidth: 1,
          barPercentage: 0.6,
        },
      ]
    },
    options: {
      ...chartBase(),
      plugins: {
        ...chartBase().plugins,
        legend: { display: false },
        tooltip: {
          ...chartBase().plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              const d = ohlc[i];
              return ctx.datasetIndex === 1
                ? [`O: ${d.open}  C: ${d.close}`, `H: ${d.high}  L: ${d.low}`]
                : null;
            },
            filter: ctx => ctx.datasetIndex === 1,
          }
        }
      },
      scales: {
        ...chartBase().scales,
        x: { ...chartBase().scales.x, stacked: false },
        y: { ...chartBase().scales.y, stacked: false },
      }
    }
  });
}

function renderVolChart(ohlc) {
  volChartInst = new Chart(el('volChart'), {
    type: 'bar',
    data: {
      labels: ohlc.map(d => d.date.slice(5)),
      datasets: [{
        label: 'Volume',
        data: ohlc.map(d => d.volume),
        backgroundColor: ohlc.map(d => d.close>=d.open ? C.green+'66' : C.red+'66'),
        borderRadius: 2,
      }]
    },
    options: {
      ...chartBase(),
      plugins: { ...chartBase().plugins, legend:{ display:false },
        tooltip: { ...chartBase().plugins.tooltip,
          callbacks: { label: ctx => ` Vol: ${fmt.num(ctx.parsed.y)}` }
        }
      },
      scales: {
        x: { ...chartBase().scales.x, ticks:{ ...chartBase().scales.x.ticks, maxTicksLimit:6 } },
        y: { ...chartBase().scales.y, ticks:{ ...chartBase().scales.y.ticks,
          callback: v => v >= 1e5 ? (v/1e5).toFixed(0)+'L' : v } },
      }
    }
  });
}

/* ── Modal close ──────────────────────────────────────────────────────────── */
el('modalClose').addEventListener('click',  () => el('modalOverlay').classList.remove('open'));
el('modalOverlay').addEventListener('click', e => { if(e.target === el('modalOverlay')) el('modalOverlay').classList.remove('open'); });
document.addEventListener('keydown', e => { if(e.key==='Escape') el('modalOverlay').classList.remove('open'); });

/* ── Init ─────────────────────────────────────────────────────────────────── */
fetchAll();