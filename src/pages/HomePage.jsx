import React, { useState, useEffect, useMemo } from 'react'; // <-- Добавлен useMemo
import axios from 'axios';
import LocationModal from '../components/LocationModal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryBar from '../components/CategoryBar';
import SubcategoryFilter from '../components/SubcategoryFilter';
// --- Мы добавим эти компоненты в следующих шагах ---
// import CategoryBar from '../components/CategoryBar'; 
// import SubcategoryFilter from '../components/SubcategoryFilter';
import '../App.css'; 

const API_BASE_URL = 'https://ig-parser-backend.onrender.com';
//const API_BASE_URL = 'http://127.0.0.1:8000';

const API_PROMOTIONS_URL = `${API_BASE_URL}/api/promotions/`;
const API_LOCATIONS_URL = `${API_BASE_URL}/api/locations/`;
const API_CATEGORIES_URL = `${API_BASE_URL}/api/categories/`; // <-- ✅ НОВЫЙ URL

const REVERSE_GEOCODING_API_URL = 'https://api.geoapify.com/v1/geocode/reverse';
const GEOCODING_API_KEY = '1cf3a9dc4ffe4485ac05774e9f611682';

function HomePage() {
  // --- Старые состояния ---
  const [promotions, setPromotions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  // const [loadingLocations, setLoadingLocations] = useState(true); // <-- Заменено
  const [error, setError] = useState(null);
  
  // --- ✅ НОВЫЕ СОСТОЯНИЯ ---
  const [categories, setCategories] = useState([]);
  const [loadingInitialData, setLoadingInitialData] = useState(true); // <-- Единый лоадер
  const [selectedCategory, setSelectedCategory] = useState(null); // (например, { id: 1, ... })
  const [selectedSubcategory, setSelectedSubcategory] = useState(null); // (например, { id: 5, ... })

  // --- 🔄 ОБНОВЛЕННЫЙ useEffect ДЛЯ ЗАГРУЗКИ ВСЕХ ДАННЫХ ---
  useEffect(() => {
    // Переименовали, так как теперь грузит всё (города + категории)
    const initializeData = async () => {
      let availableLocations = [];
      try {
        // Запускаем загрузку городов и категорий ПАРАЛЛЕЛЬНО
        const [locationsRes, categoriesRes] = await Promise.all([
          axios.get(API_LOCATIONS_URL),
          axios.get(API_CATEGORIES_URL) // <-- Загружаем категории
        ]);
        
        availableLocations = locationsRes.data;
        setLocations(availableLocations);
        setCategories(categoriesRes.data); // <-- Сохраняем категории
        
      } catch (err) {
        setError('Не удалось загрузить данные для старта. Обновите страницу.');
        setLoadingInitialData(false);
        return;
      }

      // --- Логика определения города (остается без изменений) ---
      const savedCity = localStorage.getItem('selectedCity');
      if (savedCity) {
        setSelectedCity(JSON.parse(savedCity));
        setLoadingInitialData(false);
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
              setLoadingInitialData(false);
            }
          },
          (error) => {
            console.warn("Ошибка геолокации:", error.message);
            setLoadingInitialData(false);
          }
        );
      } else {
        console.warn("Геолокация не поддерживается этим браузером.");
        setLoadingInitialData(false);
      }
    };

    initializeData();
  }, []); // <-- Пустой массив, запускается 1 раз


  // --- useEffect для загрузки акций (без изменений) ---
  useEffect(() => {
    if (!selectedCity) return;
    const fetchPromotions = async () => {
      setLoadingPromotions(true);
      setError(null);
      // Сбрасываем фильтры при смене города
      setSelectedCategory(null);
      setSelectedSubcategory(null);
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
  }, [selectedCity]); // <-- Запускается, когда меняется город


  // --- ✅ НОВАЯ ЛОГИКА: ФИЛЬТРАЦИЯ АКЦИЙ НА КЛИЕНТЕ ---
  const filteredPromotions = useMemo(() => {
    // Начинаем с полного списка
    let promos = promotions;

    // 1. Если выбрана КОНКРЕТНАЯ подкатегория (например, "FastFood")
    if (selectedSubcategory) {
      // Нам нужен ТОЛЬКО этот фильтр.
      return promos.filter(promo => 
        promo.establishment.subcategory?.id === selectedSubcategory.id
      );
    }
    
    // 2. Если выбрана только ГЛАВНАЯ категория (например, "Food", а в "таблетках" выбрано "Все")
    if (selectedCategory) {
      // Мы не можем фильтровать по ID категории, так как у нас его нет.
      // НО мы можем отфильтровать по СПИСКУ подкатегорий, которые принадлежат этой категории.
      
      // 1. Получаем ID всех подкатегорий (например, [5, 6, 7] для "Food")
      const subcategoryIds = selectedCategory.subcategories.map(sub => sub.id);
      
      // 2. Фильтруем акции: "Покажи, если subcategory.id акции есть в этом списке"
      return promos.filter(promo =>
        subcategoryIds.includes(promo.establishment.subcategory?.id)
      );
    }

    // 3. Если не выбрано НИЧЕГО (ни категории, ни подкатегории)
    return promos; // Показываем все
    
  }, [promotions, selectedCategory, selectedSubcategory]); // <-- Пересчет при смене


  // --- Обработчики (без изменений) ---
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', JSON.stringify(city));
  };

  const handleChangeCityClick = () => {
    localStorage.removeItem('selectedCity');
    setSelectedCity(null);
    setPromotions([]); 
  };
  
  // --- ✅ НОВЫЕ ОБРАБОТЧИКИ ДЛЯ ФИЛЬТРОВ ---
  const handleSelectCategory = (category) => {
    // Если кликнули по той же категории, сбрасываем ее
    if (selectedCategory && selectedCategory.id === category.id) {
      setSelectedCategory(null);
      setSelectedSubcategory(null); // Сбрасываем и подкатегорию
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null); // Сбрасываем подкатегорию при смене главной
    }
  };
  
  const handleSelectSubcategory = (subcategory) => {
    // subcategory может быть null, если нажали "Все"
    if (subcategory === null) {
      setSelectedSubcategory(null);
    } else if (selectedSubcategory && selectedSubcategory.id === subcategory.id) {
      // Если кликнули по той же подкатегории, сбрасываем
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategory);
    }
  };


  return (
    <div className="HomePage">
      <Header
        selectedCity={selectedCity}
        onChangeCityClick={handleChangeCityClick}
      />

      {/* Модальное окно (без изменений) */}
      {!selectedCity && !loadingInitialData && (
        <LocationModal
          locations={locations}
          onCitySelect={handleCitySelect}
          isLoading={loadingInitialData}
        />
      )}

      <main className="content">
        
        
        {!loadingInitialData && (
          <CategoryBar 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleSelectCategory}
          />
        )}
        
        {selectedCategory && (
          <SubcategoryFilter 
            key={selectedCategory.id} // <-- Сбрасываем состояние при смене категории
            subcategories={selectedCategory.subcategories}
            selectedSubcategory={selectedSubcategory}
            onSelect={handleSelectSubcategory}
          />
        )}
        
        {/* --- КОНЕЦ БУДУЩИХ КОМПОНЕНТОВ --- */}


        {error && <p className="error">{error}</p>}
        {selectedCity && loadingPromotions && <p>Загрузка акций...</p>}
        
        {selectedCity && !loadingPromotions && (
          <div className={`promotions-list ${filteredPromotions.length === 1 ? 'single-item' : ''}`}>
            
            {/* ✅ ИСПОЛЬЗУЕМ filteredPromotions */}
            {filteredPromotions.length === 0 ? (
              <p>По вашим фильтрам ничего не найдено.</p>
            ) : (
              // ✅ ИСПОЛЬЗУЕМ filteredPromotions
              filteredPromotions.map(promo => {
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
                      {/* Убедимся, что subcategory существует перед отрисовкой */}
                      <p className="subcategory-tag">{promo.establishment.subcategory?.name || 'Акция'}</p>
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