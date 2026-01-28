import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import plangex_logo_black from '../assets/PlangeX_logo.png'; 
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { 
  Search, 
  ShoppingBag,
  X,
  User,
  Filter,
  Grid,
  List,
  Minus,
  Plus,
  Package,
  Tag
} from 'lucide-react';

const StoreProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Products' },
  ]);

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
      
      // Fetch products from your backend
      const response = await axios.get(
        'https://plx-bckend.onrender.com/api/users/users-products',
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      

      // Handle different response structures
      let productsData = [];
      
      if (response.data && Array.isArray(response.data)) {
        // Response is already an array
        productsData = response.data;
      } else if (response.data && response.data.products && Array.isArray(response.data.products)) {
        // Response has a products property
        productsData = response.data.products;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Response has a data property
        productsData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Convert object values to array if needed
        productsData = Object.values(response.data);
      }

      if (Array.isArray(productsData)) {
        // Transform products data
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
        
        // Extract unique categories for filtering
        const allCategories = new Set();
        transformedProducts.forEach(product => {
          if (Array.isArray(product.category)) {
            product.category.forEach(cat => {
              if (cat && typeof cat === 'string' && cat.toLowerCase() !== 'uncategorized') {
                allCategories.add(cat.toLowerCase());
              }
            });
          }
        });

        // Build categories array for filtering
        const categoryOptions = [
          { id: 'all', name: 'All Products' },
          ...Array.from(allCategories).map(cat => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1)
          }))
        ];
        
        setCategories(categoryOptions);
      } else {
        console.warn('No products data found or data is not an array');
        setProducts([]);
        setCategories([{ id: 'all', name: 'All Products' }]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load products');
      setProducts([]);
      setCategories([{ id: 'all', name: 'All Products' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category && product.category.includes(selectedCategory)
      );
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

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
        // Keep original order or sort by id
        filtered.sort((a, b) => (a.id || 0) - (b.id || 0));
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy]);

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
        className="group relative cursor-pointer"
        onClick={() => setSelectedProduct(product)}
      >
        {productStock < 30 && productStock > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Low Stock
          </div>
        )}
        {productStock === 0 && (
          <div className="absolute top-4 left-4 z-10 bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Sold Out
          </div>
        )}

        <div className="relative overflow-hidden bg-gray-50 rounded-xl mb-4">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={productImage}
            alt={productName}
            className="w-full h-64 object-contain"
          />
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <motion.span
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm"
            >
              View Details
            </motion.span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-900 text-lg">{productName}</h3>
            <span className="text-sm text-gray-900">{formatCurrency(productPrice)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tag className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-gray-500 capitalize">{productCategory}</span>
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid lg:grid-cols-2 gap-8 p-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-gray-50">
                  <img
                    src={productImages[activeImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-contain"
                  />
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Thumbnail Images */}
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleThumbnailClick(index, e)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === activeImageIndex 
                          ? 'border-gray-900' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`View ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name || 'Unnamed Product'}</h1>
                  <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.price || 0)}</span>
                  
                  <div className="flex items-center space-x-4 mb-6 mt-2">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Package className="w-4 h-4" />
                      <span className="text-sm">
                        {productStock > 0 
                          ? `${productStock} available` 
                          : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed">{product.description || 'No description available.'}</p>

                {/* Size Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Select Size</h3>
                    <button className="text-sm text-gray-500 hover:text-gray-700">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {productSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 border rounded-lg text-center transition-all ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        } ${productStock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={productStock === 0}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Quantity</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1 || productStock === 0}
                          className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= productStock || productStock === 0}
                          className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!selectedSize || productStock === 0}
                    onClick={handleAddToCart}
                    className={`w-full py-4 rounded-lg font-medium transition-all ${
                      selectedSize && productStock > 0
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {productStock === 0 ? 'Out of Stock' : 
                     !selectedSize ? 'Select Size' :
                     `Add to Cart • ${formatCurrency((product.price || 0) * quantity)}`}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const FiltersModal = () => (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setShowFilters(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Product Code: A to Z</option>
                  <option value="name-desc">Product Code: Z to A</option>
                </select>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/store')} className="flex items-center">
              <img src={plangex_logo_black} alt="Plangex" className="h-8 w-auto" />
            </button>

            <nav className="hidden md:flex items-center space-x-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'text-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent text-sm w-48"
                />
              </div>

              <button 
                onClick={() => navigate('/store/cart')}
                className="p-2 hover:bg-gray-100 rounded-full relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <button 
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => window.open('https://plangex.com/user-account', '_blank')}
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="md:hidden mt-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2 text-sm rounded-full border transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-black text-white border-black'
                      : 'text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-gray-500">{filteredProducts.length} products</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Product Code: A-Z</option>
              <option value="name-desc">Product Code: Z-A</option>
            </select>

            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </button>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'list' 
              ? 'grid-cols-1' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
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

      <FiltersModal />
    </div>
  );
};

export default StoreProductsPage;