import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, TrendingUp } from 'lucide-react';
import CurrencySelector from './components/CurrencySelector';
import './index.css';

function App() {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [currencies, setCurrencies] = useState({});
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch currency list on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch('https://api.frankfurter.app/currencies');
        const data = await res.json();
        setCurrencies(data);
      } catch (err) {
        console.error('Error fetching currencies:', err);
      }
    };
    fetchCurrencies();
  }, []);

  // Fetch exchange rate when currencies change
  useEffect(() => {
    const fetchRate = async () => {
      if (fromCurrency === toCurrency) {
        setExchangeRate(1);
        setConvertedAmount(amount);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
        const data = await res.json();
        setExchangeRate(data.rates[toCurrency] / amount);
        setConvertedAmount(data.rates[toCurrency]);
      } catch (err) {
        console.error('Error fetching exchange rate:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (amount > 0) fetchRate();
    }, 500); // Debounce input

    return () => clearTimeout(timeoutId);
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="app-container">
      <div className="glass-card">
        <h1>Currency Converter</h1>
        
        <div className="converter-body">
          {/* From Section */}
          <div className="input-section">
            <span className="label">From</span>
            <div className="input-row">
              <input
                type="number"
                className="amount-input"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="0"
                placeholder="0.00"
              />
              <CurrencySelector
                selectedCurrency={fromCurrency}
                currencies={currencies}
                onCurrencyChange={setFromCurrency}
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="swap-button-container">
            <button className="swap-button" onClick={handleSwap} title="Swap Currencies">
              <ArrowLeftRight size={20} />
            </button>
          </div>

          {/* To Section */}
          <div className="input-section">
            <span className="label">To</span>
            <div className="input-row">
              <div className="amount-input" style={{ display: 'flex', alignItems: 'center' }}>
                {loading ? <div className="spinner"></div> : (convertedAmount?.toFixed(2) || '0.00')}
              </div>
              <CurrencySelector
                selectedCurrency={toCurrency}
                currencies={currencies}
                onCurrencyChange={setToCurrency}
              />
            </div>
          </div>

          {/* Result Summary */}
          {convertedAmount && !loading && (
            <div className="result-section">
              <div className="result-label">
                {amount} {fromCurrency} =
              </div>
              <div className="result-value">
                {convertedAmount.toFixed(4)} {toCurrency}
              </div>
              <div className="exchange-rate">
                <TrendingUp size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                1 {fromCurrency} = {exchangeRate?.toFixed(6)} {toCurrency}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
