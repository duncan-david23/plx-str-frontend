import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ No active session');
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
        
        setUser({
          username: response.data.full_name || 'username',
          email: response.data.email || 'you@example.com',
          phone: response.data.phone || 'N/A',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error.response?.data || error.message);
    }
  };


  

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
