// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminModerationPage from './pages/AdminModerationPage';
import AdminPromoEditPage from './pages/AdminPromoEditPage';
import AdminParsingPage from './pages/AdminParsingPage';
import AdminSettingsPage from './pages/AdminSettingsPage'; // <-- Импорт новой страницы
import AdminPublishedPage from './pages/AdminPublishedPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Публичные маршруты --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        
        {/* --- Защищенные маршруты админки --- */}
        <Route 
          path="/admin/dashboard" 
          element={ <ProtectedRoute><AdminDashboard /></ProtectedRoute> } 
        />
        <Route 
          path="/admin/moderation" 
          element={ <ProtectedRoute><AdminModerationPage /></ProtectedRoute> } 
        />
        <Route 
          path="/admin/moderation/:promoId" 
          element={ <ProtectedRoute><AdminPromoEditPage /></ProtectedRoute> } 
        />
        <Route 
          path="/admin/parsing" 
          element={ <ProtectedRoute><AdminParsingPage /></ProtectedRoute> } 
        />
        {/* НОВЫЙ МАРШРУТ */}
        <Route 
          path="/admin/settings" 
          element={ <ProtectedRoute><AdminSettingsPage /></ProtectedRoute> } 
        />
        <Route 
          path="/admin/published" 
          element={ <ProtectedRoute><AdminPublishedPage /></ProtectedRoute> } 
        />
      </Routes>
      
    </Router>
  );
}

export default App;