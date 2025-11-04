import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';

interface InvoiceProps {
  booking: {
    id: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    vehicleType: string;
    licensePlate: string;
    serviceType: string;
    serviceDate: string;
    estimatedCost: number;
    status: string;
    notes?: string;
  };
  onClose: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ booking, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow && invoiceRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${booking.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .invoice-container { max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
              .invoice-details { margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .total { font-size: 20px; font-weight: bold; margin-top: 20px; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            ${invoiceRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const ppn = booking.estimatedCost * 0.11; // PPN 11%
  const total = booking.estimatedCost + ppn;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header Actions */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center print:hidden">
          <h2 className="text-2xl font-bold text-gray-900">Invoice Booking</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef} className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">Mitra Garage</h1>
            <p className="text-gray-600">Sistem Manajemen Bengkel Terpadu</p>
            <p className="text-sm text-gray-500 mt-2">
              Jl. Contoh No. 123, Jakarta | Telp: (021) 1234-5678 | Email: info@mitragarage.com
            </p>
          </div>

          <div className="border-t-2 border-purple-600 pt-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice</h3>
                <p className="text-gray-600">No. Invoice: <span className="font-semibold">#{String(booking.id).padStart(6, '0')}</span></p>
                <p className="text-gray-600">Tanggal: <span className="font-semibold">{new Date().toLocaleDateString('id-ID')}</span></p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status === 'completed' ? 'Selesai' :
                   booking.status === 'confirmed' ? 'Dikonfirmasi' :
                   booking.status === 'pending' ? 'Menunggu' :
                   booking.status}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelanggan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama Pelanggan</p>
                  <p className="font-semibold text-gray-900">{booking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">No. Telepon</p>
                  <p className="font-semibold text-gray-900">{booking.customerPhone}</p>
                </div>
                {booking.customerEmail && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{booking.customerEmail}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Jenis Kendaraan</p>
                  <p className="font-semibold text-gray-900">{booking.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plat Nomor</p>
                  <p className="font-semibold text-gray-900">{booking.licensePlate}</p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Layanan</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 text-gray-700">Layanan</th>
                    <th className="text-left py-3 px-4 text-gray-700">Tanggal Service</th>
                    <th className="text-right py-3 px-4 text-gray-700">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900">{booking.serviceType}</p>
                      {booking.notes && (
                        <p className="text-sm text-gray-600 mt-1">Catatan: {booking.notes}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-700">{formatDate(booking.serviceDate)}</td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">
                      {formatCurrency(booking.estimatedCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-end mb-2">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(booking.estimatedCost)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">PPN (11%):</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(ppn)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-gray-300 mt-2">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-purple-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">Terima kasih atas kepercayaan Anda menggunakan layanan Mitra Garage</p>
                <p>Invoice ini adalah bukti sah pembayaran yang dicetak secara otomatis</p>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-16">Pelanggan</p>
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm font-semibold">{booking.customerName}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-16">Mitra Garage</p>
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm font-semibold">Petugas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;

