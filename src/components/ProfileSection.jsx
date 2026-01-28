import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Edit3, Loader2 } from 'lucide-react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const ProfileSection = () => {
  const [profile, setProfile] = useState({
    name: 'username',
    email: 'you@example.com',
    phone: '+233*******',
    avatar: 'https://img.icons8.com/win10/1200/gender-neutral-user.jpg'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // For initial data fetch

  // Fetch initial user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsFetching(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("❌ No active session");
        setIsFetching(false);
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
        setTempProfile({
          name: userData.full_name || 'username',
          email: userData.email || 'you@example.com',
          phone: userData.phone_number || '+233*******',
          avatar: userData.profile_image || 'https://img.icons8.com/win10/1200/gender-neutral-user.jpg'
        });
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error.response?.data || error.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleEditClick = async () => {
    if (isEditing) {
      // Validate inputs before saving
      if (!tempProfile.name.trim() || !tempProfile.email.trim()) {
        alert('Name and email are required');
        return;
      }

      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.error("❌ No active session. User not logged in.");
          alert('Please log in to save changes');
          setIsLoading(false);
          return;
        }

        const accessToken = session.access_token;
        const submitData = {
          full_name: tempProfile.name,
          phone_number: tempProfile.phone,
          email: tempProfile.email,
        };

        const response = await axios.put(
          "https://plx-bckend.onrender.com/api/users/account-profile",
          submitData,
          {
            headers: { 
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
          }
        );

        console.log("✅ Update successful:", response.data);
        
        // Update the actual profile with the saved data
        setProfile({ ...tempProfile });

        
      } catch (error) {
        console.error("❌ Error updating account:", error.response?.data || error.message);
        alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
      } finally {
        setIsLoading(false);
        setIsEditing(false);
      }
    } else {
      // Start editing - copy current profile to temp
      setTempProfile({ ...profile });
      setIsEditing(true);
    }
  };

  const handleInputChange = (field, value) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setTempProfile({ ...profile });
    setIsEditing(false);
  };

  const currentData = isEditing ? tempProfile : profile;

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading profile...</span>
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
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
            <p className="text-gray-500 mt-1">Update your personal details</p>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <button 
                onClick={handleCancel}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={handleEditClick}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="Profile"
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
            {/* {isEditing && !isLoading && (
              <button 
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                onClick={() => alert('Image upload feature coming soon!')}
                title="Change profile picture"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )} */}
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h4>
            <p className="text-gray-600 mb-1 flex items-center justify-center sm:justify-start gap-2">
              <User className="w-4 h-4" />
              {profile.email}
            </p>
            <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2">
              <Phone className="w-4 h-4" />
              {profile.phone}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name *</label>
            <input
              type="text"
              value={currentData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              readOnly={!isEditing || isLoading}
              disabled={!isEditing || isLoading}
              className={`w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:border-transparent transition-colors ${
                !isEditing || isLoading 
                  ? 'border-gray-100 bg-gray-50/50 cursor-not-allowed' 
                  : 'border-gray-200 focus:ring-gray-900'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address *</label>
            <input
              type="email"
              value={currentData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              readOnly={!isEditing || isLoading}
              disabled={!isEditing || isLoading}
              className={`w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:border-transparent transition-colors ${
                !isEditing || isLoading 
                  ? 'border-gray-100 bg-gray-50/50 cursor-not-allowed' 
                  : 'border-gray-200 focus:ring-gray-900'
              }`}
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
            <input
              type="tel"
              value={currentData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              readOnly={!isEditing || isLoading}
              disabled={!isEditing || isLoading}
              className={`w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:border-transparent transition-colors ${
                !isEditing || isLoading 
                  ? 'border-gray-100 bg-gray-50/50 cursor-not-allowed' 
                  : 'border-gray-200 focus:ring-gray-900'
              }`}
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Note:</span> Fields marked with * are required. Click "Save Changes" to update your profile.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileSection;