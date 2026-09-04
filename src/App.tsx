import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoutes';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans antialiased text-slate-800" id="app-root">
          {/* Navigation Header */}
          <Navbar />

          {/* Core Content Area */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Student / Admin Portal Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/portal" element={<DashboardPage />} />
              </Route>

              {/* Catch All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
