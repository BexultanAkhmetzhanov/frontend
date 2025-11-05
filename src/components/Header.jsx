import React from 'react';
import './Header.css';

const Header = ({ selectedCity, onChangeCityClick }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          PromoFinder ✨
        </div>
        <div className="location-display">
          <span>Акции в городе: <strong>{selectedCity ? selectedCity.name : '...'}</strong></span>
          {selectedCity && (
            <button onClick={onChangeCityClick} className="change-city-btn">
              Сменить город
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;