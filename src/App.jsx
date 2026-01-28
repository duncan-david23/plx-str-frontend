import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ThankYou from './pages/ThankYou';
import Login from './pages/Login';
import AccountPage from './pages/AccountPage';
import StoreProductsPage from './pages/StoreProductsPage';
import StoreCartPage from './pages/StoreCartPage';
import { Navigate } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper'
import { useLocation } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { UserProvider } from './context/UserContext'
import { StoreProvider } from './context/StoreContext'; // Import StoreProvider




function App() {



const location = useLocation()
  const isAuthPage = ['/login', '/', ].includes(location.pathname)

  if (isAuthPage) {
    return (
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    )
  }



  return (
    <>
    <Toaster />
 
      <StoreProvider>
      <UserProvider>
        <div className="App">
          <Routes>
            
            {/* <Route path="/user-account" element={
              <AuthWrapper>
              <AccountPage />
              </AuthWrapper>
              } /> */}
            <Route path="/thank-you" element={
              <AuthWrapper>
              <ThankYou />
              </AuthWrapper>
              } />
            <Route path="/store" element={
              <AuthWrapper>
              <StoreProductsPage />
              </AuthWrapper>
              } />
            <Route path="/store/cart" element={
              <AuthWrapper>
              <StoreCartPage />
              </AuthWrapper>
              } />

            {/* You can add more routes later for checkout and order confirmation */}
          </Routes>
        </div>
      
    </UserProvider>
    </StoreProvider>
   
    </>
  );
}

export default App;