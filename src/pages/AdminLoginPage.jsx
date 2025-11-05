import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; 

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setError(''); 
    setLoading(true); 

    try {
      const response = await axios.post('https://ig-parser-backend.onrender.com/api/token/', {
        username: username,
        password: password,
      });

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      window.location.href = '/admin/dashboard';

    } catch (err) {
      setError('Неверное имя пользователя или пароль.');
      console.error('Ошибка входа:', err);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-form-container">
        <h2>Вход для администратора</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              required
              disabled={loading} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
              disabled={loading} 
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;