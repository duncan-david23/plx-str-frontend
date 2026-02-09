import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import plangex_logo_black from '../assets/PlangeX_logo.png'; 
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import capImg from '../assets/cap_img.jpg'
import hoodieImg from '../assets/hoodie_img.jpg'
import sweatshirtImg from '../assets/sweatsh_img.jpg'
import tshirtImg from '../assets/tshirt_img.jpg'
import teeBg from '../assets/tee_bg.jpg'

import { 
  Search, 
  ShoppingBag,
  X,
  User,
  ChevronRight,
  Package,
  SlidersHorizontal,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

const StoreProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Define all categories with their images - always show these
  const allCategories = [
    { 
      id: 'all', 
      name: 'All Products', 
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&q=80' 
    },
    { 
      id: 'caps', 
      name: 'Caps', 
      image: capImg
    },
    { 
      id: 'tshirt', 
      name: 'T-Shirts', 
      image: tshirtImg
    },
    { 
      id: 'hoodie', 
      name: 'Hoodies', 
      image: hoodieImg 
    },
    { 
      id: 'sweatshirt', 
      name: 'Sweatshirts', 
      image: sweatshirtImg
    },
  ];

  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  
  const cartItemsCount = state.cart?.length || 0;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to view products');
        setLoading(false);
        return;
      }

      const token = session.access_token;
      const userId = session.user.id;
      
      const response = await axios.get(
        'https://plx-bckend.onrender.com/api/users/users-products',
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let productsData = [];
      
      if (response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data && response.data.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        productsData = Object.values(response.data);
      }

      if (Array.isArray(productsData)) {
        const transformedProducts = productsData.map(product => ({
          id: product.product_id || product.id || Math.random().toString(36).substr(2, 9),
          name: product.product_name || product.name || 'Unnamed Product',
          price: parseFloat(product.sales_price || product.sale_price || product.product_price || product.price || 0),
          images: product.product_images || product.images || [],
          category: Array.isArray(product.product_categories || product.categories || []) 
            ? (product.product_categories || product.categories) 
            : [product.product_categories || product.categories || 'uncategorized'].filter(Boolean),
          sizes: Array.isArray(product.product_sizes || product.sizes || []) 
            ? (product.product_sizes || product.sizes) 
            : (product.product_sizes || product.sizes || '').split(',').map(s => s.trim()).filter(Boolean),
          description: product.product_description || product.description || '',
          stock: parseInt(product.product_stock || product.stock || 0),
          sku: product.skuid || product.sku || '',
          discount: parseFloat(product.product_discount || product.discount || 0),
          status: product.status || (parseInt(product.product_stock || product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'),
          isActive: product.isActive !== false
        }));

        setProducts(transformedProducts);
        
        const maxProductPrice = transformedProducts.reduce((max, product) => 
          Math.max(max, product.price), 1000
        );
        const roundedMax = Math.ceil(maxProductPrice / 100) * 100;
        setMaxPrice(roundedMax);
        setPriceRange([0, roundedMax]);
      } else {
        console.warn('No products data found or data is not an array');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Debounced price range update
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 150);

    return () => clearTimeout(timer);
  }, [priceRange]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        if (!product.category) return false;
        
        const productCategories = Array.isArray(product.category) 
          ? product.category.map(cat => cat.toLowerCase()) 
          : [product.category.toLowerCase()];
        
        return productCategories.includes(selectedCategory.toLowerCase());
      });
    }

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        if (product.name && product.name.toLowerCase().includes(query)) return true;
        
        if (product.description && product.description.toLowerCase().includes(query)) return true;
        
        if (product.sku && product.sku.toLowerCase().includes(query)) return true;
        
        if (product.category) {
          const productCategories = Array.isArray(product.category) 
            ? product.category 
            : [product.category];
          
          const hasMatchingCategory = productCategories.some(cat => 
            cat && cat.toLowerCase().includes(query)
          );
          
          if (hasMatchingCategory) return true;
        }
        
        return false;
      });
    }

    // Price filter with debounced values
    filtered = filtered.filter(product => 
      product.price >= debouncedPriceRange[0] && product.price <= debouncedPriceRange[1]
    );

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        filtered.sort((a, b) => (a.id || 0) - (b.id || 0));
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy, debouncedPriceRange]);

  const addToCart = (product, size, quantity) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        size,
        quantity,
        category: product.category && product.category.length > 0 ? product.category[0] : 'uncategorized'
      }
    });
  };

  const ProductCard = ({ product }) => {
    const productImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80';
    
    const productName = product.name || 'Unnamed Product';
    const productPrice = product.price || 0;
    const productCategory = product.category && product.category.length > 0 
      ? product.category[0] 
      : 'uncategorized';
    const productStock = product.stock || 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="group relative cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
        onClick={() => setSelectedProduct(product)}
      >
        {productStock < 30 && productStock > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-amber-100 text-amber-800 text-xs font-light px-2 py-1 rounded">
            Low Stock
          </div>
        )}
        {productStock === 0 && (
          <div className="absolute top-3 left-3 z-10 bg-gray-100 text-gray-600 text-xs font-light px-2 py-1 rounded">
            Sold Out
          </div>
        )}

        <div className="relative overflow-hidden bg-gray-50">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={productImage}
            alt={productName}
            className="w-full h-64 object-contain p-4"
          />
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-light uppercase tracking-wide">
              {productCategory}
            </span>
            <h3 className="text-gray-900 text-base font-normal leading-tight line-clamp-2">
              {productName}
            </h3>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-gray-900 font-light text-lg">
              {formatCurrency(productPrice)}
            </span>
            <span className="text-xs text-gray-500 font-light flex items-center">
              View Details
              <ChevronRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const ProductModal = ({ product, onClose }) => {
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    React.useEffect(() => {
      setSelectedSize('');
      setQuantity(1);
      setActiveImageIndex(0);
    }, [product]);

    const handleQuantityChange = (newQuantity) => {
      const maxQuantity = product?.stock || 1;
      setQuantity(Math.max(1, Math.min(maxQuantity, newQuantity)));
    };

    const handleAddToCart = () => {
      if (!selectedSize) {
        alert('Please select size');
        return;
      }
      
      addToCart(product, selectedSize, quantity);
      onClose();
    };

    const handleThumbnailClick = (index, e) => {
      e.stopPropagation();
      setActiveImageIndex(index);
    };

    if (!product) return null;

    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80'];
    
    const productSizes = product.sizes && product.sizes.length > 0 
      ? product.sizes 
      : ['S', 'M', 'L', 'XL'];
    
    const productStock = product.stock || 0;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Product Images */}
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={productImages[activeImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-contain"
                  />
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 bg-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 border border-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl text-gray-900 font-light mb-2">{product.name || 'Unnamed Product'}</h1>
                  <span className="text-xl text-gray-900 font-light">{formatCurrency(product.price || 0)}</span>
                  
                  <div className="flex items-center space-x-3 mb-4 mt-2">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Package className="w-4 h-4" />
                      <span className="text-sm font-light">
                        {productStock > 0 
                          ? `${productStock} available` 
                          : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm font-light leading-relaxed">{product.description || 'No description available.'}</p>

                {/* Size Selection */}
                <div>
                  <h3 className="text-gray-900 font-light mb-2">Select Size</h3>
                  <div className="grid grid-cols-4 gap-1">
                    {productSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 border rounded text-center text-sm font-light ${
                          selectedSize === size
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        } ${productStock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={productStock === 0}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div>
                    <h3 className="text-gray-900 font-light mb-2">Quantity</h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1 || productStock === 0}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-light">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= productStock || productStock === 0}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!selectedSize || productStock === 0}
                    onClick={handleAddToCart}
                    className={`w-full py-3 rounded text-sm font-light ${
                      selectedSize && productStock > 0
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {productStock === 0 ? 'Out of Stock' : 
                     !selectedSize ? 'Select Size' :
                     `Add to Cart • ${formatCurrency((product.price || 0) * quantity)}`}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const PriceFilter = () => {
    const handlePriceChange = (value) => {
      setPriceRange([0, parseInt(value)]);
    };

    const clearPriceFilter = () => {
      setPriceRange([0, maxPrice]);
    };

    const isPriceFilterActive = priceRange[1] < maxPrice;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full max-w-[200px] shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-gray-900 font-light">Price Range</h3>
          {isPriceFilterActive && (
            <button
              onClick={clearPriceFilter}
              className="text-xs text-gray-500 hover:text-gray-700 font-light"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Single slider for max price */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="w-full h-1.5 bg-gray-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
              style={{ 
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(priceRange[1]/maxPrice)*100}%, #d1d5db ${(priceRange[1]/maxPrice)*100}%, #d1d5db 100%)`
              }}
            />
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-light">
              <span>{formatCurrency(0)}</span>
              <span>{formatCurrency(maxPrice)}</span>
            </div>
          </div>
          
          {/* Price display */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-light text-gray-600">Max:</span>
              <span className="font-light text-gray-900">{formatCurrency(priceRange[1])}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SearchModal = () => {
    return (
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products or categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-light focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-light"
                >
                  Close
                </button>
              </div>
              
              {/* Search Results Preview */}
              {searchQuery && filteredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  <p className="text-sm text-gray-500 mb-3">
                    Found {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredProducts.slice(0, 4).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowSearchModal(false);
                        }}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-light text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 font-light">{formatCurrency(product.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredProducts.length > 4 && (
                    <button
                      onClick={() => setShowSearchModal(false)}
                      className="w-full mt-3 py-2 text-center text-sm text-gray-600 hover:text-gray-900 font-light"
                    >
                      View all {filteredProducts.length} results →
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-light">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg text-gray-900 font-light mb-2">Error Loading Products</h3>
          <p className="text-gray-600 font-light mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-900 text-white px-6 py-2 rounded text-sm font-light hover:bg-gray-800"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/store')} className="flex items-center">
              <img src={plangex_logo_black} alt="Plangex" className="h-7 w-auto" />
            </button>

            <div className="flex items-center space-x-3">
              {/* Search Icon Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-1.5 hover:bg-gray-100 rounded relative"
              >
                <Search className="w-4 h-4" />
              </button>

              <button 
                onClick={() => navigate('/store/cart')}
                className="p-1.5 hover:bg-gray-100 rounded relative"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <button 
                className="p-1.5 hover:bg-gray-100 rounded"
                onClick={() => navigate('/user-account')}
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal />

      {/* Hero Banner */}
      <div className="relative w-full h-[200px] sm:h-[225px] md:h-[250px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={teeBg}
            alt="Store Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center">
          <div className="text-white text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide">
              Plangex Store
            </h1>
            <p className="text-sm font-light text-gray-300 max-w-md">
              Premium designed apparels
            </p>
          </div>
        </div>
      </div>

      {/* Categories Section - Horizontal scroll on mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {allCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-col items-center space-y-2 group ${
                selectedCategory === category.id ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              <div className={`relative w-24 h-24 rounded-full overflow-hidden border-2 transition-all ${
                selectedCategory === category.id 
                  ? 'border-gray-900 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <img 
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className={`absolute inset-0 transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-black/30' 
                    : 'bg-black/20 group-hover:bg-black/30'
                }`} />
              </div>
              <span className="text-xs font-bold text-center">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 px-1 scrollbar-hide">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex flex-col items-center space-y-2 group ${
                  selectedCategory === category.id ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                <div className={`relative w-20 h-20 rounded-full overflow-hidden border-2 ${
                  selectedCategory === category.id 
                    ? 'border-gray-900' 
                    : 'border-gray-300'
                }`}>
                  <img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 ${
                    selectedCategory === category.id 
                      ? 'bg-black/30' 
                      : 'bg-black/20'
                  }`} />
                </div>
                <span className="text-xs font-bold text-center">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-base text-gray-900 font-light">
              {allCategories.find(c => c.id === selectedCategory)?.name || 'All Products'}
            </h2>
            <p className="text-gray-500 text-sm font-light">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowPriceFilter(!showPriceFilter)}
                className={`flex items-center space-x-2 border rounded px-3 py-1.5 text-sm font-light transition-colors ${
                  showPriceFilter || priceRange[1] < maxPrice
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Price</span>
              </button>
              
              {/* Price Filter Dropdown */}
              <AnimatePresence>
                {showPriceFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 z-40"
                  >
                    <PriceFilter />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm font-light focus:outline-none focus:border-gray-400"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base text-gray-900 font-light mb-2">No products found</h3>
            <p className="text-gray-600 text-sm font-light mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange([0, maxPrice]);
                setShowPriceFilter(false);
              }}
              className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-light hover:bg-gray-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
};

export default StoreProductsPage;