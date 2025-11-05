import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <p>&copy; {currentYear} PromoFinder. Все права защищены.</p>
      <p>Найди лучшие акции в своем городе!</p>
    </footer>
  );
};

export default Footer;