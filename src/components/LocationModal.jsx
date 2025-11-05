import React from 'react';
import './LocationModal.css';  

const LocationModal = ({ locations, onCitySelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Загрузка городов...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Выберите ваш город</h2>
        <div className="locations-list">
          {locations.map(country => (
            <div key={country.id} className="country-section">
              <h3>{country.name}</h3>
              <ul>
                {country.cities.map(city => (
                  <li key={city.id} onClick={() => onCitySelect(city)}>
                    {city.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;