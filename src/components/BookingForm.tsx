import React, { useState } from 'react';
import { X, User, Phone, Car, Wrench, Calendar, Clock, FileText } from 'lucide-react';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    vehicleNumber: '',
    vehicleType: 'Pilih Jenis Kendaraan',
    serviceType: 'Pilih Layanan',
    preferredDate: '',
    preferredTime: 'Pilih Waktu',
    description: ''
  });

  const vehicleTypes = [
    'Pilih Jenis Kendaraan',
    'Mobil',
    'Truk',
    'Bus',
    'Pickup'
  ];

  const serviceTypes = [
    'Pilih Layanan',
    'Service Rutin',
    'Ganti Oli',
    'Tune Up',
    'Perbaikan Mesin',
    'Perbaikan AC',
    'Ganti Ban',
    'Balancing & Spooring',
    'Body Repair',
    'Cat Ulang',
    'Electrical',
    'Transmisi',
    'Rem',
    'Kopling'
  ];

  const timeSlots = [
    { display: 'Pilih Waktu', value: '' },
    { display: '08:00 - 09:00', value: '08:00' },
    { display: '09:00 - 10:00', value: '09:00' },
    { display: '10:00 - 11:00', value: '10:00' },
    { display: '11:00 - 12:00', value: '11:00' },
    { display: '13:00 - 14:00', value: '13:00' },
    { display: '14:00 - 15:00', value: '14:00' },
    { display: '15:00 - 16:00', value: '15:00' },
    { display: '16:00 - 17:00', value: '16:00' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Debug log
    console.log(`Input change: ${name} = "${value}"`);

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Debug: Log form data
    console.log('Form Data:', formData);

    // Validate required fields
    const requiredFields = [
      { field: formData.customerName, name: 'Nama Pelanggan' },
      { field: formData.phoneNumber, name: 'Nomor Telepon' },
      { field: formData.vehicleNumber, name: 'Nomor Kendaraan' },
      { field: formData.vehicleType, name: 'Jenis Kendaraan' },
      { field: formData.serviceType, name: 'Jenis Layanan' },
      { field: formData.preferredDate, name: 'Tanggal Preferred' },
      { field: formData.preferredTime, name: 'Waktu Preferred' }
    ];

    // Check for empty fields
    const emptyFields = requiredFields.filter(item => {
      let isEmpty = false;

      if (!item.field || item.field.trim() === '') {
        isEmpty = true;
      } else if (item.field === 'Pilih Jenis Kendaraan' ||
                 item.field === 'Pilih Layanan' ||
                 item.field === 'Pilih Waktu') {
        isEmpty = true;
      }

      if (isEmpty) {
        console.log(`❌ Empty field: ${item.name} = "${item.field}"`);
      } else {
        console.log(`✅ Valid field: ${item.name} = "${item.field}"`);
      }

      return isEmpty;
    });

    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map(item => item.name).join(', ');
      alert(`Mohon lengkapi field berikut: ${fieldNames}`);
      return;
    }

    // Create booking object
    const bookingData = {
      ...formData,
      id: Date.now(),
      status: 'Menunggu',
      createdAt: new Date().toISOString(),
      estimatedCost: 'Akan dihitung setelah pemeriksaan'
    };

    console.log('Booking Data:', bookingData);

    // Submit booking
    onSubmit(bookingData);

    // Show success message
    alert(`✅ Booking berhasil dibuat!\n\nID: ${bookingData.id}\nNama: ${formData.customerName}\nLayanan: ${formData.serviceType}\nTanggal: ${formData.preferredDate}\nWaktu: ${formData.preferredTime}`);
    
    // Reset form
    setFormData({
      customerName: '',
      phoneNumber: '',
      vehicleNumber: '',
      vehicleType: 'Pilih Jenis Kendaraan',
      serviceType: 'Pilih Layanan',
      preferredDate: '',
      preferredTime: 'Pilih Waktu',
      description: ''
    });
    
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      customerName: '',
      phoneNumber: '',
      vehicleNumber: '',
      vehicleType: 'Pilih Jenis Kendaraan',
      serviceType: 'Pilih Layanan',
      preferredDate: '',
      preferredTime: 'Pilih Waktu',
      description: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Buat Booking Baru</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2" />
                Nama Pelanggan
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 mr-2" />
                Nomor Telepon
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: 08123456789"
                required
              />
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Car className="h-4 w-4 mr-2" />
                Nomor Kendaraan
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: B 1234 CD"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Jenis Kendaraan
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {vehicleTypes.map((type, index) => (
                  <option key={index} value={type} disabled={index === 0}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Wrench className="h-4 w-4 mr-2" />
              Jenis Layanan
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {serviceTypes.map((service, index) => (
                <option key={index} value={service} disabled={index === 0}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Tanggal Preferred
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 mr-2" />
                Waktu Preferred
              </label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {timeSlots.map((timeSlot, index) => (
                  <option key={index} value={timeSlot.value} disabled={index === 0}>
                    {timeSlot.display}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 mr-2" />
              Keluhan / Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Jelaskan keluhan atau permintaan khusus..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Buat Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
