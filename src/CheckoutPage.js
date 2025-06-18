import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { FaTimes, FaBars } from 'react-icons/fa';
import logo from './assets/logo.png';
import './CheckoutPage.css';

export default function CheckoutPage({ cart, subtotal, shippingCost, total }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  const EXCHANGE_RATE_USD_TO_DHS = 10.0;

  const validateForm = useCallback(() => {
    let errors = {};
    let valid = true;

    if (!formData.firstName.trim()) {
      errors.firstName = 'First Name is required';
      valid = false;
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last Name is required';
      valid = false;
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
      valid = false;
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      valid = false;
    }
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
      valid = false;
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required';
      valid = false;
    }
    if (!formData.zipCode.trim()) {
      errors.zipCode = 'Zip Code is required';
      valid = false;
    }

    if (cart.length === 0) {
      valid = false;
    }

    setFormErrors(errors);
    setIsFormValid(valid);
    return valid;
  }, [formData, cart]);

  useEffect(() => {
    validateForm();
  }, [formData, cart, validateForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createOrder = (data, actions) => {
    const totalUSD = total / EXCHANGE_RATE_USD_TO_DHS;
    const subtotalUSD = subtotal / EXCHANGE_RATE_USD_TO_DHS;
    const shippingCostUSD = shippingCost / EXCHANGE_RATE_USD_TO_DHS;
    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: totalUSD.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: subtotalUSD.toFixed(2)
            },
            shipping: {
              currency_code: "USD",
              value: shippingCostUSD.toFixed(2)
            }
          }
        },
        items: cart.map(item => ({
          name: item.title,
          quantity: item.quantity,
          unit_amount: {
            currency_code: "USD",
            value: (parseFloat(item.price) / EXCHANGE_RATE_USD_TO_DHS).toFixed(2)
          },
        }))
      }]
    });
  };

  const onApprove = async (data, actions) => {
    setIsProcessingPayment(true);
    try {
      const details = await actions.order.capture();

      // Send payment and shipping data to your backend
      const verificationResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          paymentDetails: details,
          shippingInfo: formData,
          cartItems: cart
        })
      });

      const verificationData = await verificationResponse.json();

      if (verificationData.success) {
        navigate('/checkout/success', { state: {
          paymentDetails: details,
          shippingInfo: formData,
          orderItems: cart
        }});
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const onError = (err) => {
    console.error("PayPal Checkout Error:", err);
    alert('An error occurred during payment processing. Please try again.');
  };

  const onCancel = (data) => {
    console.log('Payment cancelled by user:', data);
  };

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  return (
    <>
      <div className='header'>
        <img src={logo} className="logo" alt="Logo"/>
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li onClick={() => navigate('/')}>Home</li>
          <li onClick={() => navigate('/products')}>Products</li>
          <li onClick={() => navigate('/contact')}>Contact Us</li>
        </ul>
        <div className="header-right">
          <button
            className="continue-shopping-btn"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>

          {isMenuOpen ? (
            <FaTimes className="menu-icon" onClick={() => setIsMenuOpen(false)}/>
          ) : (
            <FaBars className="menu-icon" onClick={() => setIsMenuOpen(true)}/>
          )}
        </div>
      </div>

      <div className="checkout-page-container">
        <h2>Checkout</h2>

        <div className="checkout-content">
          <div className="customer-info-form">
            <h3>Shipping Information</h3>
            <form>
              <div className="form-group">
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={formErrors.firstName ? 'input-error' : ''}
                />
                {formErrors.firstName && <span className="error-text">{formErrors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name:</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={formErrors.lastName ? 'input-error' : ''}
                />
                {formErrors.lastName && <span className="error-text">{formErrors.lastName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? 'input-error' : ''}
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={formErrors.phone ? 'input-error' : ''}
                />
                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={formErrors.address ? 'input-error' : ''}
                />
                {formErrors.address && <span className="error-text">{formErrors.address}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="city">City:</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={formErrors.city ? 'input-error' : ''}
                />
                {formErrors.city && <span className="error-text">{formErrors.city}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="zipCode">Zip Code:</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className={formErrors.zipCode ? 'input-error' : ''}
                />
                {formErrors.zipCode && <span className="error-text">{formErrors.zipCode}</span>}
              </div>
            </form>
          </div>

          <div className="order-summary-and-payment">
            <h3>Order Summary</h3>
            <div className="summary-details">
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="summary-item">
                  <span>{item.title} ({item.quantity})</span>
                  {item.selectedSize && <span> - Size: {item.selectedSize}</span>}
                  {item.selectedColor && <span> - Color: {item.selectedColor}</span>}
                  <span>{(parseFloat(item.price) * item.quantity).toFixed(2)} DHS</span>
                </div>
              ))}
              <hr />
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{subtotal.toFixed(2)} DHS</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{shippingCost.toFixed(2)} DHS</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{total.toFixed(2)} DHS</span>
              </div>
            </div>

            {cart.length === 0 ? (
                <p className="error-message">Your cart is empty. Please add items to proceed.</p>
            ) : (
                <>
                    {isFormValid ? (
                    <div className="paypal-buttons-container">
                        <h3>Pay with PayPal</h3>
                        {isProcessingPayment && <div className="payment-loading">Processing your payment...</div>}
                        <PayPalScriptProvider options={{
                          "client-id": PAYPAL_CLIENT_ID,
                          "currency": "USD"
                        }}>
                            <PayPalButtons
                                style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
                                createOrder={createOrder}
                                onApprove={onApprove}
                                onError={onError}
                                onCancel={onCancel}
                                disabled={isProcessingPayment}
                            />
                        </PayPalScriptProvider>
                    </div>
                    ) : (
                        <p className="fill-form-message">Please fill in all shipping information to enable payment.</p>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
