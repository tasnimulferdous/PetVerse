import React from 'react';
import './PaymentAnimation.css';

const PaymentAnimation = ({ isProcessing, isSuccess }) => {
  if (!isProcessing && !isSuccess) return null;

  return (
    <div className="payment-animation-overlay">
      <div className="payment-animation-container">
        <div className="payment-animation">
          {isProcessing && !isSuccess ? (
            <>
              <div className="payment-circle"></div>
              <div className="payment-spinner"></div>
            </>
          ) : (
            <div className="payment-success">
              <div className="checkmark-circle">
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
          )}
        </div>
        <p className="payment-text">
          {isProcessing && !isSuccess ? 'Processing Payment...' : 'Payment Successful!'}
        </p>
      </div>
    </div>
  );
};

export default PaymentAnimation; 