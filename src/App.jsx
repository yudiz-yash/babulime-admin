import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HeroPage from './pages/HeroPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import ProductsPage from './pages/ProductsPage';
import CareersPage from './pages/CareersPage';
import ContactSubmissions from './pages/ContactSubmissions';
import CareerApplications from './pages/CareerApplications';
import BannerPage from './pages/BannerPage';
import TimelinePage from './pages/TimelinePage';
import ManufacturingPage from './pages/ManufacturingPage';
import CompliancePage from './pages/CompliancePage';
import CertificationPage from './pages/CertificationPage';
import DistributionPage from './pages/DistributionPage';
import BrandingPage from './pages/BrandingPage';
import CTAPage from './pages/CTAPage';
import FooterPage from './pages/FooterPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="hero" element={<HeroPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="features" element={<FeaturesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="banner" element={<BannerPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="manufacturing" element={<ManufacturingPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="certification" element={<CertificationPage />} />
          <Route path="distribution" element={<DistributionPage />} />
          <Route path="branding" element={<BrandingPage />} />
          <Route path="cta" element={<CTAPage />} />
          <Route path="footer" element={<FooterPage />} />
          <Route path="contact-submissions" element={<ContactSubmissions />} />
          <Route path="applications" element={<CareerApplications />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
