// src/pages/AdminPublishedPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import '../App.css';

// ✅ 1. ИЗМЕНИ НАЗВАНИЕ
function AdminPublishedPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublishedList = async () => {
      try {
        // ✅ 2. ИЗМЕНИ API-ЭНДПОИНТ
        const response = await apiClient.get('/api/published-list/');
        setPromotions(response.data);
      } catch (err) {
        setError('Не удалось загрузить список акций. Возможно, ваша сессия истекла.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublishedList();
  }, []);

  if (loading) {
    // ✅ 3. ИЗМЕНИ ЗАГОЛОВОК
    return <div className="admin-page"><h1>Опубликованные акции</h1><p>Загрузка...</p></div>;
  }

  if (error) {
    return <div className="admin-page"><h1>Ошибка</h1><p>{error}</p></div>;
  }

  return (
    <div className="admin-page">
      {/* ✅ 4. ИЗМЕНИ ЗАГОЛОВКИ И ТЕКСТ */}
      <h1>Опубликованные акции ({promotions.length})</h1>
      <p>Список акций, которые уже опубликованы на сайте.</p>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Заведение</th>
            <th>Текст акции</th>
            <th>Дата публикации</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {promotions.length === 0 ? (
            <tr>
              <td colSpan="4">Нет опубликованных акций.</td>
            </tr>
          ) : (
            promotions.map(promo => (
              <tr key={promo.id}>
                <td>{promo.establishment.name}</td>
                <td>
                  {promo.edited_text ? promo.edited_text.substring(0, 100) + '...' : (promo.raw_text ? promo.raw_text.substring(0, 100) + '...' : '[Текст отсутствует]')}
                </td>
                {/* Используем 'published_at' вместо 'created_at' */}
                <td>{new Date(promo.published_at).toLocaleString('ru-RU')}</td>
                <td>
                  {/* Ссылка та же самая! Она будет работать. */}
                  <Link to={`/admin/moderation/${promo.id}`} state={{ from: '/admin/published' }}>Редактировать</Link>
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

// ✅ 5. ИЗМЕНИ ЭКСПОРТ
export default AdminPublishedPage;