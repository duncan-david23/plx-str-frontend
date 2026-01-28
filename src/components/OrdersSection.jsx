import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, Truck, Search, Filter, Download, Eye, Loader, AlertCircle, Package } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const OrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

      // Get auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }

      const token = session.access_token;

      // Fetch orders from your backend API
      const response = await axios.get(
        `https://plx-bckend.onrender.com/api/users/orders?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.orders) {
        // Transform backend data to match frontend format
        const transformedOrders = response.data.orders.map(order => ({
          id: order.order_id || `ORD-${order.order_id || order.order_id}`,
          order_id: order.order_id, // Keep original ID
          date: order.created_at,
          items: Array.isArray(order.items) ? order.items.map(item => ({
            name: item.product_name || 'Custom Product',
            quantity: item.quantity || 1,
            price: item.product_price || item.total_price || 0,
            size: item.size,
            custom_instructions: item.custom_instructions,
            preview_image: item.preview_image || null,
            uploaded_designs: item.uploaded_designs || [],
            uploaded_designs_count: item.uploaded_designs_count || 0
          })) : [],
          total: order.order_total || 0,
          status: order.status || 'pending',
          customer_name: order.customer_name || '',
          customer_email: order.customer_email || '',
          customer_phone: order.customer_phone || '',
          customer_address: order.customer_address || '',
          item_count: order.item_count || 0,
          created_at: order.created_at,
          updated_at: order.updated_at
        }));

        setOrders(transformedOrders);
        


        // Update pagination info if available from backend
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load orders');
      
      // For development, use mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        setOrders(getMockOrders());
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development/fallback
  const getMockOrders = () => [
    {
      id: 'ORD-001',
      order_id: '001',
      date: '2024-01-15',
      items: [
        { 
          name: 'Custom T-Shirt', 
          quantity: 2, 
          price: 45.00, 
          size: 'M',
          custom_instructions: 'Print on front',
          previewImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=150&fit=crop' 
        }
      ],
      total: 90.00,
      status: 'delivered',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      item_count: 1,
      created_at: '2024-01-15T10:30:00Z'
    }
  ];

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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrderDetails = (orderId) => {
    // Navigate to order details page or show modal
    console.log('View order details:', orderId);
    // Example: navigate(`/orders/${orderId}`);
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      // In the future, implement invoice download
      alert('Invoice download feature coming soon!');
    } catch (err) {
      console.error('Error downloading invoice:', err);
    }
  };

  const handleTrackOrder = (order) => {
    if (order.status === 'shipped' || order.status === 'delivered') {
      // Implement tracking logic
      alert(`Tracking for order ${order.id} - Coming soon!`);
    }
  };

  const OrderCard = ({ order }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            <h3 className="font-bold text-gray-900 text-lg">{order.order_id}</h3>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="capitalize">{order.status || 'pending'}</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(order.date || order.created_at)}
          </p>
          
          {order.customer_name && (
            <p className="text-sm text-gray-500 mt-1">
              Ordered by: {order.customer_name}
            </p>
          )}
        </div>
        
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(order.total)}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {order.items && order.items.length > 0 ? (
          order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl">
              {item.preview_image ? (
                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={item.preview_image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=No+Preview';
                    }}
                    onClick={() => {window.open(item.preview_image, '_blank') }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  {item.size && (
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                  )}
                  {item.uploaded_designs_count > 0 && (
                    <p className="text-sm text-blue-500">
                      {item.uploaded_designs_count} design{item.uploaded_designs_count !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                {item.custom_instructions && (
                  <p className="text-xs text-gray-400 mt-1">
                    Note: {item.custom_instructions}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                <p className="text-sm text-gray-500">each</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-400">
            No items found for this order
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
        {/* <div className="flex items-center gap-2">
          {(order.status === 'shipped' || order.status === 'delivered') && (
            <button 
              onClick={() => handleTrackOrder(order)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:opacity-90"
            >
              <Truck className="w-4 h-4" />
              Track Order
            </button>
          )}
          <div className="text-sm text-gray-500">
            {order.item_count || order.items?.length || 0} item{(order.item_count !== 1) ? 's' : ''}
          </div>
        </div> */}
        {/* <div className="flex items-center gap-2">
          <button 
            onClick={() => handleViewOrderDetails(order.order_id || order.id)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleDownloadInvoice(order.order_id || order.id)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Download Invoice"
          >
            <Download className="w-5 h-5" />
          </button>
        </div> */}
      </div>
    </motion.div>
  );

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    order.items?.some(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.custom_instructions && item.custom_instructions.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

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
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          {/* <button className="inline-flex items-center gap-2 px-5 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            Filter
          </button> */}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-500 mb-2">No orders found</h4>
          <p className="text-gray-400">
            {searchTerm ? 'Try a different search term' : 'Your order history will appear here'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
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
    </motion.div>
  );
};

export default OrdersSection;