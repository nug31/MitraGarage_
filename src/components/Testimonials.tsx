import React, { useState, useEffect } from 'react';
import {
  Star,
  User,
  Calendar,
  MessageCircle,
  ThumbsUp,
  Filter,
  Plus,
  Car,
  Save,
  X,
  Search
} from 'lucide-react';
import { testimonialsAPI } from '../utils/mysqlDatabase';
import LoadingSpinner from './LoadingSpinner';

const Testimonials = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    comment: '',
    serviceType: ''
  });

  // Load testimonials data
  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialsAPI.getAll();
      setTestimonials(data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const testimonialToSave = {
        customer_name: formData.customerName,
        rating: formData.rating,
        comment: formData.comment,
        service_type: formData.serviceType
      };

      await testimonialsAPI.create(testimonialToSave);
      await loadTestimonials();
      resetForm();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('Error saving testimonial. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      rating: 5,
      comment: '',
      serviceType: ''
    });
    setShowAddForm(false);
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch =
      testimonial.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || testimonial.rating.toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  const averageRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0';
  const totalReviews = testimonials.length;

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: testimonials.filter(t => t.rating === rating).length,
      percentage: (testimonials.filter(t => t.rating === rating).length / totalReviews) * 100
    }));
    return distribution;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Testimoni & Rating</h2>
          <p className="text-gray-600">Feedback dari pelanggan Mitra Garage</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Testimoni
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
                placeholder="Cari testimoni berdasarkan nama, layanan, atau komentar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Rating</option>
              <option value="5">5 Bintang</option>
              <option value="4">4 Bintang</option>
              <option value="3">3 Bintang</option>
              <option value="2">2 Bintang</option>
              <option value="1">1 Bintang</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating}</div>
            <div className="mb-2">{renderStars(Number(averageRating), 'lg')}</div>
            <div className="text-gray-600">Berdasarkan {totalReviews} ulasan</div>
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-2">
              {getRatingDistribution().map((item) => (
                <div key={item.rating} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 w-8">{item.rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Testimoni Pelanggan ({filteredTestimonials.length})
        </h3>
        {loading ? (
          <LoadingSpinner text="Memuat testimoni..." />
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterRating !== 'all'
              ? 'Tidak ada testimoni yang sesuai dengan filter'
              : 'Belum ada testimoni yang diberikan'
            }
          </div>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-blue-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.customer_name}</h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Car className="h-4 w-4 mr-1" />
                        {testimonial.service_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {renderStars(testimonial.rating, 'sm')}
                        <span className="text-sm text-gray-600">{testimonial.rating}/5</span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(testimonial.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {testimonial.service_type}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {testimonial.comment}
                </p>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">Membantu</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">Balas</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Add Testimonial Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tambah Testimoni</h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Layanan</label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Layanan</option>
                  <option value="Ganti Oli">Ganti Oli</option>
                  <option value="Service Rem">Service Rem</option>
                  <option value="Tune Up">Tune Up</option>
                  <option value="Ganti Aki">Ganti Aki</option>
                  <option value="Service AC">Service AC</option>
                  <option value="Balancing Ban">Balancing Ban</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        star <= formData.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">Rating: {formData.rating}/5</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ulasan</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tulis ulasan Anda tentang pelayanan yang diterima..."
                  required
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

export default Testimonials;