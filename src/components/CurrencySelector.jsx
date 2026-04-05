import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CurrencySelector = ({ label, selectedCurrency, currencies, onCurrencyChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div 
        className="dropdown-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="currency-code">{selectedCurrency}</span>
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.3s ease', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
          }} 
        />
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {Object.entries(currencies).map(([code, name]) => (
            <div
              key={code}
              className={`dropdown-item ${selectedCurrency === code ? 'active' : ''}`}
              onClick={() => {
                onCurrencyChange(code);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={selectedCurrency === code}
            >
              <div className="dropdown-item-info">
                <span className="currency-code">{code}</span>
                <span className="currency-name" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>
                   {name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
