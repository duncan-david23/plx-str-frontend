import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, Truck, Search, Package, User, Mail, Phone, MapPin, ChevronDown, ChevronUp, Loader, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 10
  });

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }

      const token = session.access_token;

      const response = await axios.get(
        `https://plx-bckend.onrender.com/api/users/custom-orders?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Backend response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        const ordersData = response.data;
        
        const transformedOrders = ordersData.map(order => ({
          id: order.id || `ORD-${order.order_id}`,
          order_id: order.order_id || order.id,
          date: order.created_at,
          items: Array.isArray(order.items) ? order.items.map(item => ({
            name: item.name || 'Custom Product',
            quantity: item.quantity || 1,
            price: item.price || item.itemTotal || 0,
            size: item.size || 'N/A',
            image: item.image || null,
            productId: item.productId,
            itemTotal: item.itemTotal || (item.price * item.quantity)
          })) : [],
          total: order.order_total || 0,
          status: order.status || 'pending',
          customer_name: order.customer_name || '',
          customer_email: order.customer_email || '',
          customer_phone: order.customer_phone || '',
          customer_address: order.customer_address || '',
          item_count: parseInt(order.item_count) || 0,
          created_at: order.created_at,
          updated_at: order.updated_at,
          user_id: order.user_id
        }));

        console.log('Transformed orders:', transformedOrders);
        setOrders(transformedOrders);
        
        setPagination({
          current_page: page,
          total_pages: Math.ceil(transformedOrders.length / 10),
          total_count: transformedOrders.length,
          per_page: 10
        });
      } else if (response.data.orders && Array.isArray(response.data.orders)) {
        const ordersData = response.data.orders;
        
        const transformedOrders = ordersData.map(order => ({
          id: order.id || `ORD-${order.order_id}`,
          order_id: order.order_id || order.id,
          date: order.created_at,
          items: Array.isArray(order.items) ? order.items.map(item => ({
            name: item.name || 'Custom Product',
            quantity: item.quantity || 1,
            price: item.price || item.itemTotal || 0,
            size: item.size || 'N/A',
            image: item.image || null,
            productId: item.productId,
            itemTotal: item.itemTotal || (item.price * item.quantity)
          })) : [],
          total: order.order_total || 0,
          status: order.status || 'pending',
          customer_name: order.customer_name || '',
          customer_email: order.customer_email || '',
          customer_phone: order.customer_phone || '',
          customer_address: order.customer_address || '',
          item_count: parseInt(order.item_count) || 0,
          created_at: order.created_at,
          updated_at: order.updated_at,
          user_id: order.user_id
        }));

        console.log('Transformed orders (alternate format):', transformedOrders);
        setOrders(transformedOrders);
        
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        } else {
          setPagination({
            current_page: page,
            total_pages: Math.ceil(transformedOrders.length / 10),
            total_count: transformedOrders.length,
            per_page: 10
          });
        }
      } else {
        setOrders([]);
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_count: 0,
          per_page: 10
        });
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-500/10 text-green-600';
      case 'completed': return 'bg-green-500/10 text-green-600';
      case 'shipped': return 'bg-blue-500/10 text-blue-600';
      case 'processing': return 'bg-amber-500/10 text-amber-600';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600';
      case 'cancelled': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const OrderCard = ({ order }) => {
    const isExpanded = expandedOrderId === order.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      >
        {/* Collapsed Header */}
        <div 
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleOrderExpand(order.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status || 'pending'}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Order #{order.order_id}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(order.date || order.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(order.total)}
                </div>
                <p className="text-sm text-gray-500">
                  {order.item_count || order.items?.length || 0} item{(order.item_count !== 1 && order.items?.length !== 1) ? 's' : ''}
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
          
          {/* Quick info row */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            {order.customer_name && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{order.customer_name}</span>
              </div>
            )}
            {order.customer_email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>{order.customer_email}</span>
              </div>
            )}
            {order.customer_phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>{order.customer_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100"
            >
              <div className="p-6 pt-4">
                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
                          {item.image ? (
                            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg overflow-hidden border border-gray-200">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">{item.name}</h5>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                              {item.size && item.size !== 'N/A' && (
                                <span className="text-xs text-gray-500">• Size: {item.size}</span>
                              )}
                              <span className="text-xs text-blue-500">• {formatCurrency(item.price)} each</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(item.itemTotal || (item.price * item.quantity))}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-3 text-gray-400 text-sm">
                        No items found for this order
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                {order.customer_address && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                    <div className="flex items-start gap-2 p-3 bg-gray-50/50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{order.customer_address}</p>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleViewOrderDetails(order)}
                    className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const OrderModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{order.order_id}</h2>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(order.created_at)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Status and Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-4">Order Status</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="font-medium capitalize">{order.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Last updated: {formatDate(order.updated_at)}
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Total:</span>
                    <span className="font-medium">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Count:</span>
                    <span className="font-medium">{order.item_count || order.items?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-medium">Order Total:</span>
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{order.customer_name || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{order.customer_email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{order.customer_phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="font-medium">{order.customer_address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      {item.image && (
                        <div className="flex-shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => window.open(item.image, '_blank')}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                          {item.size && item.size !== 'N/A' && (
                            <span className="text-sm text-gray-600">Size: {item.size}</span>
                          )}
                          <span className="text-sm text-blue-600">Price: {formatCurrency(item.price)} each</span>
                          <span className="text-sm text-gray-600">Product ID: {item.productId || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(item.itemTotal || (item.price * item.quantity))}</p>
                        <p className="text-sm text-gray-500">Item total</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3" />
                    <p>No items in this order</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      order.order_id.toLowerCase().includes(searchLower) ||
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.customer_email.toLowerCase().includes(searchLower) ||
      order.customer_phone.toLowerCase().includes(searchLower) ||
      order.items?.some(item => 
        item.name.toLowerCase().includes(searchLower)
      )
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="w-12 h-12 text-gray-400 animate-spin mb-4" />
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={() => fetchOrders()}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Order History</h3>
          <p className="text-gray-500 mt-1">
            {pagination.total_count} order{pagination.total_count !== 1 ? 's' : ''} total
            {pagination.total_pages > 1 && ` • Page ${pagination.current_page} of ${pagination.total_pages}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-500 mb-2">
            {searchTerm ? 'No orders found' : 'No orders yet'}
          </h4>
          <p className="text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Your order history will appear here'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => fetchOrders(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              
              <button
                onClick={() => fetchOrders(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <OrderModal 
            order={selectedOrder} 
            onClose={handleCloseModal} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrdersSection;