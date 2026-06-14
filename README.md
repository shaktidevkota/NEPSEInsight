# NEPSEInsight — Nepal Stock Exchange Dashboard

A full-stack stock market analysis dashboard for NEPSE built with **Flask + HTML/CSS/JS**.

![Phase 2](https://img.shields.io/badge/Phase-2%20Complete-brightgreen) ![Python](https://img.shields.io/badge/Python-3.14-blue) ![Flask](https://img.shields.io/badge/Flask-3.1-lightgrey) ![Chart.js](https://img.shields.io/badge/Chart.js-4.4-orange)

## Project Structure

```
nepse-dashboard/
├── backend/
│   ├── app.py              # Flask REST API (8 endpoints)
│   └── requirements.txt
├── frontend/
│   ├── index.html          # Single-page dashboard
│   ├── style.css           # Dark theme, Nepal crimson accent
│   └── app.js              # Chart.js charts + fetch API
├── data/
│   ├── nepse_stocks.csv    # 33 NEPSE stocks with price data
│   ├── nepse_index.csv     # 60-day NEPSE index history
│   └── nepse_ohlc.csv      # 30-day OHLC data per stock (990 rows)
└── README.md
```

## Quickstart

### 1. Install Python dependencies
```bash
cd backend
pip install flask flask-cors pandas
```

### 2. Start the Flask API
```bash
python app.py
# Running on http://127.0.0.1:5000
```

### 3. Open the frontend
Open `frontend/index.html` with VS Code Live Server  
*(Right-click → Open with Live Server)*

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/summary` | Market summary — NEPSE index, turnover, breadth |
| `GET /api/gainers` | Top 5 gaining stocks |
| `GET /api/losers` | Top 5 losing stocks |
| `GET /api/sectors` | Sector-wise avg. % change |
| `GET /api/index-history` | 60-day NEPSE index + MA7 + MA30 |
| `GET /api/stocks` | All 33 stocks |
| `GET /api/stocks/<SYMBOL>` | Single stock detail |
| `GET /api/ohlc/<SYMBOL>` | 30-day OHLC candlestick data |

## Features

### Phase 1 ✅
- NEPSE Index hero with change indicator and market breadth bar
- 30-day index trend chart
- Top 5 gainers & losers tables
- Sector performance bar chart
- Searchable full stocks table with 52-week range

### Phase 2 ✅
- 60-day index trend with **MA7** and **MA30** moving average overlays
- **Candlestick modal** — click any stock row to view 30-day OHLC chart + volume
- 33 stocks across 6 sectors with realistic price history
- New OHLC API endpoint

### Phase 3 — Power BI (Coming Soon)
- Export cleaned CSV → import to Power BI Desktop
- Build a 1-page report with slicers by sector and date

## Tech Stack

| Layer | Tool |
|---|---|
| Backend | Python 3.14, Flask 3.1, Pandas |
| Frontend | HTML5, CSS3, Vanilla JS |
| Charts | Chart.js 4.4 |
| Data | Sample CSV (replace with Sharesansar / nepse-live) |

## Screenshots
> Add screenshots here after running the dashboard locally

## Future Improvements
- Wire up `nepse-live` Python package for real NEPSE data
- Add authentication and user watchlists
- Deploy backend to Render or Railway
- Deploy frontend to Netlify