import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';
import plangex_logo_black from '../assets/PlangeX_logo.png';
import { 
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  Shield,
  CreditCard,
  ArrowLeft,
  Trash2,
  Package,
  AlertCircle,
  DollarSign,
  Loader2,
  CheckCircle,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { PaystackButton } from 'react-paystack';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const StoreCartPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [includeDelivery, setIncludeDelivery] = useState(true);
  const [orderData, setOrderData] = useState(null);
  
  const publicKey = 'pk_live_760359367d973660d1cd77f5f1954e00c0cc2e38';

  // Fetch user profile to check if complete
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoadingProfile(false);
          return;
        }
        
        const accessToken = session.access_token;
        const response = await axios.get(
          'https://plx-bckend.onrender.com/api/users/account-profile',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        
        if (response.data) {
          setUserProfile(response.data);
          // Check if profile is complete (has name and phone)
          const hasName = response.data.full_name && response.data.full_name.trim() !== '';
          const hasPhone = response.data.phone_number && response.data.phone_number.trim() !== '';
          setProfileComplete(hasName && hasPhone);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Unable to load your profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const cartItems = state.cart || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Delivery fee calculation
  const isEligibleForFreeShipping = subtotal > 500;
  const estimatedDeliveryFee = 40; // Base delivery fee
  const shipping = includeDelivery ? 
    (isEligibleForFreeShipping ? 0 : estimatedDeliveryFee) : 
    0;
  
  const total = subtotal + shipping;

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) {
      dispatch({
        type: 'REMOVE_FROM_CART',
        payload: { id: item.id, size: item.size }
      });
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: item.id, size: item.size, quantity: newQuantity }
      });
    }
  };

  const removeItem = (item) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { id: item.id, size: item.size }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const prepareOrderData = () => {
    // Create array of items with all required data matching backend expectations
    const order_items = cartItems.map(item => ({
      productId: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      size: item.size,
      quantity: item.quantity,
      itemTotal: item.price * item.quantity
    }));
    
    const order_total = total;
    const item_count = cartItems.length;
    
    return {
      order_items,
      order_total,
      item_count,
      delivery_included: includeDelivery,
      delivery_paid: includeDelivery,
      delivery_fee: includeDelivery ? shipping : 0,
      free_shipping_applied: isEligibleForFreeShipping && includeDelivery,
      customer_name: userProfile?.full_name,
      customer_phone: userProfile?.phone_number
    };
  };

  // Check if user can proceed to payment
  const canProceedToPayment = () => {
    if (loadingProfile) return false;
    if (!profileComplete) return false;
    return true;
  };

  // Custom Paystack button click handler
  const handlePaystackClick = (e) => {
    if (!canProceedToPayment()) {
      e.preventDefault();
      if (!profileComplete) {
        toast.error('Please complete your profile setup before making payment');
        alert('Please complete your profile setup:\n\n1. Go to your profile page\n2. Fill in your full name and phone number\n3. Save your profile\n4. Return to cart to complete payment');
        navigate('/profile');
      }
      return;
    }
  };

  const componentProps = {
    email: userProfile?.email || '',
    amount: total * 100,
    publicKey: publicKey,
    currency: 'GHS',
    text: 'Proceed to Checkout',
    onSuccess: async () => {
      try {
        await submitOrderToBackend();
        toast.success('Order placed successfully!');
        navigate('/thank-you');
      } catch (error) {
        // Payment succeeded but order submission failed
        toast.error('Payment succeeded but order submission failed.');
        console.error('Order submission error after payment:', error);
      }
    },
    onClose: () => {
      toast.error('Transaction was not completed, please try again.');
    }
  };

  // Function to submit order to backend
  const submitOrderToBackend = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please login to continue');
        return;
      }
      
      const accessToken = session.access_token;

      // Prepare order data matching backend requirements
      const orderData = prepareOrderData();

      console.log('Submitting order data:', orderData);

      // Submit order to custom orders endpoint
      const response = await axios.post(
        'https://plx-bckend.onrender.com/api/users/create-custom-order', // Adjust to your custom orders endpoint
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      // Clear cart after successful order
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('storeCart');
      
      return response.data;
      
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Toaster position="top-center" />
        <header className="sticky top-0 bg-white z-30 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => navigate('/store')} className="flex items-center">
                <img src={plangex_logo_black} alt="Plangex" className="h-8 w-auto" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
              <div className="w-8"></div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet.
            </p>
            <button
              onClick={() => navigate('/store')}
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" />
      <header className="sticky top-0 bg-white z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/store')} className="flex items-center">
              <img src={plangex_logo_black} alt="Plangex" className="h-8 w-auto" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Your Cart ({cartItems.length})</h1>
            <button
              onClick={clearCart}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={`${item.id}-${item.size}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-6 border border-gray-200 rounded-xl bg-white"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Size: <span className="font-medium text-gray-700">{item.size}</span>
                        </p>
                        <p className="text-base sm:text-lg font-bold text-gray-900 mt-2">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item)}
                        className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 sm:w-12 text-center font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium">Item Total</p>
                        <p className="text-lg sm:text-xl font-bold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/store')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                
                {/* Delivery Option */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-gray-700" />
                      <span className="font-medium text-gray-900">Delivery Option</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {includeDelivery ? 'Pay Now' : 'Pay on Delivery'}
                      </span>
                      <button
                        onClick={() => setIncludeDelivery(!includeDelivery)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          includeDelivery ? 'bg-black' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            includeDelivery ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    {includeDelivery ? (
                      <>
                        <p className="text-gray-700">
                          <span className="font-medium">Delivery fee included:</span> 
                          {isEligibleForFreeShipping ? ' FREE' : ` Estimated ${formatCurrency(estimatedDeliveryFee)}`}
                        </p>
                        {isEligibleForFreeShipping ? (
                          <p className="text-green-600 bg-green-50 p-2 rounded text-xs">
                            🎉 Free delivery applied!
                          </p>
                        ) : (
                          <p className="text-gray-500 text-xs">
                            Add {formatCurrency(500 - subtotal)} more for free delivery
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-gray-700 text-xs">
                          <span className="font-medium">Pay delivery fee when order arrives</span>
                        </p>
                        <p className="text-gray-500 text-xs">
                          Delivery fee varies based on your location
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Delivery Fee Display */}
                <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-4">
                  <span>
                    {includeDelivery ? 
                      (isEligibleForFreeShipping ? 'Delivery Fee' : 'Estimated Delivery Fee') : 
                      'Delivery Fee'
                    }
                  </span>
                  <span className={isEligibleForFreeShipping && includeDelivery ? 'text-green-600 font-medium' : ''}>
                    {includeDelivery ? 
                      (isEligibleForFreeShipping ? 'FREE' : formatCurrency(estimatedDeliveryFee)) : 
                      'Pay on Delivery'
                    }
                  </span>
                </div>
                
                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-medium text-gray-900">
                    <span>Total Amount</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {includeDelivery ? 
                      (isEligibleForFreeShipping ? 
                        'Includes FREE delivery' : 
                        'Includes estimated delivery fee'
                      ) : 
                      'Excludes delivery fee (Pay upon delivery)'
                    }
                  </p>
                </div>
              </div>

              {/* Profile Check Warning */}
              {!loadingProfile && !profileComplete && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Complete Your Profile</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Please add your full name and phone number to your profile before making payment.
                      </p>
                      <button
                        onClick={() => navigate('/profile')}
                        className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                      >
                        Go to Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Information Summary */}
              {profileComplete && userProfile && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Delivery Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{userProfile.full_name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{userProfile.phone_number}</span>
                    </div>
                    {userProfile.address && (
                      <div className="flex items-start text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                        <span>{userProfile.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paystack Button */}
              <div onClick={handlePaystackClick} className="mt-6">
                <PaystackButton 
                  {...componentProps} 
                  className={`w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 ${
                    !canProceedToPayment() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {loadingProfile ? (
                <p className="text-xs text-gray-500 text-center mt-4">
                  Checking profile...
                </p>
              ) : !profileComplete ? (
                <p className="text-xs text-red-500 text-center mt-4">
                  Please complete your profile to proceed with payment
                </p>
              ) : (
                <p className="text-xs text-gray-500 text-center mt-4">
                  {includeDelivery ? 
                    (isEligibleForFreeShipping ? 
                      'Your order includes free delivery' :
                      'Your order includes estimated delivery fee'
                    ) : 
                    'Delivery fee will be determined based on your location'
                  }
                </p>
              )}

              {/* Payment Security */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                <div className="flex items-center justify-center text-gray-500">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Important Notice */}
        <div className="lg:hidden mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 text-sm">Important</p>
              <p className="text-amber-700 text-xs mt-1">
                Please ensure your profile is complete with name and phone number before checkout.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoreCartPage;