import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Left Column - Logo and Info */}
            <div className="footer-col footer-brand-col">
              <div className="footer-logo-row">
                <img src="/hp-logo.png" alt="Government of Himachal Pradesh" className="footer-hp-logo" />
                <div>
                  <h3 className="footer-brand-title">Civil Hospital Arki</h3>
                  <p className="footer-brand-sub">Department of Health & Family Welfare</p>
                  <p className="footer-brand-sub">District Solan, Himachal Pradesh</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/tenders">Tenders & Quotations</Link></li>
                <li><Link to="/works-developments">Works & Developments</Link></li>
                <li><Link to="/notices">Public Notices</Link></li>
              </ul>
            </div>



            {/* Contact */}
            <div className="footer-col">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-links">
                <li><a href="tel:+919876543210">+91 98765 43210</a></li>
                <li><a href="mailto:contact@civilhospitalarki.in">contact@civilhospitalarki.in</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Civil Hospital Arki, District Solan, Himachal Pradesh. All rights reserved.</p>
          <p className="footer-nic">Developed & Maintained by NIC, Himachal Pradesh</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
