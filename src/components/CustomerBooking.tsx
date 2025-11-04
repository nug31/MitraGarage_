import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Car,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  User,
  Phone,
  Mail,
  FileText,
  DollarSign,
  CreditCard,
  MessageCircle,
  Receipt
} from 'lucide-react';
import { bookingsAPI } from '../utils/mysqlDatabase';
import LoadingSpinner from './LoadingSpinner';
import BookingForm from './BookingForm';
import Invoice from './Invoice';

interface Booking {
  id: number;
  customer_name: string;
  vehicle_info?: string;
  vehicle_number?: string;
  vehicle_type?: string;
  service_type: string;
  booking_date: string;
  status: string;
  estimated_cost?: number;
  notes?: string;
  phone?: string;
  email?: string;
}

interface CustomerBookingProps {
  currentUser: any;
}

const CustomerBooking: React.FC<CustomerBookingProps> = ({ currentUser }) => {
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);



  useEffect(() => {
    fetchMyBookings();
  }, [currentUser]);

  // Payment and Invoice Functions
  const handlePayment = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowInvoice(true);
  };

  const generateInvoiceMessage = (booking: Booking) => {
    const vehicleInfo = booking.vehicle_info || `${booking.vehicle_number || 'N/A'} (${booking.vehicle_type || 'N/A'})`;
    const bookingDate = booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('id-ID') : 'Tanggal tidak tersedia';
    const cost = booking.estimated_cost || 0;

    return `*INVOICE PEMBAYARAN - MITRA GARAGE*

📋 *Detail Booking:*
• ID Booking: #${booking.id}
• Nama Customer: ${booking.customer_name}
• Kendaraan: ${vehicleInfo}
• Jenis Service: ${booking.service_type}
• Tanggal Service: ${bookingDate}
• Status: ${booking.status}

💰 *Detail Pembayaran:*
• Biaya Service: Rp ${cost.toLocaleString()}
• Biaya Admin: Rp 0
• Total Pembayaran: Rp ${cost.toLocaleString()}

📝 *Catatan:*
${booking.notes || 'Tidak ada catatan khusus'}

Saya ingin melakukan pembayaran untuk service di atas. Mohon informasi metode pembayaran yang tersedia.

Terima kasih! 🙏`;
  };

  const sendToWhatsApp = (booking: Booking) => {
    const message = generateInvoiceMessage(booking);
    const adminPhone = '6281234567890'; // Ganti dengan nomor admin yang sebenarnya
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');

    // Close invoice modal
    setShowInvoice(false);
    setSelectedBooking(null);
  };

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
      console.log('CustomerBooking loaded from MySQL database:', customerBookings.length, 'bookings');
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setMyBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      console.log('🔄 Starting booking submission...');
      console.log('📝 Form data received:', bookingData);

      // Convert form data to database format
      const dbBookingData = {
        customer_name: bookingData.customerName,
        vehicle_number: bookingData.vehicleNumber,
        vehicle_type: bookingData.vehicleType,
        service_type: bookingData.serviceType,
        booking_date: bookingData.preferredDate,
        booking_time: bookingData.preferredTime,
        status: 'Menunggu', // Changed from 'pending' to match current Railway database ENUM
        phone: bookingData.phoneNumber,
        email: currentUser?.email || '',
        description: bookingData.description,
        estimated_cost: getEstimatedCost(bookingData.serviceType)
      };

      console.log('📤 Sending to API:', dbBookingData);

      // Save to database only - no localStorage
      const newBooking = await bookingsAPI.create(dbBookingData);
      console.log('✅ Booking saved successfully:', newBooking);

      // Close booking form
      setShowBookingForm(false);

      // Prepare booking data for invoice
      const invoiceBooking = {
        id: newBooking.id || Date.now(),
        customerName: bookingData.customerName,
        customerPhone: bookingData.phoneNumber,
        vehicleType: bookingData.vehicleType,
        licensePlate: bookingData.vehicleNumber,
        serviceType: bookingData.serviceType,
        serviceDate: bookingData.preferredDate,
        estimatedCost: getEstimatedCost(bookingData.serviceType),
        status: 'pending',
        notes: bookingData.description
      };

      console.log('📄 Showing invoice for booking:', invoiceBooking);

      // Show invoice
      setSelectedBooking(invoiceBooking as any);
      setShowInvoice(true);

      // Refresh bookings
      await fetchMyBookings();

      console.log('🎉 Booking process completed successfully!');
    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);

      // Show more detailed error message
      const errorMessage = error.message || 'Gagal membuat booking. Silakan coba lagi.';
      alert(`Gagal membuat booking: ${errorMessage}\n\nSilakan periksa koneksi internet Anda dan coba lagi.`);
    }
  };

  const getEstimatedCost = (serviceType: string) => {
    const costs: { [key: string]: number } = {
      'Service Rutin': 200000,
      'Ganti Oli': 150000,
      'Tune Up': 300000,
      'Perbaikan Mesin': 500000,
      'Perbaikan AC': 250000,
      'Ganti Ban': 800000,
      'Balancing & Spooring': 200000,
      'Body Repair': 600000,
      'Cat Ulang': 1000000,
      'Electrical': 300000,
      'Transmisi': 700000,
      'Rem': 250000,
      'Kopling': 400000
    };
    return costs[serviceType] || 150000;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600">Kelola booking service Anda</p>
            </div>
          </div>
          <button
            onClick={() => setShowBookingForm(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* New Booking Form */}
      <BookingForm
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        onSubmit={handleBookingSubmit}
      />

      {/* Bookings List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Your Bookings</h2>
        </div>

        {myBookings.length === 0 ? (
          <div className="p-8 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bookings yet</p>
            <p className="text-sm text-gray-400 mt-2">Create your first booking to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {myBookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.vehicle_info || `${booking.vehicle_number || 'N/A'} (${booking.vehicle_type || 'N/A'})`}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4" />
                        <span>{booking.service_type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('id-ID') : 'Tanggal tidak tersedia'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Rp {booking.estimated_cost ? booking.estimated_cost.toLocaleString() : '0'}</span>
                      </div>
                    </div>
                    {booking.notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        <FileText className="h-4 w-4 inline mr-1" />
                        {booking.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4 flex gap-2">
                    {/* View Invoice Button - Available for all bookings */}
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowInvoice(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Lihat Invoice
                    </button>

                    {/* Payment Button for Completed Services */}
                    {booking.status === 'Selesai' && (
                      <button
                        onClick={() => handlePayment(booking)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Bayar Sekarang
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedBooking && (
        <Invoice
          booking={{
            id: selectedBooking.id,
            customerName: selectedBooking.customer_name,
            customerPhone: selectedBooking.phone || '',
            customerEmail: selectedBooking.email || currentUser?.email || '',
            vehicleType: selectedBooking.vehicle_type || '',
            licensePlate: selectedBooking.vehicle_number || '',
            serviceType: selectedBooking.service_type,
            serviceDate: selectedBooking.booking_date,
            estimatedCost: selectedBooking.estimated_cost || getEstimatedCost(selectedBooking.service_type),
            status: selectedBooking.status,
            notes: selectedBooking.notes
          }}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};

export default CustomerBooking;
