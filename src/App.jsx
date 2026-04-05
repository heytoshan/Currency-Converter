import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, TrendingUp, RefreshCw } from 'lucide-react';
import CurrencySelector from './components/CurrencySelector';
import './index.css';

// Hardcoded fallback for common currencies to ensure the UI is never "empty"
const INITIAL_CURRENCIES = {
  USD: "United States Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  INR: "Indian Rupee",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  SGD: "Singapore Dollar"
};

function App() {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [currencies, setCurrencies] = useState(INITIAL_CURRENCIES);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch full currency list on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        // Try Primary API
        const res = await fetch('https://api.frankfurter.app/currencies');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCurrencies(prev => ({ ...prev, ...data }));
      } catch (err) {
        try {
          // Try Secondary API (ExchangeRate-API)
          const res2 = await fetch('https://open.er-api.com/v6/latest/USD');
          const data2 = await res2.json();
          const codes = Object.keys(data2.rates);
          const nameMap = {};
          codes.forEach(c => { nameMap[c] = c; }); // Just use codes as names for fallback
          setCurrencies(prev => ({ ...prev, ...nameMap }));
        } catch (err2) {
          console.warn('All currency APIs failed, using hardcoded fallback.');
        }
      }
    };
    fetchCurrencies();
  }, []);

  // Use a second API as fallback for conversion if one fails
  const fetchConversion = async (amt, from, to) => {
    try {
      // Primary API
      const res = await fetch(`https://api.frankfurter.app/latest?amount=${amt}&from=${from}&to=${to}`);
      if (!res.ok) throw new Error('Frankfurter failed');
      const data = await res.json();
      return { 
        converted: data.rates[to], 
        rate: data.rates[to] / amt 
      };
    } catch (e) {
      // Fallback API (ExchangeRate-API)
      try {
        const res2 = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        const data2 = await res2.json();
        const rate = data2.rates[to];
        return { 
          converted: amt * rate, 
          rate: rate 
        };
      } catch (e2) {
        throw new Error('Both APIs failed');
      }
    }
  };

  const handleConvert = async () => {
    if (amount <= 0) return;
    
    if (fromCurrency === toCurrency) {
      setExchangeRate(1);
      setConvertedAmount(amount);
      return;
    }
    
    setLoading(true);
    try {
      const data = await fetchConversion(amount, fromCurrency, toCurrency);
      setConvertedAmount(data.converted);
      setExchangeRate(data.rate);
    } catch (err) {
      console.error('Logic Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-convert on currency change or debounced amount change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleConvert();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = (e) => {
    e.stopPropagation();
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <>
      <div className="aurora aurora-1"></div>
      <div className="aurora aurora-2"></div>
      
      <div className="app-container">
        <div className="glass-container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
             <RefreshCw size={24} style={{ color: 'var(--primary)', animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
             <h1 style={{ margin: 0 }}>Advanced Converter</h1>
          </div>
          
          <div className="converter-body">
            {/* From Input */}
            <div className="input-card">
              <span className="label">I have</span>
              <div className="input-row">
                <input
                  type="number"
                  className="amount-input"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  min="0"
                />
                <CurrencySelector
                  selectedCurrency={fromCurrency}
                  currencies={currencies}
                  onCurrencyChange={setFromCurrency}
                />
              </div>
            </div>

            <div className="swap-button-wrapper">
              <button 
                className="swap-btn" 
                onClick={handleSwap} 
                aria-label="Swap currencies"
              >
                <ArrowLeftRight size={24} />
              </button>
            </div>

            {/* To Input */}
            <div className="input-card">
              <span className="label">I want to get</span>
              <div className="input-row">
                <div className="amount-display" style={{ opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Calculating...' : (convertedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00')}
                </div>
                <CurrencySelector
                  selectedCurrency={toCurrency}
                  currencies={currencies}
                  onCurrencyChange={setToCurrency}
                />
              </div>
            </div>

            {/* Final Conversion Logic View */}
            {convertedAmount && !loading && (
              <div className="result-display">
                <div className="result-formula">
                  {amount.toLocaleString()} {fromCurrency} ≈
                </div>
                <div className="result-main">
                  {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} 
                  <span style={{ color: 'var(--primary)', marginLeft: '12px' }}>{toCurrency}</span>
                </div>
                <div className="rate-info">
                  <TrendingUp size={14} />
                  1 {fromCurrency} = {exchangeRate?.toFixed(6)} {toCurrency}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer style={{ marginTop: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
          Real-time rates sourced from multiple open data providers
        </footer>
      </div>
    </>
  );
}

export default App;
