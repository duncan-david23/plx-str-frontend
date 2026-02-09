import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import plangex_logo from '../assets/PlangeX_logo_white.png'; 
import plangex_logo_black from '../assets/PlangeX_logo.png'; 


import axios from 'axios';
import { 
  User, 
  MapPin, 
  Package, 
  LogOut,
  ChevronRight,
  ShoppingBag,
  CreditCard,
  Shield,
  Mail,
  MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrdersSection from '../components/OrdersSection';
import ProfileSection from '../components/ProfileSection';
import AddressSection from '../components/AddressesSection';
import ContactUs from '../components/ContactUs';


const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [profile, setProfile] = useState({
     name: '',
     email: '',
     phone: '',
     avatar: 'https://img.icons8.com/win10/1200/gender-neutral-user.jpg'
   });

  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      console.log('Signed out successfully');
      window.location.href = '/login'; 
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('business_name');
      localStorage.removeItem('userCart');
    }
  };

  const sidebarItems = [
    { id: 'profile', icon: <User className="w-5 h-5" />, label: 'Profile Settings', color: 'from-green-500 to-emerald-600' },
    { id: 'orders', icon: <Package className="w-5 h-5" />, label: 'My Orders', color: 'from-blue-500 to-purple-600' },
    { id: 'address', icon: <MapPin className="w-5 h-5" />, label: 'Addresses', color: 'from-amber-500 to-orange-600' },
    { id: 'contactus', icon: <MessageCircle className="w-5 h-5" />, label: 'Contact Us', color: 'from-green-500 to-green-700' },
    // { id: 'security', icon: <Shield className="w-5 h-5" />, label: 'Security', color: 'from-gray-500 to-gray-700' },
  ];







  // Fetch initial user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("❌ No active session");
        
        return;
      }

      const accessToken = session.access_token;
      
      // Fetch user data from your API
      const response = await axios.get(
        "https://plx-bckend.onrender.com/api/users/account-profile", 
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data) {
        const userData = response.data;
        setProfile({
          name: userData.full_name || 'username',
          email: userData.email || 'you@example.com',
          phone: userData.phone_number || '+233*******',
          avatar: userData.profile_image || 'https://img.icons8.com/win10/1200/gender-neutral-user.jpg'
        });
       
      }
      localStorage.setItem('userName', response.data.full_name || 'username');
    } catch (error) {
      console.error("❌ Error fetching user data:", error.response?.data || error.message);
    } finally {
      
    }
  };

  const getUsernameFromEmail = (email) => {
  if (!email) return "";
  return email.split("@")[0];
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
               <button 
                onClick={() => navigate('/store')}
                className="sm:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <ShoppingBag className="w-5 h-5" />
                <p className='hidden md:block'>Store</p>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              {/* <button 
                onClick={() => navigate('/products')}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop
              </button> */}
              <button 
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 shadow-sm">
              <div className="flex flex-col items-center text-center mb-8 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl">
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg mb-4"
                />
                <h2 className="font-bold text-gray-900 ">@{getUsernameFromEmail(profile.email)}</h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>

              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      activeTab === item.id
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-[5px] rounded-lg ${
                        activeTab === item.id ? 'bg-white/20' : `bg-gradient-to-r ${item.color} bg-opacity-10`
                      }`}>
                        {item.icon}
                      </div>
                      <span className="font-semibold text-sm">{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeTab === item.id ? 'rotate-90' : ''}`} />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                {activeTab === 'orders' && 'My Orders'}
                {activeTab === 'profile' && 'Profile Settings'}
                {activeTab === 'address' && 'Address Book'}
                {/* {activeTab === 'contactus' && 'Contact Us'} */}
              </h1>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'orders' && <OrdersSection />}
              {activeTab === 'profile' && <ProfileSection />}
              {activeTab === 'address' && <AddressSection />}
              {activeTab === 'contactus' && <ContactUs />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;