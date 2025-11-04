import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff, 
  Car,
  AlertCircle,
  Loader
} from 'lucide-react';

interface LoginProps {
  onLogin: (user: any, token: string) => void;
  onShowRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onShowRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try API first
      const response = await fetch('http://localhost:3003/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));

        // Call parent callback
        onLogin(data.user, data.token);
        return;
      }
    } catch (err) {
      console.warn('API login failed, trying mock users:', err);
    }

    // Fallback to mock users if API fails
    const mockUsers = [
      {
        id: 1,
        username: 'owner',
        password: 'owner123',
        email: 'owner@mitragarage.com',
        full_name: 'Bengkel Owner',
        role: 'owner'
      },
      {
        id: 2,
        username: 'admin',
        password: 'admin123',
        email: 'admin@mitragarage.com',
        full_name: 'Administrator',
        role: 'admin'
      },
      {
        id: 3,
        username: 'manager',
        password: 'manager123',
        email: 'manager@mitragarage.com',
        full_name: 'Manager Bengkel',
        role: 'admin'
      },
      {
        id: 4,
        username: 'supervisor',
        password: 'supervisor123',
        email: 'supervisor@mitragarage.com',
        full_name: 'Supervisor Bengkel',
        role: 'admin'
      },
      {
        id: 5,
        username: 'customer1',
        password: 'customer123',
        email: 'customer1@gmail.com',
        full_name: 'John Doe',
        role: 'customer'
      },
      {
        id: 6,
        username: 'customer2',
        password: 'customer123',
        email: 'customer2@gmail.com',
        full_name: 'Jane Smith',
        role: 'customer'
      }
    ];

    const user = mockUsers.find(u =>
      u.username === formData.username && u.password === formData.password
    );

    if (user) {
      const token = `mock_token_${user.id}_${Date.now()}`;
      const { password, ...userWithoutPassword } = user;

      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userWithoutPassword));

      // Call parent callback
      onLogin(userWithoutPassword, token);
    } else {
      setError('Invalid username or password');
    }

    setLoading(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mitra Garage
          </h1>
          <p className="text-gray-600 mt-2">Workshop Management System</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username or Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter username or email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>



        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Don't have an account?{' '}
            <button
              onClick={onShowRegister}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create one here
            </button>
          </p>
          <p className="text-xs text-gray-500">
            © 2024 Mitra Garage. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
