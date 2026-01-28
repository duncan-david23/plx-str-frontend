import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Edit3, Plus, X, Check, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios'

const API_BASE_URL = 'https://plx-bckend.onrender.com/api/users';

const AddressSection = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editAddressText, setEditAddressText] = useState('');

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found");
        setIsLoading(false);
        return;
      }

      const token = session.access_token;
      
      const response = await axios.get(
        `${API_BASE_URL}/user-address`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      // console.log("Fetched addresses:", response.data.addresses);
      
      if (response.data.addresses && Array.isArray(response.data.addresses)) {
        const formattedAddresses = response.data.addresses.map(addr => ({
          id: addr.id,
          full_address: addr.address,
          is_default: addr.is_default
        }));
        
        setAddresses(formattedAddresses);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      alert('Failed to load addresses. Please try again.');
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      alert('Please enter an address');
      return;
    }

    try {
      setIsSaving(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please log in to save address');
        setIsSaving(false);
        return;
      }

      const token = session.access_token;
      
      const addressData = {
        address: newAddress.trim(),
        is_default: addresses.length === 0
      };

      // console.log('Sending to backend:', addressData);

      const response = await axios.post(
        `${API_BASE_URL}/user-address`,
        addressData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        // console.log('Address saved successfully:', response.data);
        
        const newAddressObj = {
          id: response.data.profile?.id || Date.now(),
          full_address: newAddress.trim(),
          is_default: addressData.is_default
        };
        
        if (addressData.is_default) {
          setAddresses(prev => [
            newAddressObj,
            ...prev.map(addr => ({ ...addr, is_default: false }))
          ]);
        } else {
          setAddresses(prev => [...prev, newAddressObj]);
        }
        
        setNewAddress('');
        setShowAddAddress(false);
        
        alert('Address saved successfully!');
        
      } else {
        throw new Error('Saving address failed');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Failed to save address. Please try again.');
      }
      // Re-fetch to ensure sync with server
      fetchAddresses();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to update address');
        return;
      }

      const token = session.access_token;
      
      // Update in database first
      const response = await axios.patch(
        `${API_BASE_URL}/user-address/${id}`,
        { is_default: true },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // console.log('Default address updated successfully:', response.data);
        
        // Update state with server response
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          is_default: addr.id === id
        })));
        
      } else {
        throw new Error('Failed to update default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert(error.response?.data?.error || 'Failed to set default address. Please try again.');
      // Re-fetch to sync with server
      fetchAddresses();
    }
  };

  const handleRemoveAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to delete address');
        setIsDeleting(false);
        return;
      }

      const token = session.access_token;
      
      // Get the address before deleting to check if it's default
      const addressToRemove = addresses.find(addr => addr.id === id);
      
      // Delete from database
      const response = await axios.delete(
        `${API_BASE_URL}/user-address/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.status === 200) {
       
        
        // Remove from state
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        
        // If we removed the default address, show message
        if (addressToRemove?.is_default) {
          alert('Default address deleted. You may want to set a new default address.');
        }
        
      } else {
        throw new Error('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert(error.response?.data?.error || 'Failed to delete address. Please try again.');
      // Re-fetch to sync with server
      fetchAddresses();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditAddress = (id) => {
    const addressToEdit = addresses.find(addr => addr.id === id);
    if (!addressToEdit) return;
    
    console.log('Edit address clicked:', addressToEdit);
    setEditingId(id);
    setEditAddressText(addressToEdit.full_address);
  };

  const handleSaveEdit = async (id) => {
    if (!editAddressText.trim()) {
      alert('Please enter an address');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to update address');
        return;
      }

      const token = session.access_token;
      
      // Update in database
      const response = await axios.patch(
        `${API_BASE_URL}/user-address/${id}`,
        { address: editAddressText.trim() },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // console.log('Address updated successfully:', response.data);
        
        // Update state with server response
        setAddresses(prev => prev.map(addr => 
          addr.id === id 
            ? { ...addr, full_address: editAddressText.trim() }
            : addr
        ));
        
        setEditingId(null);
        setEditAddressText('');
        
        alert('Address updated successfully!');
        
      } else {
        throw new Error('Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert(error.response?.data?.error || 'Failed to update address. Please try again.');
      // Re-fetch to sync with server
      fetchAddresses();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAddressText('');
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">Loading addresses...</h3>
        <p className="text-gray-500 mt-1">Please wait while we fetch your saved addresses</p>
      </motion.div>
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
          <h3 className="text-xl font-bold text-gray-900">Saved Addresses</h3>
          <p className="text-gray-500 mt-1">
            {addresses.length === 0 
              ? 'No addresses saved yet' 
              : `${addresses.length} address${addresses.length !== 1 ? 'es' : ''} saved`}
          </p>
        </div>
        <button 
          onClick={() => setShowAddAddress(true)}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-3.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add New Address
        </button>
      </div>

      {/* Add Address Form */}
      {showAddAddress && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border-2 border-gray-900 shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-gray-900 text-lg">Enter New Address</h4>
            <button 
              onClick={() => {
                setShowAddAddress(false);
                setNewAddress('');
              }}
              disabled={isSaving}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Full Address *
            </label>
            <textarea
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter your complete address (street, city, state, zip code, country)"
              disabled={isSaving}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent h-40 resize-none text-lg disabled:opacity-50 disabled:bg-gray-50"
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={() => {
                setShowAddAddress(false);
                setNewAddress('');
              }}
              disabled={isSaving}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddAddress}
              disabled={isSaving || !newAddress.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Address
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Address Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-2xl border-2 p-6 hover:shadow-xl transition-all ${
              address.is_default ? 'border-gray-900 shadow-lg' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Address {addresses.findIndex(a => a.id === address.id) + 1}
                  </h4>
                  {address.is_default && (
                    <span className="px-2.5 py-1 bg-black text-white text-xs font-medium rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {editingId === address.id ? (
                  <>
                    <button 
                      onClick={() => handleSaveEdit(address.id)}
                      disabled={isDeleting}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg disabled:opacity-50"
                      title="Save edit"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      disabled={isDeleting}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      title="Cancel edit"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleEditAddress(address.id)}
                      disabled={isDeleting}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      title="Edit address"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleRemoveAddress(address.id)}
                      disabled={isDeleting}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      title="Delete address"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3 text-gray-600 mb-6">
              {editingId === address.id ? (
                <textarea
                  value={editAddressText}
                  onChange={(e) => setEditAddressText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent h-32 resize-none"
                  rows={4}
                />
              ) : (
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-lg font-medium text-gray-800 break-words">
                    {address.full_address}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
              {!address.is_default ? (
                <button 
                  onClick={() => handleSetDefault(address.id)}
                  disabled={isDeleting || editingId === address.id}
                  className="flex-1 py-2.5 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Set as Default
                </button>
              ) : (
                <div className="flex-1 py-2.5 text-center text-green-600 font-medium">
                  ✓ Current Default
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {addresses.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-2xl border border-gray-100"
        >
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-500 mb-2">No addresses saved</h4>
          <p className="text-gray-400 mb-6">Add your first delivery address to get started</p>
          <button 
            onClick={() => setShowAddAddress(true)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Add Your First Address
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AddressSection;