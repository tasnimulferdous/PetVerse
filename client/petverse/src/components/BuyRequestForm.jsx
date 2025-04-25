import React, { useState } from 'react';
import './BuyRequestForm.css';

const BuyRequestForm = ({ product, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Buy Request for {product.name}</h3>
          <button className="close-modal-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form className="buy-request-form" onSubmit={handleSubmit}>
          <label>
            Name:
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            Phone:
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </label>
          <label>
            Address:
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
          </label>
          <label>
            City:
            <input type="text" name="city" value={formData.city} onChange={handleChange} required />
          </label>
          <label>
            Postal Code:
            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
          </label>
          <label>
            Country:
            <input type="text" name="country" value={formData.country} onChange={handleChange} required />
          </label>
          <div className="form-buttons">
            <button type="submit" className="submit-button">Submit</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyRequestForm;
