import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaBars, FaPaperPlane } from 'react-icons/fa';
import logo from './assets/logo.png';
import './ContactPage.css';

export default function ContactPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: '57d28a3f-512c-44a5-a06c-043a7c7bad65',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || 'Not provided',
          message: formData.message,
          subject: 'New Contact Form Submission',
          // honeypot: "",
          redirect: "http://morotote.netlify.app/checkout",
          from_name: "Website Contact Form",
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='header'>
        <img src={logo} className="logo" alt="Logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}/>
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li onClick={() => navigate('/')}>Home</li>
          <li onClick={() => navigate('/products')}>Products</li>
          <li>Contact Us</li>
        </ul>
        <div className="header-right">
          {isMenuOpen ? (
            <FaTimes
              className="menu-icon"
              onClick={() => setIsMenuOpen(false)}
            />
          ) : (
            <FaBars
              className="menu-icon"
              onClick={() => setIsMenuOpen(true)}
            />
          )}
        </div>
      </div>

      <div className="contact-page-container">
        <h1>Contact Us</h1>
        <p className="contact-intro">Have questions or feedback? We'd love to hear from you!</p>

        <form onSubmit={handleSubmit} className="contact-form">
          {submitStatus === 'success' && (
            <div className="alert success">
              Thank you! Your message has been sent successfully.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="alert error">
              Something went wrong. Please try again later.
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name*</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name*</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message*</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows="5"
            ></textarea>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : (
              <>
                <FaPaperPlane /> Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
