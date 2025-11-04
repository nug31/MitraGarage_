import React, { useState, useEffect } from 'react';
import {
  Search,
  Car,
  Calendar,
  Wrench,
  FileText,
  DollarSign,
  Eye,
  Plus,
  User,
  Phone,
  Edit,
  Save,
  X
} from 'lucide-react';
import { vehicleHistoryAPI, bookingsAPI } from '../utils/mysqlDatabase';
import LoadingSpinner from './LoadingSpinner';

const VehicleHistory = () => {
  const [searchPlate, setSearchPlate] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    customerName: '',
    serviceType: '',
    serviceDate: '',
    cost: 0,
    notes: ''
  });

  // Load vehicle history data
  useEffect(() => {
    loadVehicleHistory();
  }, []);

  const loadVehicleHistory = async () => {
    try {
      setLoading(true);

      // Auto-move completed bookings to vehicle history using backend API
      await autoMoveCompletedBookings();

      // Load vehicle history from backend API
      const response = await fetch('http://localhost:3003/api/vehicle-history');
      if (response.ok) {
        const data = await response.json();
        setVehicleHistory(data);
      } else {
        console.error('Failed to load vehicle history');
        // Fallback to local API if backend fails
        const data = await vehicleHistoryAPI.getAll();
        setVehicleHistory(data);
      }

    } catch (error) {
      console.error('Error loading vehicle history:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoMoveCompletedBookings = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/vehicle-history/auto-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.moved_count > 0) {
          console.log(`✅ Auto-moved ${result.moved_count} completed bookings to vehicle history`);
        }
      }
    } catch (error) {
      console.error('Error auto-moving bookings:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const recordToSave = {
        vehicle_number: formData.vehicleNumber,
        customer_name: formData.customerName,
        service_type: formData.serviceType,
        service_date: formData.serviceDate,
        cost: formData.cost,
        notes: formData.notes
      };

      // Try backend API first
      try {
        const response = await fetch('http://localhost:3003/api/vehicle-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recordToSave),
        });

        if (response.ok) {
          await loadVehicleHistory();
          resetForm();
          return;
        }
      } catch (backendError) {
        console.warn('Backend API failed, using local storage:', backendError);
      }

      // Fallback to local API
      await vehicleHistoryAPI.create(recordToSave);
      await loadVehicleHistory();
      resetForm();
    } catch (error) {
      console.error('Error saving vehicle history:', error);
      alert('Error saving record. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      customerName: '',
      serviceType: '',
      serviceDate: '',
      cost: 0,
      notes: ''
    });
    setShowAddForm(false);
  };

  const filteredHistory = (vehicleHistory || []).filter(record =>
    record.vehicle_number?.toLowerCase().includes(searchPlate.toLowerCase()) ||
    record.customer_name?.toLowerCase().includes(searchPlate.toLowerCase()) ||
    record.service_type?.toLowerCase().includes(searchPlate.toLowerCase())
  );

  const groupedByVehicle = filteredHistory.reduce((acc: any, record: any) => {
    const key = record.vehicle_number;
    if (!acc[key]) {
      acc[key] = {
        plateNumber: record.vehicle_number,
        owner: record.customer_name,
        services: []
      };
    }

    // Transform backend data to frontend format
    const serviceRecord = {
      id: record.id,
      date: record.service_date,
      type: record.service_type,
      cost: Number(record.cost) || 0, // Ensure it's a number
      notes: record.notes || '',
      parts: [], // Backend doesn't have parts data yet
      technician: 'Teknisi Mitra Garage', // Default value
      duration: '2-3 jam' // Default value
    };

    acc[key].services.push(serviceRecord);
    return acc;
  }, {});

  const vehicleData = Object.values(groupedByVehicle);

  const filteredVehicles = vehicleData.filter((vehicle: any) =>
    vehicle.plateNumber?.toLowerCase().includes(searchPlate.toLowerCase()) ||
    vehicle.owner?.toLowerCase().includes(searchPlate.toLowerCase())
  );

  const getSelectedVehicleData = () => {
    return vehicleData.find(v => v.plateNumber === selectedVehicle);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Riwayat Kendaraan</h2>
          <p className="text-gray-600">Lacak riwayat servis berdasarkan plat nomor</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Riwayat
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan plat nomor atau nama pemilik..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value)}
          />
        </div>
      </div>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Kendaraan Terdaftar ({vehicleData.length})
          </h3>
          {loading ? (
            <LoadingSpinner text="Memuat data kendaraan..." />
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchPlate
                ? 'Tidak ada kendaraan yang sesuai dengan pencarian'
                : 'Belum ada riwayat kendaraan'
              }
            </div>
          ) : (
            (filteredVehicles || []).map((vehicle) => (
            <div
              key={vehicle.plateNumber}
              className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all ${
                selectedVehicle === vehicle.plateNumber 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedVehicle(vehicle.plateNumber)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{vehicle.plateNumber}</h4>
                    <p className="text-sm text-gray-600">{vehicle.owner}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{vehicle.services.length} servis</p>
                  {vehicle.services.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Terakhir: {new Date(vehicle.services[0]?.service_date || vehicle.services[0]?.date).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Vehicle Details */}
        <div className="space-y-4">
          {selectedVehicle ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Detail Riwayat Servis</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Servis
                </button>
              </div>
              
              {/* Vehicle Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{getSelectedVehicleData()?.plateNumber}</h4>
                    <p className="text-gray-600">{getSelectedVehicleData()?.vehicleType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {getSelectedVehicleData()?.owner}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {getSelectedVehicleData()?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service History */}
              <div className="space-y-4">
                {(getSelectedVehicleData()?.services || []).map((service) => (
                  <div key={service.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{service.type}</h5>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(service.date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(service.cost)}
                        </p>
                        <p className="text-sm text-gray-600">Teknisi: {service.technician}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h6 className="font-medium text-gray-900 mb-2">Suku Cadang yang Digunakan:</h6>
                        <div className="flex flex-wrap gap-2">
                          {(service.parts || []).map((part, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h6 className="font-medium text-gray-900 mb-2">Catatan Teknisi:</h6>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                          {service.notes}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          Durasi: {service.duration}
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Kendaraan</h3>
              <p className="text-gray-600">Pilih kendaraan dari daftar sebelah kiri untuk melihat riwayat servis</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Service Record Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tambah Riwayat Servis</h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Kendaraan</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: B 1234 CD"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama pemilik kendaraan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Servis</label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Jenis Servis</option>
                  <option value="Ganti Oli">Ganti Oli</option>
                  <option value="Service Rem">Service Rem</option>
                  <option value="Tune Up">Tune Up</option>
                  <option value="Ganti Aki">Ganti Aki</option>
                  <option value="Service AC">Service AC</option>
                  <option value="Balancing Ban">Balancing Ban</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Servis</label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Catatan tambahan tentang servis..."
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
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleHistory;