import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Car,
  Wrench,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Edit,
  Save,
  X,
  XCircle,
  Receipt
} from 'lucide-react';
import { bookingsAPI } from '../utils/mysqlDatabase';
import LoadingSpinner from './LoadingSpinner';
import Invoice from './Invoice';

const ServiceBooking = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    customerName: '',
    phone: '',
    vehicleNumber: '',
    vehicleType: '',
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    description: '',
    status: 'Dijadwalkan'
  });

  const popularServices = [
    { id: 1, name: 'Ganti Oli', price: 'Rp150.000', duration: '30 menit', icon: '🛢️' },
    { id: 2, name: 'Service Rem', price: 'Rp300.000', duration: '1 jam', icon: '🛑' },
    { id: 3, name: 'Tune Up', price: 'Rp500.000', duration: '2 jam', icon: '⚙️' },
    { id: 4, name: 'Ganti Aki', price: 'Rp750.000', duration: '45 menit', icon: '🔋' },
    { id: 5, name: 'Service AC', price: 'Rp250.000', duration: '1.5 jam', icon: '❄️' },
    { id: 6, name: 'Balancing Ban', price: 'Rp100.000', duration: '30 menit', icon: '⚖️' },
  ];

  // Load bookings data
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);

      // Try MySQL first, fallback to localStorage
      try {
        const data = await bookingsAPI.getAll();
        console.log('Loaded bookings from MySQL:', data);
        setBookings(data);
      } catch (mysqlError) {
        console.warn('MySQL failed, loading from localStorage:', mysqlError);

        // Load from global localStorage (includes customer bookings)
        const globalBookings = localStorage.getItem('bookings');
        if (globalBookings) {
          const bookings = JSON.parse(globalBookings);
          console.log('Loaded bookings from localStorage:', bookings);
          setBookings(bookings);
        } else {
          console.log('No bookings found in localStorage');
          setBookings([]);
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookingToSave = {
        customer_name: bookingData.customerName,
        vehicle_number: bookingData.vehicleNumber,
        service_type: bookingData.serviceType,
        booking_time: bookingData.preferredTime,
        booking_date: bookingData.preferredDate,
        status: bookingData.status,
        phone: bookingData.phone,
        vehicle_type: bookingData.vehicleType,
        description: bookingData.description
      };

      if (editingBooking) {
        await bookingsAPI.update(editingBooking.id, bookingToSave);
      } else {
        await bookingsAPI.create(bookingToSave);
      }

      await loadBookings();
      resetForm();
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Error saving booking. Please try again.');
    }
  };

  const handleEditBooking = (booking: any) => {
    setEditingBooking(booking);
    setBookingData({
      customerName: booking.customer_name,
      phone: booking.phone || '',
      vehicleNumber: booking.vehicle_number,
      vehicleType: booking.vehicle_type || '',
      serviceType: booking.service_type,
      preferredDate: booking.booking_date,
      preferredTime: booking.booking_time,
      description: booking.description || '',
      status: booking.status
    });
    setShowBookingForm(true);
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await bookingsAPI.updateStatus(id, newStatus);
      await loadBookings();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const getEstimatedCost = (serviceType: string): number => {
    const servicePrices: { [key: string]: number } = {
      'Ganti Oli': 150000,
      'Service Rem': 300000,
      'Tune Up': 500000,
      'Ganti Aki': 750000,
      'Service AC': 250000,
      'Balancing Ban': 100000,
      'Service Rutin': 200000,
      'Perbaikan Mesin': 800000,
      'Ganti Ban': 600000
    };
    return servicePrices[serviceType] || 200000;
  };

  const handleViewInvoice = (booking: any) => {
    setSelectedBooking(booking);
    setShowInvoice(true);
  };

  const resetForm = () => {
    setBookingData({
      customerName: '',
      phone: '',
      vehicleNumber: '',
      vehicleType: '',
      serviceType: '',
      preferredDate: '',
      preferredTime: '',
      description: '',
      status: 'Dijadwalkan'
    });
    setEditingBooking(null);
    setShowBookingForm(false);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sedang Dikerjakan':
        return 'bg-blue-100 text-blue-800';
      case 'Menunggu':
        return 'bg-yellow-100 text-yellow-800';
      case 'Dijadwalkan':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sedang Dikerjakan':
        return <Wrench className="h-4 w-4" />;
      case 'Menunggu':
        return <Clock className="h-4 w-4" />;
      case 'Dijadwalkan':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Servis</h2>
          <p className="text-gray-600">Kelola jadwal servis kendaraan di Mitra Garage</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowBookingForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Buat Booking
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, nomor kendaraan, atau jenis servis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="Dijadwalkan">Dijadwalkan</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Layanan Populer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularServices.map((service) => (
            <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{service.icon}</span>
                <span className="text-sm text-gray-500">{service.duration}</span>
              </div>
              <h4 className="font-medium text-gray-900">{service.name}</h4>
              <p className="text-blue-600 font-semibold">{service.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daftar Booking ({filteredBookings.length})
        </h3>
        <div className="space-y-3">
          {loading ? (
            <LoadingSpinner text="Memuat data booking..." />
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Tidak ada booking yang sesuai dengan filter'
                : 'Belum ada booking yang dibuat'
              }
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{booking.customer_name}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Car className="h-4 w-4 mr-1" />
                      {booking.vehicle_number}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Wrench className="h-4 w-4 mr-1" />
                      {booking.service_type}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {booking.booking_date} - {booking.booking_time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col gap-2">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                      className="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Dijadwalkan">Dijadwalkan</option>
                      <option value="Menunggu">Menunggu</option>
                      <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewInvoice(booking)}
                        className="text-purple-600 hover:text-purple-800 text-xs flex items-center"
                      >
                        <Receipt className="h-3 w-3 mr-1" />
                        Invoice
                      </button>
                      <button
                        onClick={() => handleEditBooking(booking)}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1">{booking.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingBooking ? 'Edit Booking' : 'Buat Booking Baru'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Nama Pelanggan
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={bookingData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Car className="h-4 w-4 inline mr-1" />
                    Nomor Kendaraan
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={bookingData.vehicleNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: B 1234 CD"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kendaraan</label>
                  <select
                    name="vehicleType"
                    value={bookingData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Jenis Kendaraan</option>
                    <option value="Mobil">Mobil</option>
                    <option value="Truk">Truk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Wrench className="h-4 w-4 inline mr-1" />
                  Jenis Layanan
                </label>
                <select
                  name="serviceType"
                  value={bookingData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Layanan</option>
                  {popularServices.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name} - {service.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Tanggal Preferred
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={bookingData.preferredDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Waktu Preferred
                  </label>
                  <select
                    name="preferredTime"
                    value={bookingData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Waktu</option>
                    <option value="08:00">08:00 WIB</option>
                    <option value="09:00">09:00 WIB</option>
                    <option value="10:00">10:00 WIB</option>
                    <option value="11:00">11:00 WIB</option>
                    <option value="13:00">13:00 WIB</option>
                    <option value="14:00">14:00 WIB</option>
                    <option value="15:00">15:00 WIB</option>
                    <option value="16:00">16:00 WIB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keluhan / Deskripsi</label>
                <textarea
                  name="description"
                  value={bookingData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jelaskan keluhan atau permintaan khusus..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingBooking ? 'Update Booking' : 'Buat Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && selectedBooking && (
        <Invoice
          booking={{
            id: selectedBooking.id,
            customerName: selectedBooking.customer_name,
            customerPhone: selectedBooking.phone || '',
            customerEmail: selectedBooking.email || '',
            vehicleType: selectedBooking.vehicle_type || '',
            licensePlate: selectedBooking.vehicle_number || '',
            serviceType: selectedBooking.service_type,
            serviceDate: selectedBooking.booking_date,
            estimatedCost: selectedBooking.estimated_cost || getEstimatedCost(selectedBooking.service_type),
            status: selectedBooking.status,
            notes: selectedBooking.description
          }}
          onClose={() => {
            setShowInvoice(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default ServiceBooking;