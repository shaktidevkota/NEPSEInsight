from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

def load_stocks():
    return pd.read_csv(os.path.join(DATA_DIR, 'nepse_stocks.csv'))

def load_index():
    df = pd.read_csv(os.path.join(DATA_DIR, 'nepse_index.csv'))
    df['date'] = pd.to_datetime(df['date'])
    return df

def load_ohlc():
    return pd.read_csv(os.path.join(DATA_DIR, 'nepse_ohlc.csv'))

# ── Market Summary ────────────────────────────────────────────────────────────
@app.route('/api/summary')
def summary():
    df  = load_stocks()
    idx = load_index()
    latest = idx.iloc[-1]
    prev   = idx.iloc[-2]
    gainers = int((df['change'] > 0).sum())
    losers  = int((df['change'] < 0).sum())
    return jsonify({
        'nepse_index':      round(float(latest['nepse_index']), 2),
        'index_change':     round(float(latest['nepse_index'] - prev['nepse_index']), 2),
        'index_change_pct': round(float((latest['nepse_index'] - prev['nepse_index']) / prev['nepse_index'] * 100), 2),
        'total_turnover':   float(latest['turnover']),
        'market_cap':       float(latest['market_cap']),
        'traded_shares':    float(latest['traded_shares']),
        'gainers':          gainers,
        'losers':           losers,
        'unchanged':        int(len(df) - gainers - losers),
        'total_stocks':     int(len(df)),
        'as_of_date':       latest['date'].strftime('%Y-%m-%d'),
    })

# ── Top Gainers ───────────────────────────────────────────────────────────────
@app.route('/api/gainers')
def gainers():
    df  = load_stocks()
    top = df[df['change'] > 0].nlargest(5, 'change_pct')
    return jsonify(top[['symbol','company','ltp','change','change_pct','volume']].to_dict(orient='records'))

# ── Top Losers ────────────────────────────────────────────────────────────────
@app.route('/api/losers')
def losers():
    df  = load_stocks()
    top = df[df['change'] < 0].nsmallest(5, 'change_pct')
    return jsonify(top[['symbol','company','ltp','change','change_pct','volume']].to_dict(orient='records'))

# ── Sector Performance ────────────────────────────────────────────────────────
@app.route('/api/sectors')
def sectors():
    df  = load_stocks()
    sec = (df.groupby('sector')
             .agg(avg_change=('change_pct','mean'),
                  total_turnover=('turnover','sum'),
                  stock_count=('symbol','count'))
             .reset_index().round(2))
    return jsonify(sec.to_dict(orient='records'))

# ── Index History + Moving Averages ──────────────────────────────────────────
@app.route('/api/index-history')
def index_history():
    df = load_index()
    df['ma7']  = df['nepse_index'].rolling(7,  min_periods=1).mean().round(2)
    df['ma30'] = df['nepse_index'].rolling(30, min_periods=1).mean().round(2)
    df['date'] = df['date'].dt.strftime('%Y-%m-%d')
    return jsonify(df[['date','nepse_index','turnover','ma7','ma30']].to_dict(orient='records'))

# ── All Stocks ────────────────────────────────────────────────────────────────
@app.route('/api/stocks')
def stocks():
    df = load_stocks()
    return jsonify(df.to_dict(orient='records'))

# ── Single Stock ──────────────────────────────────────────────────────────────
@app.route('/api/stocks/<symbol>')
def stock_detail(symbol):
    df  = load_stocks()
    row = df[df['symbol'] == symbol.upper()]
    if row.empty:
        return jsonify({'error': 'Stock not found'}), 404
    return jsonify(row.iloc[0].to_dict())

# ── OHLC for Candlestick ──────────────────────────────────────────────────────
@app.route('/api/ohlc/<symbol>')
def ohlc(symbol):
    df  = load_ohlc()
    row = df[df['symbol'] == symbol.upper()].copy()
    if row.empty:
        return jsonify({'error': 'No OHLC data'}), 404
    row = row.sort_values('date')
    return jsonify(row[['date','open','high','low','close','volume']].to_dict(orient='records'))

if __name__ == '__main__':
    print("Starting Flask...")
    app.run(debug=False, port=5000)