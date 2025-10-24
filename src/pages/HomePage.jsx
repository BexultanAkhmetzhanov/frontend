import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LocationModal from '../components/LocationModal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../App.css'; 

const API_BASE_URL = 'https://ig-parser-project.fly.dev';
const API_PROMOTIONS_URL = `${API_BASE_URL}/api/promotions/`;
const API_LOCATIONS_URL = `${API_BASE_URL}/api/locations/`;

const REVERSE_GEOCODING_API_URL = 'https://api.geoapify.com/v1/geocode/reverse';
const GEOCODING_API_KEY = '1cf3a9dc4ffe4485ac05774e9f611682'; // Твой API ключ

function HomePage() {
  const [promotions, setPromotions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeLocation = async () => {
      let availableLocations = [];
      try {
        const response = await axios.get(API_LOCATIONS_URL);
        availableLocations = response.data;
        setLocations(availableLocations);
      } catch (err) {
        setError('Не удалось загрузить список городов.');
        setLoadingLocations(false);
        return;
      }

      const savedCity = localStorage.getItem('selectedCity');
      if (savedCity) {
        setSelectedCity(JSON.parse(savedCity));
        setLoadingLocations(false);
        return;
      }

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const geoResponse = await axios.get(REVERSE_GEOCODING_API_URL, {
                params: { lat: latitude, lon: longitude, apiKey: GEOCODING_API_KEY, lang: 'ru' }
              });
              const detectedCityName = geoResponse.data.features[0]?.properties.city;
              if (detectedCityName) {
                console.log(`GPS определил город: ${detectedCityName}`);
                let foundCity = null;
                for (const country of availableLocations) {
                  const cityMatch = country.cities.find(city => city.name.toLowerCase() === detectedCityName.toLowerCase());
                  if (cityMatch) {
                    foundCity = cityMatch;
                    break;
                  }
                }
                if (foundCity) {
                  handleCitySelect(foundCity);
                }
              }
            } catch (geoErr) {
              console.error("Ошибка при определении города по координатам:", geoErr);
            } finally {
              setLoadingLocations(false);
            }
          },
          (error) => {
            console.warn("Ошибка геолокации:", error.message);
            setLoadingLocations(false);
          }
        );
      } else {
        console.warn("Геолокация не поддерживается этим браузером.");
        setLoadingLocations(false);
      }
    };

    initializeLocation();
  }, []);


  useEffect(() => {
    if (!selectedCity) return;
    const fetchPromotions = async () => {
      setLoadingPromotions(true);
      setError(null);
      try {
        const response = await axios.get(`${API_PROMOTIONS_URL}?city=${selectedCity.id}`);
        setPromotions(response.data);
      } catch (err) {
        setError('Не удалось загрузить акции.');
      } finally {
        setLoadingPromotions(false);
      }
    };
    fetchPromotions();
  }, [selectedCity]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', JSON.stringify(city));
  };

  
  const handleChangeCityClick = () => {
    localStorage.removeItem('selectedCity');
    setSelectedCity(null);
    setPromotions([]); 
  };

  return (
    <div className="HomePage">
      <Header
        selectedCity={selectedCity}
        onChangeCityClick={handleChangeCityClick}
      />

      {!selectedCity && !loadingLocations && (
        <LocationModal
          locations={locations}
          onCitySelect={handleCitySelect}
          isLoading={loadingLocations}
        />
      )}

      <main className="content">
        {error && <p className="error">{error}</p>}
        {selectedCity && loadingPromotions && <p>Загрузка акций...</p>}
        
        {selectedCity && !loadingPromotions && (
          <div className="promotions-list">
            {promotions.length === 0 ? (
              <p>В этом городе пока нет опубликованных акций.</p>
            ) : (
              promotions.map(promo => {
                const firstMedia = promo.media && promo.media.length > 0 ? promo.media[0] : null;
                return (
                  <div key={promo.id} className="promotion-card">
                    {firstMedia && (firstMedia.file_type === 'image' ? (
                        <img src={`${API_BASE_URL}/media/${firstMedia.file_path}`} alt={`Акция от ${promo.establishment.name}`} className="promotion-media"/>
                      ) : (
                        <video src={`${API_BASE_URL}/media/${firstMedia.file_path}`} controls muted autoPlay loop className="promotion-media"/>
                      )
                    )}
                    <div className="promotion-content">
                      <h2>{promo.establishment.name}</h2>
                      <p>{promo.edited_text}</p>
                      <small>Опубликовано: {new Date(promo.published_at).toLocaleDateString()}</small>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;