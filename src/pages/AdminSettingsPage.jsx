// src/pages/AdminSettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import '../App.css';

// Маленький компонент для управления одним списком (например, странами или категориями)
const ManagementSection = ({ title, items, onAddItem, onDeleteItem, children }) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    onAddItem(newItemName);
    setNewItemName('');
  };

  return (
    <div className="module">
      <h2>{title} ({items.length})</h2>
      <form onSubmit={handleAdd} className="add-establishment-form">
        <input
          type="text"
          placeholder={`Новое название...`}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          required
        />
        <button type="submit">Добавить</button>
      </form>
      <ul className="settings-list">
        {items.map(item => (
          <li key={item.id}>
            <span>{item.name}</span>
            <button className="deletelink" onClick={() => onDeleteItem(item.id)}>Удалить</button>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
};


function AdminSettingsPage() {
  // Состояния для всех справочников
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Состояния для UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загружаем все данные при первом рендере
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [countriesRes, citiesRes, categoriesRes, subcategoriesRes] = await Promise.all([
          apiClient.get('/api/admin/countries/'),
          apiClient.get('/api/admin/cities/'),
          apiClient.get('/api/admin/categories/'),
          apiClient.get('/api/admin/subcategories/'),
        ]);
        setCountries(countriesRes.data);
        setCities(citiesRes.data);
        setCategories(categoriesRes.data);
        setSubcategories(subcategoriesRes.data);
      } catch (err) {
        setError('Не удалось загрузить данные. Попробуйте обновить страницу.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);
  
  // --- Функции для CRUD-операций ---

  const handleAddItem = async (endpoint, name, setData, extraData = {}) => {
    try {
      const response = await apiClient.post(`/api/admin/${endpoint}/`, { name, ...extraData });
      setData(prevData => [...prevData, response.data]);
    } catch (err) {
      setError(`Не удалось добавить элемент в "${endpoint}".`);
    }
  };

  const handleDeleteItem = async (endpoint, id, setData) => {
    if (window.confirm('Вы уверены, что хотите удалить этот элемент? Это может затронуть связанные акции.')) {
      try {
        await apiClient.delete(`/api/admin/${endpoint}/${id}/`);
        setData(prevData => prevData.filter(item => item.id !== id));
      } catch (err) {
        setError(`Не удалось удалить элемент #${id} из "${endpoint}".`);
      }
    }
  };


  if (loading) {
    return <div className="admin-page"><p>Загрузка настроек...</p></div>;
  }

  return (
    <div className="admin-page">
      <h1>Настройки</h1>
      <p>Управление базовыми справочниками проекта.</p>
      {error && <p className="error-message">{error}</p>}
      
      <div className="settings-grid">
        <ManagementSection
          title="Страны"
          items={countries}
          onAddItem={(name) => handleAddItem('countries', name, setCountries)}
          onDeleteItem={(id) => handleDeleteItem('countries', id, setCountries)}
        />
        
        {/* Для городов нужна своя логика с выбором страны */}
        <div className="module">
          <h2>Города ({cities.length})</h2>
          <AddChildItemForm 
            parentItems={countries} 
            parentName="Страна"
            onAddItem={(name, parentId) => handleAddItem('cities', name, setCities, { country: parentId })}
          />
          <ul className="settings-list">
            {cities.map(item => (
              <li key={item.id}>
                <span>{item.name}</span>
                <button className="deletelink" onClick={() => handleDeleteItem('cities', item.id, setCities)}>Удалить</button>
              </li>
            ))}
          </ul>
        </div>
        
        <ManagementSection
          title="Категории"
          items={categories}
          onAddItem={(name) => handleAddItem('categories', name, setCategories)}
          onDeleteItem={(id) => handleDeleteItem('categories', id, setCategories)}
        />
        
        {/* Для подкатегорий своя логика с выбором категории */}
        <div className="module">
          <h2>Подкатегории ({subcategories.length})</h2>
          <AddChildItemForm 
            parentItems={categories} 
            parentName="Категория"
            onAddItem={(name, parentId) => handleAddItem('subcategories', name, setSubcategories, { category: parentId })}
          />
          <ul className="settings-list">
            {subcategories.map(item => (
              <li key={item.id}>
                <span>{item.name}</span>
                <button className="deletelink" onClick={() => handleDeleteItem('subcategories', item.id, setSubcategories)}>Удалить</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <br />
      <Link to="/admin/dashboard"> &larr; Назад на дашборд</Link>
    </div>
  );
}

// Вспомогательный компонент для формы добавления Города или Подкатегории
const AddChildItemForm = ({ parentItems, parentName, onAddItem }) => {
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !parentId) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }
        onAddItem(name, parentId);
        setName('');
        setParentId('');
    };

    return (
        <form onSubmit={handleSubmit} className="add-establishment-form">
            <input type="text" placeholder="Название..." value={name} onChange={e => setName(e.target.value)} required />
            <select value={parentId} onChange={e => setParentId(e.target.value)} required>
                <option value="">-- Выберите {parentName} --</option>
                {parentItems.map(item => (
                    <option value={item.id} key={item.id}>{item.name}</option>
                ))}
            </select>
            <button type="submit">Добавить</button>
        </form>
    );
};

export default AdminSettingsPage;