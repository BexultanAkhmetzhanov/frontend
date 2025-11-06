// src/components/SubcategoryFilter.jsx
import React from 'react';
import './SubcategoryFilter.css';

const SubcategoryFilter = ({ subcategories, selectedSubcategory, onSelect }) => {
  
  // Добавляем "Все" в начало списка, чтобы можно было сбросить фильтр
  const allOption = { id: null, name: 'Все' };
  const allSubcategories = [allOption, ...subcategories];

  return (
    <div className="subcategory-filter-container">
      {allSubcategories.map(sub => {
        // Определяем, выбрана ли эта "таблетка"
        const isSelected = (selectedSubcategory === null && sub.id === null) || 
                           (selectedSubcategory && sub.id === selectedSubcategory.id);
        
        return (
          <button
            key={sub.id || 'all'}
            className={`filter-pill ${isSelected ? 'selected' : ''}`}
            // Если нажали "Все", передаем null, иначе - объект подкатегории
            onClick={() => onSelect(sub.id === null ? null : sub)}
          >
            {sub.name}
          </button>
        );
      })}
    </div>
  );
};

export default SubcategoryFilter;