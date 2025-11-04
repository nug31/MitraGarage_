import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Package,
  Star,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  Activity
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface ReportsAnalyticsProps {
  currentUser: any;
}

const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalCustomers: 0,
    totalOrders: 0,
    avgRating: 0,
    completedServices: 0,
    pendingServices: 0,
    inventoryValue: 0
  });

  const [chartData, setChartData] = useState({
    revenue: [],
    bookings: [],
    topServices: [],
    customerGrowth: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, reportType]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real app, this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      setStats({
        totalRevenue: 45750000,
        totalBookings: 156,
        totalCustomers: 89,
        totalOrders: 234,
        avgRating: 4.7,
        completedServices: 142,
        pendingServices: 14,
        inventoryValue: 125000000
      });

      setChartData({
        revenue: [
          { month: 'Jan', amount: 3200000 },
          { month: 'Feb', amount: 4100000 },
          { month: 'Mar', amount: 3800000 },
          { month: 'Apr', amount: 4500000 },
          { month: 'May', amount: 5200000 },
          { month: 'Jun', amount: 4750000 }
        ],
        bookings: [
          { service: 'Ganti Oli', count: 45 },
          { service: 'Tune Up', count: 32 },
          { service: 'Service AC', count: 28 },
          { service: 'Ganti Ban', count: 25 },
          { service: 'Service Rem', count: 26 }
        ],
        topServices: [
          { name: 'Ganti Oli', revenue: 6750000, percentage: 35 },
          { name: 'Tune Up', revenue: 9600000, percentage: 25 },
          { name: 'Service AC', revenue: 5600000, percentage: 20 },
          { name: 'Ganti Ban', revenue: 16250000, percentage: 15 },
          { name: 'Lainnya', revenue: 7550000, percentage: 5 }
        ],
        customerGrowth: [
          { month: 'Jan', new: 12, returning: 8 },
          { month: 'Feb', new: 15, returning: 12 },
          { month: 'Mar', new: 18, returning: 14 },
          { month: 'Apr', new: 22, returning: 18 },
          { month: 'May', new: 25, returning: 22 },
          { month: 'Jun', new: 19, returning: 25 }
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Business insights and performance metrics</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={fetchAnalyticsData}
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="bg-gradient-to-r from-green-500 to-green-600"
          change={12.5}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          change={8.2}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          change={15.3}
        />
        <StatCard
          title="Avg Rating"
          value={`${stats.avgRating}/5.0`}
          icon={Star}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          change={2.1}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {chartData.revenue.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                      style={{ width: `${(item.amount / 5200000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Services</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {chartData.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                    index === 0 ? 'from-blue-500 to-blue-600' :
                    index === 1 ? 'from-green-500 to-green-600' :
                    index === 2 ? 'from-yellow-500 to-yellow-600' :
                    index === 3 ? 'from-purple-500 to-purple-600' :
                    'from-gray-500 to-gray-600'
                  }`}></div>
                  <span className="text-sm text-gray-900">{service.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(service.revenue)}
                  </div>
                  <div className="text-xs text-gray-500">{service.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Performance */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Service Performance</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">
              Bookings
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">
              Revenue
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedServices}</div>
            <div className="text-sm text-gray-600">Completed Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingServices}</div>
            <div className="text-sm text-gray-600">Pending Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {((stats.completedServices / (stats.completedServices + stats.pendingServices)) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Revenue Report</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Service Report</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Customer Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
