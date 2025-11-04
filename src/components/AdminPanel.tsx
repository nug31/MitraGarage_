import React, { useState, useEffect } from 'react';
import {
  Package,
  Settings,
  Shield,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Save,
  X,
  Download,
  Upload,
  Database,
  Calendar,
  Car,
  Star
} from 'lucide-react';
import { inventoryAPI, bookingsAPI, vehicleHistoryAPI, testimonialsAPI } from '../utils/mysqlDatabase';
import LoadingSpinner from './LoadingSpinner';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalInventory: 0,
    totalBookings: 0,
    totalVehicles: 0,
    totalTestimonials: 0,
    lowStockItems: 0
  });

  // Load admin statistics
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);

      // Try MySQL first, fallback to localStorage
      try {
        const [inventory, bookings, vehicles, testimonials, lowStock] = await Promise.all([
          inventoryAPI.getAll(),
          bookingsAPI.getAll(),
          vehicleHistoryAPI.getAll(),
          testimonialsAPI.getAll(),
          inventoryAPI.getLowStock()
        ]);

        setStats({
          totalInventory: inventory.length,
          totalBookings: bookings.length,
          totalVehicles: vehicles.length,
          totalTestimonials: testimonials.length,
          lowStockItems: lowStock.length
        });
      } catch (mysqlError) {
        console.warn('MySQL failed, using localStorage fallback:', mysqlError);

        // Load from localStorage including customer bookings
        const globalBookings = localStorage.getItem('bookings');
        const bookingsCount = globalBookings ? JSON.parse(globalBookings).length : 0;

        setStats({
          totalInventory: 0, // Would need to implement localStorage fallback for inventory
          totalBookings: bookingsCount,
          totalVehicles: 0, // Would need to implement localStorage fallback for vehicles
          totalTestimonials: 0, // Would need to implement localStorage fallback for testimonials
          lowStockItems: 0
        });

        console.log('Admin panel loaded booking count from localStorage:', bookingsCount);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const [inventory, bookings, vehicles, testimonials] = await Promise.all([
        inventoryAPI.getAll(),
        bookingsAPI.getAll(),
        vehicleHistoryAPI.getAll(),
        testimonialsAPI.getAll()
      ]);

      const exportData = {
        inventory,
        bookings,
        vehicles,
        testimonials,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mitra-garage-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const clearAllData = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus SEMUA data dari database? Tindakan ini tidak dapat dibatalkan!')) {
      try {
        // Clear database tables via API
        const response = await fetch('http://localhost:3003/api/database/clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await loadStatistics();
          alert('Semua data berhasil dihapus dari database!');
        } else {
          throw new Error('Failed to clear database');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing database. Please try again.');
      }
    }
  };



  const stockRequests = [
    { id: 1, user: 'Joko Susilo', item: 'Oli Mesin 5W-30', quantity: 2, reason: 'Untuk Honda Civic B 1234 CD', date: '2024-01-15', status: 'Pending' },
    { id: 2, user: 'Ahmad Fauzi', item: 'Brake Pad Honda', quantity: 1, reason: 'Kampas rem habis untuk service', date: '2024-01-14', status: 'Approved' },
    { id: 3, user: 'Bambang Sutopo', item: 'Spark Plug NGK', quantity: 4, reason: 'Tune up Avanza', date: '2024-01-13', status: 'Pending' },
    { id: 4, user: 'Joko Susilo', item: 'Air Filter Toyota', quantity: 1, reason: 'Filter kotor perlu diganti', date: '2024-01-12', status: 'Rejected' }
  ];

  const systemSettings = [
    { id: 1, setting: 'Jam Operasional', value: '08:00 - 17:00', description: 'Waktu buka bengkel' },
    { id: 2, setting: 'Batas Minimum Stok', value: '10', description: 'Threshold untuk alert stok menipis' },
    { id: 3, setting: 'Auto Backup', value: 'Enabled', description: 'Backup otomatis database harian' },
    { id: 4, setting: 'Email Notification', value: 'Enabled', description: 'Notifikasi email untuk stok menipis' },
    { id: 5, setting: 'Max Booking Per Day', value: '20', description: 'Maksimum booking per hari' }
  ];



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Inactive':
      case 'Rejected':
        return <XCircle className="h-4 w-4" />;
      case 'Pending':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'requests', label: 'Approval Stok', icon: Package },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600">Kelola stok, approval, dan pengaturan sistem</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-red-500" />
          <span className="text-sm text-gray-600">Admin Access</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">System Overview</h3>

              {loading ? (
                <LoadingSpinner text="Memuat statistik..." />
              ) : (
                <>
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Total Inventaris</p>
                          <p className="text-2xl font-bold text-blue-900">{stats.totalInventory}</p>
                        </div>
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Total Booking</p>
                          <p className="text-2xl font-bold text-green-900">{stats.totalBookings}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Kendaraan Terdaftar</p>
                          <p className="text-2xl font-bold text-purple-900">{stats.totalVehicles}</p>
                        </div>
                        <Car className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600 font-medium">Total Testimoni</p>
                          <p className="text-2xl font-bold text-yellow-900">{stats.totalTestimonials}</p>
                        </div>
                        <Star className="h-8 w-8 text-yellow-600" />
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-red-600 font-medium">Stok Menipis</p>
                          <p className="text-2xl font-bold text-red-900">{stats.lowStockItems}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                  </div>

                  {/* Data Management */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">Manajemen Data</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={exportData}
                        className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Export Data
                      </button>

                      <button
                        onClick={loadStatistics}
                        className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Database className="h-5 w-5 mr-2" />
                        Refresh Stats
                      </button>

                      <button
                        onClick={clearAllData}
                        className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-5 w-5 mr-2" />
                        Clear All Data
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}



          {/* Stock Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Approval Penggunaan Stok</h3>
              
              <div className="space-y-3">
                {stockRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{request.user}</p>
                          <p className="text-sm text-gray-600">
                            Meminta <strong>{request.quantity}x {request.item}</strong>
                          </p>
                          <p className="text-sm text-gray-500">Alasan: {request.reason}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(request.date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </span>
                        {request.status === 'Pending' && (
                          <div className="flex space-x-2">
                            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                              Setuju
                            </button>
                            <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                              Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pengaturan Sistem</h3>
              
              <div className="space-y-3">
                {systemSettings.map((setting) => (
                  <div key={setting.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{setting.setting}</p>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{setting.value}</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;