// src/components/CategoryBar.jsx
import React from 'react';
import './CategoryBar.css';

// Просто для примера - в идеале иконки должны приходить с бэкенда
// или быть SVG-компонентами
const iconMap = {
  'Еда': '🍔',
  'Продукты': '🍌',
  'Аптека': '💊',
  'Алкоголь': '🍷',
  'Для питомцев': '🐶',
  'Красота и Здоровье': '💄',
  // ... добавь свои
};

const CategoryBar = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="category-bar-container">
      <div className="category-bar">
        {categories.map(category => {
          const isSelected = selectedCategory && selectedCategory.id === category.id;
          return (
            <div 
              key={category.id} 
              className={`category-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(category)}
            >
              <div className="category-icon">
                {iconMap[category.name] || '🛍️'}
              </div>
              <span className="category-name">{category.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;