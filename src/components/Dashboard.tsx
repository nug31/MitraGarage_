import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Calendar,
  Car,
  DollarSign,
  AlertTriangle,
  Users,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { inventoryAPI, bookingsAPI } from '../utils/mysqlDatabase';

import LoadingSpinner from './LoadingSpinner';
import DatabaseManager from './DatabaseManager';
import AnimatedCounter from './AnimatedCounter';

const Dashboard = () => {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [totalInventory, setTotalInventory] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = [
    {
      title: 'Total Stok',
      value: totalInventory.toString(),
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Booking Hari Ini',
      value: todayBookings.toString(),
      icon: Calendar,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase'
    },
    {
      title: 'Kendaraan Aktif',
      value: '45',
      icon: Car,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Pendapatan Bulan Ini',
      value: 'Rp 25.5M',
      icon: DollarSign,
      color: 'bg-orange-500',
      change: '+15%',
      changeType: 'increase'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Use MySQL database only - no fallback to localStorage
        // Fetch low stock items
        const lowStock = await inventoryAPI.getLowStock();
        setLowStockItems(lowStock as any[]);

        // Fetch all inventory to get total count
        const allInventory = await inventoryAPI.getAll();
        const totalStock = (allInventory as any[]).reduce((sum, item) => sum + item.stock, 0);
        setTotalInventory(totalStock);

        // Fetch today's bookings
        const todayBookingsData = await bookingsAPI.getToday();
        setTodayBookings((todayBookingsData as any[]).length);

        // Fetch recent bookings (limit to 4)
        const allBookings = await bookingsAPI.getAll();
        setRecentBookings((allBookings as any[]).slice(0, 4));

        console.log('Dashboard loaded from MySQL database');
        console.log('Total inventory items:', allInventory.length);
        console.log('Today\'s bookings:', todayBookingsData.length);
        console.log('Recent bookings:', allBookings.length);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data from database. Please check your connection.');

        // Set empty data instead of dummy data - force database usage
        setLowStockItems([]);
        setRecentBookings([]);
        setTotalInventory(0);
        setTodayBookings(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sedang Dikerjakan':
        return 'bg-blue-100 text-blue-800';
      case 'Menunggu':
        return 'bg-yellow-100 text-yellow-800';
      case 'Selesai':
        return 'bg-green-100 text-green-800';
      case 'Dijadwalkan':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Error Loading Data</h3>
              <p className="text-sm text-red-600">{error}</p>
              <p className="text-xs text-red-500 mt-1">Using fallback data for display</p>
            </div>
          </div>
        </div>
      )}


      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h2>
            <p className="text-gray-600 font-medium">Ringkasan aktivitas Mitra Garage hari ini</p>
          </div>
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white/20 hover:transform hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <div className="text-3xl font-bold text-gray-900 mb-3">
                    {stat.title === 'Total Stok' ? (
                      <AnimatedCounter end={totalInventory} className="text-3xl" />
                    ) : stat.title === 'Booking Hari Ini' ? (
                      <AnimatedCounter end={todayBookings} className="text-3xl" />
                    ) : stat.title === 'Pendapatan Bulan Ini' ? (
                      <AnimatedCounter end={25500000} prefix="Rp " suffix="" className="text-3xl" />
                    ) : (
                      <AnimatedCounter end={parseInt(stat.value) || 45} className="text-3xl" />
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center px-2 py-1 bg-green-100 rounded-full">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs font-semibold text-green-600">{stat.change}</span>
                    </div>
                  </div>
                </div>
                <div className={`relative p-4 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <Icon className="h-8 w-8 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* Decorative gradient border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alert */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Stok Menipis</h3>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {loading ? (
              <LoadingSpinner text="Memuat data stok..." />
            ) : lowStockItems.length > 0 ? (
              lowStockItems.map((item, index) => (
                <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 hover:shadow-md transition-all duration-300">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">{item.name}</p>
                    <p className="text-sm text-gray-600">Stok: <span className="font-semibold text-red-600">{item.stock}</span> / Min: <span className="font-semibold">{item.min_stock}</span></p>
                  </div>
                  <div className="flex items-center ml-4">
                    <div className="w-24 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500 group-hover:animate-pulse"
                        style={{ width: `${Math.min((item.stock / item.min_stock) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-red-600">
                        {Math.round((item.stock / item.min_stock) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Tidak ada stok yang menipis
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Booking Terbaru</h3>
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {loading ? (
              <LoadingSpinner text="Memuat data booking..." />
            ) : recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <div key={booking.id} className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 group-hover:shadow-lg transition-shadow">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-1">{booking.customer_name || booking.customer}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">{booking.vehicle_number || booking.vehicle}</span> - {booking.service_type || booking.service}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.booking_time || booking.time}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-2 rounded-xl text-xs font-bold shadow-sm ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Tidak ada booking terbaru
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Grafik Performa Bulanan</h3>
            <p className="text-gray-600">Analisis trend dan performa Mitra Garage</p>
          </div>
        </div>
        <div className="h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center border border-blue-100">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h4>
            <p className="text-gray-600 max-w-md">Grafik performa interaktif akan ditampilkan di sini dengan data real-time</p>
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;