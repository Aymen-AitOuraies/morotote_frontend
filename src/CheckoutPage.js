import React, { useState, useEffect, useCallback, useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaBars } from 'react-icons/fa';
import logo from './assets/logo.png';
import './CheckoutPage.css';

export default function CheckoutPage({ cart, subtotal }) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [total, setTotal] = useState(0);

  // Simplified city options with shipping costs
const cities = useMemo(() => [
{ name: 'Select a city', value: '', shipping: 0 },
 { name: 'Casablanca (35 DHS shipping)', value: 'casablanca', shipping: 35 },
{ name: 'Mohammedia (20 DHS shipping)', value: 'mohammedia', shipping: 20 },
{ name: 'Other Cities (40 DHS shipping)', value: 'other', shipping: 40 }
], []);
  // Calculate shipping cost based on selected city
useEffect(() => {
  const calculateShipping = (cityValue) => {
    const selectedCity = cities.find(c => c.value === cityValue);
    return selectedCity ? selectedCity.shipping : 0;
  };

  const newShippingCost = calculateShipping(formData.city);
  setShippingCost(newShippingCost);
  setTotal(subtotal + newShippingCost);
}, [formData.city, subtotal, cities]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage('');

    if (!validateForm()) {
      setSubmissionMessage('Please correct the errors in the form.');
      return;
    }

    if (cart.length === 0) {
      setSubmissionMessage('Your cart is empty. Please add items to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedCartItems = cart.map(item =>
        `- ${item.title} (Qty: ${item.quantity}) - ${item.price} DHS` +
        (item.selectedSize ? ` - Size: ${item.selectedSize}` : '') +
        (item.selectedColor ? ` - Color: ${item.selectedColor}` : '')
      ).join('\n');

      const orderDetails = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        cartItems: formattedCartItems,
        // rawCartItems: JSON.stringify(cart),
        subtotal: subtotal.toFixed(2) + ' DHS',
        shippingCost: shippingCost.toFixed(2) + ' DHS',
        shippingCity: formData.city,
        total: total.toFixed(2) + ' DHS',
        honeypot: "",
        redirect: "https://morotote.netlify.app/checkout",
        from_name: "Website Order Form",
        subject: `New Order from ${formData.firstName} ${formData.lastName}`,
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: '57d28a3f-512c-44a5-a06c-043a7c7bad65',
          ...orderDetails
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmissionMessage('Order placed successfully! We will contact you shortly.');
      } else {
        setSubmissionMessage(result.message || 'Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionMessage('Error submitting order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (cart.length === 0 && !window.location.pathname.includes('/checkout/success')) {
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
            <form onSubmit={handleSubmit}>
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
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={formErrors.city ? 'input-error' : ''}
                >
                  {cities.map((city, index) => (
                    <option key={index} value={city.value}>
                      {city.name}
                    </option>
                  ))}
                </select>
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
                <span>{shippingCost.toFixed(2)} DHS {formData.city && `(${cities.find(c => c.value === formData.city)?.name.split(' ')[0]})`}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{total.toFixed(2)} DHS</span>
              </div>
            </div>

            <div className="order-actions">
                {submissionMessage && <p className={submissionMessage.includes('successfully') ? 'success-message' : 'error-message'}>{submissionMessage}</p>}

                {cart.length === 0 ? (
                    <p className="error-message">Your cart is empty. Please add items to proceed.</p>
                ) : (
                    <>
                        {!isFormValid && (
                            <p className="fill-form-message">Please fill in all shipping information to place your order.</p>
                        )}
                        <button
                            type="submit"
                            className="submit-order-btn"
                            onClick={handleSubmit}
                            disabled={!isFormValid || isSubmitting || cart.length === 0}
                        >
                            {isSubmitting ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
