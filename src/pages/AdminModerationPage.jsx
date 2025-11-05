// src/pages/AdminModerationPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import '../App.css';

function AdminModerationPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModerationList = async () => {
      try {
        const response = await apiClient.get('/api/moderation-list/');
        setPromotions(response.data);
      } catch (err) {
        setError('Не удалось загрузить список акций. Возможно, ваша сессия истекла.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModerationList();
  }, []);

  if (loading) {
    return <div className="admin-page"><h1>Модерация акций</h1><p>Загрузка...</p></div>;
  }

  if (error) {
    return <div className="admin-page"><h1>Ошибка</h1><p>{error}</p></div>;
  }

  return (
    <div className="admin-page">
      <h1>Модерация акций ({promotions.length})</h1>
      <p>Список акций, ожидающих проверки.</p>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Заведение</th>
            <th>Текст акции</th>
            <th>Дата сбора</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {promotions.length === 0 ? (
            <tr>
              <td colSpan="4">Нет акций для модерации.</td>
            </tr>
          ) : (
            promotions.map(promo => (
              <tr key={promo.id}>
                <td>{promo.establishment.name}</td>
                <td>
                  {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ --- */}
                  {/* Проверяем, есть ли promo.raw_text, и только потом применяем .substring() */}
                  {promo.raw_text ? promo.raw_text.substring(0, 100) + '...' : '[Текст отсутствует]'}
                </td>
                <td>{new Date(promo.created_at).toLocaleString('ru-RU')}</td>
                <td>
                  <Link to={`/admin/moderation/${promo.id}`}>Редактировать</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <br />
      <Link to="/admin/dashboard"> &larr; Назад на дашборд</Link>
    </div>
  );
}

export default AdminModerationPage;