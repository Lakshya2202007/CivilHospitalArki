import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './Header.css';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Tenders & Quotations', path: '/tenders' },
  { label: 'Works & Developments', path: '/works-developments' },
  { label: 'Public Notices', path: '/notices' },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    if (lang === 'hi') {
      document.cookie = "googtrans=/en/hi; path=/";
    } else {
      document.cookie = "googtrans=/en/en; path=/";
    }
    window.location.reload();
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };
  const currentLang = getCookie('googtrans') === '/en/hi' ? 'hi' : 'en';

  const hideSearchPages = ['/tenders', '/works-developments', '/notices'];
  const shouldShowSearch = !hideSearchPages.includes(location.pathname);

  return (
    <header className="header">
      {/* Top thin blue bar */}
      <div className="top-bar">
        <div className="container flex justify-end items-center">
          <div className="language-selector">
            <span className="lang-icon">A</span> 
            <select 
              onChange={handleLanguageChange} 
              defaultValue={currentLang}
              style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: '2px 4px'
              }}
            >
              <option value="en" style={{color: 'black'}}>English</option>
              <option value="hi" style={{color: 'black'}}>हिन्दी</option>
            </select>
          </div>
          <div id="google_translate_element" style={{display: 'none'}}></div>
        </div>
      </div>

      {/* Main Brand Section */}
      <div className="brand-bar">
        <div className="container flex items-center justify-between">
          <div className="logo-section">
            <img src="/hp-logo.png" alt="Government of Himachal Pradesh" className="hp-logo" />
            <div className="logo-text">
              <span className="district-text">GOVERNMENT OF HIMACHAL PRADESH</span>
            </div>
          </div>
          
          
          {shouldShowSearch && (
            <div className="search-box">
              <form onSubmit={handleSearch} className="search-box-inner flex">
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="search-input" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">
                  <Search size={18} color="white" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="header-nav">
        <div className="container">
          <ul className="nav-list flex">
            {navItems.map((item) => (
              <li
                key={item.path}
                className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
              >
                <Link to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
