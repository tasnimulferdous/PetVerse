import React from 'react';
import './PaymentAnimation.css';

const PaymentAnimation = ({ isProcessing }) => {
  if (!isProcessing) return null;

  return (
    <div className="payment-animation-overlay">
      <div className="payment-animation-container">
        <div className="payment-animation">
          <div className="payment-circle"></div>
          <div className="payment-checkmark">
            <div className="checkmark-stem"></div>
            <div className="checkmark-kick"></div>
          </div>
        </div>
        <p className="payment-text">Processing Payment...</p>
      </div>
    </div>
  );
};

export default PaymentAnimation; 