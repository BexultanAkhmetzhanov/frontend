import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api';
import '../App.css';

const API_BASE_URL = 'https://ig-parser-backend.onrender.com';

function AdminPromoEditPage() {
  const [promo, setPromo] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { promoId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const response = await apiClient.get(`/api/moderation-promo/${promoId}/`);
        setPromo(response.data);
        setEditedText(response.data.edited_text || response.data.raw_text);
        setConditions(response.data.conditions || '');
      } catch (err) {
        setError('Не удалось загрузить данные акции.');
      } finally {
        setLoading(false);
      }
    };
    fetchPromo();
  }, [promoId]);

  const handlePublish = async (event) => {
    event.preventDefault();
    try {
      console.log('Отправляем данные для публикации:', {
        edited_text: editedText,
        conditions: conditions,
        status: 'published'
      });
      
      const response = await apiClient.put(`/api/moderation-promo/${promoId}/`, {
        edited_text: editedText,
        conditions: conditions,
        status: 'published',
      });
      
      console.log('Ответ сервера:', response.data);
      alert('Акция успешно опубликована!');
      navigate('/admin/moderation');
    } catch (err) {
      console.error('Ошибка при публикации:', err);
      setError('Не удалось опубликовать акцию: ' + (err.response?.data?.detail || err.message));
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту акцию?')) {
        try {
            console.log('Отправляем запрос на удаление акции');
            
            const response = await apiClient.put(`/api/moderation-promo/${promoId}/`, {
                status: 'deleted',
            });
            
            console.log('Ответ сервера при удалении:', response.data);
            alert('Акция удалена!');
            navigate('/admin/moderation');
        } catch (err) {
            console.error('Ошибка при удалении:', err);
            setError('Не удалось удалить акцию: ' + (err.response?.data?.detail || err.message));
        }
    }
  }

  if (loading) return <div>Загрузка акции...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!promo) return <div>Акция не найдена.</div>;

  return (
    <div className="admin-page">
      <h1>Редактирование акции от "{promo.establishment.name}"</h1>
      <form onSubmit={handlePublish}>
        <h2>Медиафайлы</h2>
        <div className="promo-media-container">
          {promo.media.map(media => (
            <div key={media.id} className="media-item">
              {media.file_type === 'image' ? (
                <img src={`${API_BASE_URL}/media/${media.file_path}`} alt="Фото акции" />
              ) : (
                <video src={`${API_BASE_URL}/media/${media.file_path}`} controls />
              )}
            </div>
          ))}
        </div>

        <h2>Тексты</h2>
        <fieldset className="module">
          <div className="form-row">
            <label>Сырой текст из Instagram:</label>
            <div className="readonly-field">{promo.raw_text}</div>
          </div>
          <div className="form-row">
            <label htmlFor="edited_text">Отредактированный текст акции:</label>
            <textarea
              id="edited_text"
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label htmlFor="conditions">Условия и дни проведения:</label>
            <textarea
              id="conditions"
              value={conditions}
              onChange={e => setConditions(e.target.value)}
            />
          </div>
        </fieldset>
        
        <div className="submit-row">
          <button type="submit" className="default">Опубликовать</button>
          <button type="button" className="deletelink" onClick={handleDelete}>Удалить</button>
        </div>
      </form>
      <br />
      <Link to="/admin/moderation"> &larr; Назад к списку</Link>
    </div>
  );
}

export default AdminPromoEditPage;