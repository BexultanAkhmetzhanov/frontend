// src/pages/AdminParsingPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import '../App.css';

function AdminParsingPage() {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  
  const [selectedCityId, setSelectedCityId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSubcategoryId, setNewSubcategoryId] = useState('');

  // <<< НОВЫЕ СОСТОЯНИЯ ДЛЯ РУЧНОГО ПАРСИНГА >>>
  const [isParsing, setIsParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [locationsRes, categoriesRes] = await Promise.all([
          apiClient.get('/api/locations/'),
          apiClient.get('/api/admin/categories-with-subcategories/')
        ]);
        setLocations(locationsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) { setError('Не удалось загрузить справочные данные.'); }
      finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCityId) {
      setEstablishments([]);
      return;
    }
    const fetchEstablishments = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/admin/establishments/?city=${selectedCityId}`);
        setEstablishments(response.data);
      } catch (err) { setError('Не удалось загрузить список заведений.'); }
      finally { setLoading(false); }
    };
    fetchEstablishments();
  }, [selectedCityId]);

  const handleAddEstablishment = async (e) => {
    e.preventDefault();
    if (!newName || !newUrl || !newSubcategoryId || !selectedCityId) {
      alert('Пожалуйста, заполните все поля.');
      return;
    }
    try {
      const response = await apiClient.post('/api/admin/establishments/', {
        name: newName, instagram_url: newUrl, subcategory: newSubcategoryId, city: selectedCityId,
      });
      setEstablishments([...establishments, response.data]);
      setNewName(''); setNewUrl(''); setNewSubcategoryId('');
    } catch (err) { setError('Не удалось добавить заведение.'); }
  };

  const handleDeleteEstablishment = async (id) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await apiClient.delete(`/api/admin/establishments/${id}/`);
        setEstablishments(establishments.filter(est => est.id !== id));
      } catch (err) { setError('Не удалось удалить заведение.'); }
    }
  };
  
  // <<< НОВАЯ ФУНКЦИЯ ДЛЯ ЗАПУСКА ПАРСЕРА >>>
  const handleTriggerParse = async () => {
    setIsParsing(true);
    setParseMessage('');
    setError('');
    try {
        const response = await apiClient.post('/api/trigger-parse/');
        setParseMessage(response.data.message);
    } catch (err) {
        setError('Произошла ошибка при запуске парсинга.');
    } finally {
        setIsParsing(false);
    }
  };


  if (loading && !selectedCityId) {
    return <div className="admin-page"><p>Загрузка данных...</p></div>;
  }

  return (
    <div className="admin-page">
      <h1>Управление парсингом</h1>
      {error && <p className="error-message">{error}</p>}
      
      {/* <<< НОВЫЙ БЛОК ДЛЯ РУЧНОГО ЗАПУСКА >>> */}
      <div className="module">
        <h2>Запуск парсера</h2>
        <p>Нажмите кнопку, чтобы запустить процесс сбора новых акций со всех добавленных аккаунтов. Это может занять несколько минут.</p>
        <button onClick={handleTriggerParse} disabled={isParsing}>
            {isParsing ? 'Парсинг запущен...' : '🚀 Запустить парсинг сейчас'}
        </button>
        {parseMessage && <p style={{color: 'green', marginTop: '10px'}}>{parseMessage}</p>}
      </div>

      <p>Выберите город, чтобы просмотреть и добавить аккаунты для парсинга.</p>
      
      <div className="form-group">
        <label htmlFor="city-select">Город:</label>
        <select id="city-select" value={selectedCityId} onChange={e => setSelectedCityId(e.target.value)}>
          <option value="">-- Выберите город --</option>
          {locations.map(country => (
            <optgroup label={country.name} key={country.id}>
              {country.cities.map(city => (<option value={city.id} key={city.id}>{city.name}</option>))}
            </optgroup>
          ))}
        </select>
      </div>

      {selectedCityId && (
        <>
          <div className="module">
            <h2>Добавить новый аккаунт</h2>
            <form onSubmit={handleAddEstablishment} className="add-establishment-form">
              <input type="text" placeholder="Название заведения" value={newName} onChange={e => setNewName(e.target.value)} required />
              <input type="url" placeholder="https://instagram.com/username" value={newUrl} onChange={e => setNewUrl(e.target.value)} required />
              <select value={newSubcategoryId} onChange={e => setNewSubcategoryId(e.target.value)} required>
                <option value="">-- Выберите категорию --</option>
                {categories.map(cat => (
                  <optgroup label={cat.name} key={cat.id}>
                    {cat.subcategories.map(sub => (<option value={sub.id} key={sub.id}>{sub.name}</option>))}
                  </optgroup>
                ))}
              </select>
              <button type="submit">Добавить</button>
            </form>
          </div>

          <h2>Действующие аккаунты ({establishments.length})</h2>
          {loading ? <p>Загрузка заведений...</p> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Название</th><th>Instagram URL</th><th>Категория</th><th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {establishments.map(est => (
                  <tr key={est.id}>
                    <td>{est.name}</td>
                    <td><a href={est.instagram_url} target="_blank" rel="noopener noreferrer">{est.instagram_url}</a></td>
                    <td>{est.subcategory_name}</td>
                    <td><button className="deletelink" onClick={() => handleDeleteEstablishment(est.id)}>Удалить</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      <br />
      <Link to="/admin/dashboard"> &larr; Назад на дашборд</Link>
    </div>
  );
}

export default AdminParsingPage;