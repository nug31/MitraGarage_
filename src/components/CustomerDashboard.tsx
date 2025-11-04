import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Car,
  User,
  ShoppingBag,
  Star,
  DollarSign
} from 'lucide-react';
import { bookingsAPI } from '../utils/mysqlDatabase';
import LoadingSpinner from './LoadingSpinner';
import ReviewModal from './ReviewModal';
import AnimatedCounter from './AnimatedCounter';

interface Booking {
  id: number;
  customer_name: string;
  vehicle_info?: string;
  vehicle_number?: string;
  vehicle_type?: string;
  service_type: string;
  booking_date?: string;
  status: string;
  estimated_cost?: number;
  notes?: string;
}

interface CustomerDashboardProps {
  currentUser: any;
  onNavigate: (tab: string) => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ currentUser, onNavigate }) => {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedServices: 0,
    pendingServices: 0,
    totalSpent: 0
  });

  useEffect(() => {
    fetchMyBookings();
  }, [currentUser]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      // Get bookings from database only - no localStorage
      const allBookings = await bookingsAPI.getAll();
      const customerBookings = (allBookings as Booking[]).filter(
        booking => booking.customer_name.toLowerCase().includes(currentUser.full_name.toLowerCase()) ||
                  booking.email === currentUser.email
      );
      setMyBookings(customerBookings);
      calculateStats(customerBookings);
      console.log('CustomerDashboard loaded from MySQL database:', customerBookings.length, 'bookings');
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setMyBookings([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookings: Booking[]) => {
    const completed = bookings.filter(b => b.status === 'Selesai').length;
    const pending = bookings.filter(b => ['Menunggu', 'Sedang Dikerjakan', 'Dijadwalkan'].includes(b.status)).length;
    const totalSpent = bookings
      .filter(b => b.status === 'Selesai')
      .reduce((sum, b) => sum + (b.estimated_cost || 0), 0);

    setStats({
      totalBookings: bookings.length,
      completedServices: completed,
      pendingServices: pending,
      totalSpent
    });
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sedang Dikerjakan':
        return <Clock className="h-4 w-4" />;
      case 'Menunggu':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Selesai':
        return <CheckCircle className="h-4 w-4" />;
      case 'Dijadwalkan':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      title: 'Total Booking',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/10 to-blue-600/10'
    },
    {
      title: 'Service Selesai',
      value: stats.completedServices,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-500/10 to-green-600/10'
    },
    {
      title: 'Service Pending',
      value: stats.pendingServices,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-500/10 to-yellow-600/10'
    },
    {
      title: 'Total Pengeluaran',
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalSpent || 0),
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-500/10 to-purple-600/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser.full_name}!</h1>
            <p className="text-gray-600">Kelola booking dan lihat riwayat service Anda</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`group relative bg-gradient-to-r ${stat.bgColor} backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white/20 hover:transform hover:scale-105`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <div className="text-3xl font-bold text-gray-900 mb-3">
                    {typeof stat.value === 'number' && stat.title !== 'Total Pengeluaran' ? (
                      <AnimatedCounter end={stat.value} className="text-3xl" />
                    ) : (
                      stat.value
                    )}
                  </div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* My Bookings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
            </div>
            <span className="text-sm text-gray-500">{myBookings.length} total bookings</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {myBookings.length === 0 ? (
            <div className="p-8 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada booking service</p>
              <p className="text-sm text-gray-400 mt-2">Booking service pertama Anda akan muncul di sini</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle & Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.vehicle_info || `${booking.vehicle_number || 'N/A'} (${booking.vehicle_type || 'N/A'})`}
                        </div>
                        <div className="text-sm text-gray-500">{booking.service_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('id-ID') : 'Tanggal tidak tersedia'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(booking.estimated_cost || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {booking.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('booking')}
            className="bg-white/80 rounded-xl p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
          >
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Book Service</h4>
            <p className="text-sm text-gray-600">Schedule new service</p>
          </button>
          <button
            onClick={() => onNavigate('browse')}
            className="bg-white/80 rounded-xl p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
          >
            <ShoppingBag className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Browse Items</h4>
            <p className="text-sm text-gray-600">Shop for parts & accessories</p>
          </button>
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-white/80 rounded-xl p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
          >
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Give Review</h4>
            <p className="text-sm text-gray-600">Rate our service</p>
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default CustomerDashboard;
