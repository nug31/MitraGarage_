import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Calendar,
  Car,
  Star,
  Settings,
  Users,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  ShoppingBag
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ServiceBooking from './components/ServiceBooking';
import VehicleHistory from './components/VehicleHistory';
import Testimonials from './components/Testimonials';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import Register from './components/Register';
import CustomerDashboard from './components/CustomerDashboard';
import BrowseItems from './components/BrowseItems';
import CustomerBooking from './components/CustomerBooking';
import MyOrders from './components/MyOrders';
import UserManagement from './components/UserManagement';
import ReportsAnalytics from './components/ReportsAnalytics';
import NotificationBadge from './components/NotificationBadge';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setAuthToken(token);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    }
  }, []);

  const handleLogin = (user: any, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setCurrentUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    setShowRegister(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    // Optionally show a success message or auto-login
  };

  // Menu items based on user role
  const getMenuItems = () => {
    if (currentUser?.role === 'customer') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
        { id: 'browse', label: 'Browse Items', icon: Package, color: 'from-green-500 to-green-600' },
        { id: 'booking', label: 'My Bookings', icon: Calendar, color: 'from-purple-500 to-purple-600' },
        { id: 'orders', label: 'My Orders', icon: ShoppingBag, color: 'from-orange-500 to-orange-600' }
      ];
    }

    // Owner has access to everything
    if (currentUser?.role === 'owner') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
        { id: 'inventory', label: 'Inventaris', icon: Package, color: 'from-green-500 to-green-600' },
        { id: 'booking', label: 'Booking Servis', icon: Calendar, color: 'from-purple-500 to-purple-600' },
        { id: 'history', label: 'Riwayat Kendaraan', icon: Car, color: 'from-orange-500 to-orange-600' },
        { id: 'testimonials', label: 'Testimoni', icon: Star, color: 'from-yellow-500 to-yellow-600' },
        { id: 'admin', label: 'Admin Panel', icon: Settings, color: 'from-red-500 to-red-600' },
        { id: 'users', label: 'User Management', icon: Users, color: 'from-indigo-500 to-indigo-600' },
        { id: 'reports', label: 'Reports & Analytics', icon: Bell, color: 'from-pink-500 to-pink-600' }
      ];
    }

    // Admin has most access except user management
    if (currentUser?.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
        { id: 'inventory', label: 'Inventaris', icon: Package, color: 'from-green-500 to-green-600' },
        { id: 'booking', label: 'Booking Servis', icon: Calendar, color: 'from-purple-500 to-purple-600' },
        { id: 'history', label: 'Riwayat Kendaraan', icon: Car, color: 'from-orange-500 to-orange-600' },
        { id: 'testimonials', label: 'Testimoni', icon: Star, color: 'from-yellow-500 to-yellow-600' },
        { id: 'admin', label: 'Admin Panel', icon: Settings, color: 'from-red-500 to-red-600' }
      ];
    }

    // For staff, manager, mechanic
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
      { id: 'inventory', label: 'Inventaris', icon: Package, color: 'from-green-500 to-green-600' },
      { id: 'booking', label: 'Booking Servis', icon: Calendar, color: 'from-purple-500 to-purple-600' },
      { id: 'history', label: 'Riwayat Kendaraan', icon: Car, color: 'from-orange-500 to-orange-600' },
      { id: 'testimonials', label: 'Testimoni', icon: Star, color: 'from-yellow-500 to-yellow-600' },
    ];
  };

  const menuItems = getMenuItems();

  const renderContent = () => {
    // Customer-specific content
    if (currentUser?.role === 'customer') {
      switch (activeTab) {
        case 'dashboard':
          return <CustomerDashboard currentUser={currentUser} onNavigate={setActiveTab} />;
        case 'browse':
          return <BrowseItems currentUser={currentUser} />;
        case 'booking':
          return <CustomerBooking currentUser={currentUser} />;
        case 'orders':
          return <MyOrders currentUser={currentUser} />;
        default:
          return <CustomerDashboard currentUser={currentUser} />;
      }
    }

    // Staff/Admin/Owner content
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'booking':
        return <ServiceBooking />;
      case 'history':
        return <VehicleHistory />;
      case 'testimonials':
        return <Testimonials />;
      case 'admin':
        return <AdminPanel />;
      case 'users':
        return <UserManagement currentUser={currentUser} />;
      case 'reports':
        return <ReportsAnalytics currentUser={currentUser} />;
      default:
        return <Dashboard />;
    }
  };

  // Show register screen if requested
  if (!isAuthenticated && showRegister) {
    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={handleShowRegister}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-4 group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 animate-glow">
                <Car className="h-7 w-7 text-white group-hover:animate-float" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
                  Mitra Garage
                </h1>
                <p className="text-sm text-gray-600 font-medium group-hover:text-gray-800 transition-colors">Sistem Manajemen Bengkel Terpadu</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 bg-white/20 rounded-lg px-3 py-2">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{currentUser?.full_name}</p>
                  <p className="text-xs text-gray-600 capitalize">{currentUser?.role}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>

            <button
              className="md:hidden p-2 rounded-xl hover:bg-white/20 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ?
                <X className="h-6 w-6 text-gray-700 transform rotate-180 transition-transform duration-300" /> :
                <Menu className="h-6 w-6 text-gray-700 transition-transform duration-300" />
              }
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-72 ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
            <nav className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Navigation</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
              <ul className="space-y-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-5 py-4 text-left rounded-xl transition-all duration-300 group ${
                          activeTab === item.id
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                            : 'text-gray-700 hover:bg-white/80 hover:shadow-md hover:transform hover:scale-102'
                        }`}
                      >
                        <div className={`p-2 rounded-lg mr-4 ${
                          activeTab === item.id
                            ? 'bg-white/20'
                            : `bg-gradient-to-r ${item.color} group-hover:shadow-lg`
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            activeTab === item.id ? 'text-white' : 'text-white'
                          }`} />
                        </div>
                        <span className="font-medium">{item.label}</span>
                        {activeTab === item.id && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 min-h-[600px] hover:shadow-2xl transition-all duration-500 animate-fade-in-scale">
              <div className="animate-slide-in-up">
                <ErrorBoundary>
                  {renderContent()}
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;