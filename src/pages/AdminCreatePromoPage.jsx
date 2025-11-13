// src/pages/AdminCreatePromoPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api'; // Наш настроенный axios
import '../App.css';

function AdminCreatePromoPage() {
  // Состояния для данных формы
  const [establishment, setEstablishment] = useState('');
  const [editedText, setEditedText] = useState('');
  const [conditions, setConditions] = useState('');
  const [mediaFiles, setMediaFiles] = useState(null); // Для хранения файлов
  
  // Состояния для списков из API
  const [allEstablishments, setAllEstablishments] = useState([]);
  
  // Состояния для UI
  const [loading, setLoading] = useState(false); // Блокировка кнопки
  const [loadingEst, setLoadingEst] = useState(true); // Загрузка списка
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  // 1. При загрузке страницы, получаем список всех заведений
  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        const response = await apiClient.get('/api/admin/establishments/');
        setAllEstablishments(response.data);
      } catch (err) {
        setError('Не удалось загрузить список заведений.');
      } finally {
        setLoadingEst(false);
      }
    };
    fetchEstablishments();
  }, []); // Пустой массив означает "запустить один раз при монтировании"

  // 2. Обработчик отправки формы
  const handleSubmit = async (event) => {
    event.preventDefault(); // Запрещаем HTML-форме перезагружать страницу

    if (!establishment || !editedText) {
      setError('Пожалуйста, выберите заведение и заполните текст акции.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // 3. Используем FormData
    // Это ОБЯЗАТЕЛЬНО для отправки файлов (multipart/form-data)
    const formData = new FormData();
    
    // Добавляем текстовые поля
    formData.append('establishment', establishment);
    formData.append('edited_text', editedText);
    formData.append('conditions', conditions);

    // 4. Добавляем медиафайлы
    // Бэкенд ожидает их под ключом 'media'
    if (mediaFiles) {
      for (let i = 0; i < mediaFiles.length; i++) {
        formData.append('media', mediaFiles[i]);
      }
    }

    try {
      // 5. Отправляем FormData на наш новый эндпоинт
      // axios (apiClient) сам выставит правильный заголовок Content-Type
      await apiClient.post('/api/admin/promotions/create/', formData);

      setSuccess('Акция успешно создана и опубликована!');
      
      // Очищаем форму
      setEstablishment('');
      setEditedText('');
      setConditions('');
      setMediaFiles(null);
      // Очищаем input type="file" (важно!)
      event.target.reset(); 
      
      // Через 2 секунды переводим на дашборд
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Ошибка при создании акции:', err);
      setError('Не удалось создать акцию. ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h1>Создать акцию вручную</h1>
      <p>Акция будет немедленно опубликована на сайте.</p>

      {/* Сообщения об успехе или ошибке */}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <fieldset className="module">
          <legend><h2>Данные акции</h2></legend>
          
          <div className="form-group">
            <label htmlFor="establishment">Заведение (отвечает за категорию)</label>
            <select
              id="establishment"
              value={establishment}
              onChange={e => setEstablishment(e.target.value)}
              required
              disabled={loadingEst}
            >
              <option value="">{loadingEst ? 'Загрузка заведений...' : '-- Выберите заведение --'}</option>
              {allEstablishments.map(est => (
                <option key={est.id} value={est.id}>
                  {est.name} ({est.subcategory_name})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edited_text">Текст акции</label>
            <textarea
              id="edited_text"
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              required
              disabled={loading}
              rows="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="conditions">Условия и дни проведения (необязательно)</label>
            <textarea
              id="conditions"
              value={conditions}
              onChange={e => setConditions(e.target.value)}
              disabled={loading}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="media">Фото/Видео (необязательно)</label>
            <input
              type="file"
              id="media"
              multiple // Позволяет выбирать несколько файлов
              onChange={e => setMediaFiles(e.target.files)}
              disabled={loading}
              accept="image/*,video/*" // Принимаем только фото и видео
            />
          </div>

        </fieldset>
        
        <div className="submit-row">
          <button type="submit" className="default" disabled={loading}>
            {loading ? 'Публикация...' : 'Опубликовать акцию'}
          </button>
        </div>

      </form>
      <br />
      <Link to="/admin/dashboard"> &larr; Назад на дашборд</Link>
    </div>
  );
}

export default AdminCreatePromoPage;