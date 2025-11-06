// src/pages/AdminDashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/admin';
  };

  return (
    <div className="admin-page">
      <h1>Админ-панель</h1>
      <p>Добро пожаловать! Выберите раздел для управления проектом.</p>
      
      <nav className="admin-nav">
        <ul>
          <li>
            <Link to="/admin/moderation">Модерация акций</Link>
          </li>
          <li>
            <Link to="/admin/published">Опубликованные акции</Link>
          </li>
          <li>
            <Link to="/admin/parsing">Управление парсингом</Link>
          </li>
          <li>
            {/* НОВАЯ ССЫЛКА */}
            <Link to="/admin/settings">Настройки (города, категории)</Link>
          </li>
        </ul>
      </nav>

      <button onClick={handleLogout} className="deletelink" style={{marginTop: '30px', fontSize: '1em'}}>Выйти</button>
    </div>
  );
}

export default AdminDashboard;