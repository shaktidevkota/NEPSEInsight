# NEPSEInsight

A full-stack stock market analysis dashboard for the **Nepal Stock Exchange (NEPSE)**, built with Flask and vanilla HTML/CSS/JS.

![Python](https://img.shields.io/badge/Python-3.14-blue?style=flat-square) ![Flask](https://img.shields.io/badge/Flask-3.1-lightgrey?style=flat-square) ![Chart.js](https://img.shields.io/badge/Chart.js-4.4-orange?style=flat-square) ![Power BI](https://img.shields.io/badge/Power%20BI-Report-yellow?style=flat-square)

---

## Overview

NEPSEInsight provides a real-time-style view of NEPSE market activity — index trends, sector performance, top movers, and individual stock analysis — all in a clean dark-themed interface.

The project also includes a companion Power BI report for business intelligence-style exploration of the same dataset.

---

## Features

- **Market Summary** — NEPSE index with live change indicator, turnover, market cap, traded shares, and market breadth bar
- **60-Day Index Trend** — Line chart with MA7 and MA30 moving average overlays
- **Top Gainers & Losers** — Today's top 5 movers with price, change, and volume
- **Sector Performance** — Bar chart comparing average % change across all sectors
- **Stocks Table** — All 33 listed stocks with sector tags, 52-week high/low, and search filter
- **Candlestick Modal** — Click any stock to view its 30-day OHLC chart with volume
- **Power BI Report** — Interactive sector slicer, stocks table, and performance chart (`NEPSEInsight.pbix`)

---

## Project Structure

```
NEPSEInsight/
├── backend/
│   ├── app.py              # Flask REST API
│   └── requirements.txt
├── frontend/
│   ├── index.html          # Dashboard UI
│   ├── style.css           # Dark theme styling
│   └── app.js              # Chart.js visualizations
├── data/
│   ├── nepse_stocks.csv    # 33 stocks with price data
│   ├── nepse_index.csv     # 60-day NEPSE index history
│   └── nepse_ohlc.csv      # 30-day OHLC data per stock
├── NEPSEInsight.pbix       # Power BI report
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- VS Code with Live Server extension

### Installation

```bash
# Clone the repo
git clone https://github.com/shaktidevkota/NEPSEInsight.git
cd NEPSEInsight

# Install dependencies
pip install flask flask-cors pandas

# Start the backend
cd backend
python app.py
```

Then open `frontend/index.html` with Live Server in VS Code.

The dashboard will be live at `http://127.0.0.1:5500/frontend/index.html`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/summary` | Market summary — index, turnover, breadth |
| GET | `/api/gainers` | Top 5 gaining stocks |
| GET | `/api/losers` | Top 5 losing stocks |
| GET | `/api/sectors` | Sector-wise average % change |
| GET | `/api/index-history` | 60-day index with MA7 & MA30 |
| GET | `/api/stocks` | All stocks |
| GET | `/api/stocks/<SYMBOL>` | Single stock detail |
| GET | `/api/ohlc/<SYMBOL>` | 30-day OHLC candlestick data |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Pandas |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Charts | Chart.js 4.4 |
| BI Report | Microsoft Power BI Desktop |
| Data | Sample CSV (Sharesansar-compatible format) |

---

## Roadmap

- [ ] Integrate `nepse-live` for real-time NEPSE data
- [ ] Add user watchlist with local storage
- [ ] Deploy backend to Render or Railway
- [ ] Deploy frontend to Netlify

---

## Author

**Shakti Devkota**  
BSc. CSIT · Bhaktapur Multiple Campus  
[Portfolio](https://shakti-devkota.netlify.app) · [GitHub](https://github.com/shaktidevkota)