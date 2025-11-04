import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  DollarSign
} from 'lucide-react';
import { inventoryAPI } from '../utils/mysqlDatabase';
import LoadingSpinner from './LoadingSpinner';

interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  brand?: string;
  image_url?: string;
}

interface CartItem extends Item {
  quantity: number;
}

interface BrowseItemsProps {
  currentUser: any;
}

const BrowseItems: React.FC<BrowseItemsProps> = ({ currentUser }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = ['all', 'Oli Mesin', 'Filter', 'Ban', 'Aki', 'Spare Part', 'Aksesoris'];

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Use MySQL database only - no fallback to localStorage
      const data = await inventoryAPI.getAll();
      setItems(data as Item[]);
      console.log('BrowseItems loaded from MySQL database:', data.length, 'items');
    } catch (error) {
      console.error('Error fetching items:', error);
      // Set sample data if both fail
      setItems([
        { id: 1, name: 'Oli Mesin Mobil', category: 'Oli Mesin', price: 75000, stock: 25, description: 'Oli mesin berkualitas tinggi untuk mobil' },
        { id: 2, name: 'Filter Udara', category: 'Filter', price: 45000, stock: 15, description: 'Filter udara original untuk berbagai jenis mobil' },
        { id: 3, name: 'Ban Mobil R15', category: 'Ban', price: 650000, stock: 8, description: 'Ban mobil ukuran R15 dengan kualitas premium' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const addToCart = (item: Item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        if (existingItem.quantity < item.stock) {
          return prevCart.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }
        return prevCart;
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter(cartItem => cartItem.id !== itemId);
      }
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleOrder = () => {
    // Create order object
    const order = {
      id: Date.now(),
      order_date: new Date().toISOString(),
      status: 'Processing',
      total_amount: getTotalPrice(),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      })),
      customer_name: currentUser.full_name,
      customer_email: currentUser.email,
      notes: 'Order placed from Browse Items'
    };

    // Save order to localStorage
    try {
      const existingOrders = localStorage.getItem(`orders_${currentUser.email}`);
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      orders.unshift(order); // Add new order at the beginning
      localStorage.setItem(`orders_${currentUser.email}`, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving order:', error);
    }

    // Show success and reset cart
    setOrderSuccess(true);
    setCart([]);
    setShowCart(false);
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Items</h1>
              <p className="text-gray-600">Temukan dan pesan item yang Anda butuhkan</p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center space-x-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Cart</span>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Cari item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Semua Kategori' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xl font-bold text-green-600">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  item.stock > 10 ? 'bg-green-100 text-green-800' :
                  item.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Stok: {item.stock}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {cart.find(cartItem => cartItem.id === item.id) ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold">
                        {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={item.stock <= (cart.find(cartItem => cartItem.id === item.id)?.quantity || 0)}
                        className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.stock === 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            disabled={item.stock <= item.quantity}
                            className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-xl font-bold text-green-600">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(getTotalPrice())}
                      </span>
                    </div>
                    <button
                      onClick={handleOrder}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
                    >
                      Place Order
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-600 mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-600">Your order has been submitted and will be processed soon.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseItems;
