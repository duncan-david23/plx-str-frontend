import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import plangex_logo_black from '../assets/PlangeX_logo.png'; 
import { useUser } from '../context/UserContext';

const ThankYou = () => {
  const { user } = useUser();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedMessage, setSelectedMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoBase64, setLogoBase64] = useState('');

  // Luxury color palette - gold, cream, and deep neutrals
  const colors = {
    primary: '#C5A572', // Warm gold
    primaryDark: '#8B7355', // Darker gold
    secondary: '#2C2C2C', // Charcoal black
    background: '#FAF8F5', // Cream background
    cardBg: '#FFFFFF', // Pure white
    textDark: '#1A1A1A', // Near black
    textMedium: '#4A4A4A', // Dark gray
    textLight: '#8C8C8C', // Medium gray
    borderLight: '#E8E5E0', // Light beige border
    borderDark: '#C5A572', // Gold border
    shadow: 'rgba(44, 44, 44, 0.08)' // Soft shadow
  };

  const thankYouMessages = [
  "Thank you for your order, {{name}} ✨ May today bring you calm thoughts, good moments, and small wins that make you smile. Something special is on the way just for you 🤍",
  
  "{{name}}, thank you for ordering 🌸 Wishing you a day filled with ease, positive energy, and little reasons to be happy. We can’t wait to welcome you back again 😊",
  
  "Order received, {{name}} 💫 May your day feel lighter, brighter, and full of good vibes. Thank you for choosing us, we hope this is the start of many beautiful orders.",
  
  "Thank you, {{name}} 🤍 Wishing you peace of mind, joyful moments, and a smile that stays with you all day. We’ll be happy to see you again anytime ✨",
  
  "{{name}}, your order means a lot 🌼 May today surprise you with kindness, progress, and good energy. Looking forward to creating more beautiful things with you again.",
  
  "Thank you for your order, {{name}} 😊 May your day be productive, peaceful, and filled with reasons to smile. We hope to serve you again very soon 🤍",
  
  "{{name}}, thanks for choosing us ✨ Sending you warm wishes, positive thoughts, and a gentle reminder that good things are always on the way. Come back anytime 🌸",
  
  "Order confirmed, {{name}} , May today bring you confidence, happiness, and a calm heart. Thank you for being here, we’d love to see you again.",
  
  "Thank you, {{name}} 💖 Wishing you a smooth day, good news, and moments that make you smile without trying. Your next visit will always be welcome.",
  
  "{{name}}, we appreciate your order ✨ May your day feel beautiful, your plans go well, and your smile come easily. Looking forward to your next order 🤍"
];


  useEffect(() => {
    // Get user email from context
    const email = user.email || '';
    setUserEmail(email);
    
    // Extract name from email (before @)
    if (email) {
      const name = user.username || email.split('@')[0];
      // Format name with capitalized first letter
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      setUserName(formattedName);
      
      // Select random message
      const randomMessage = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];
      // Replace {{name}} with actual name
      const personalizedMessage = randomMessage.replace('{{name}}', formattedName);
      setSelectedMessage(personalizedMessage);
    }

    // Convert logo to base64 for PDF
    const convertLogoToBase64 = async () => {
      try {
        // Fetch the logo image
        const response = await fetch(plangex_logo_black);
        const blob = await response.blob();
        
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setLogoBase64(reader.result);
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error converting logo to base64:', error);
      }
    };

    convertLogoToBase64();
  }, []);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    
    // Create a new element specifically for PDF generation
    const pdfContainer = document.createElement('div');
    pdfContainer.style.width = '400px';
    pdfContainer.style.maxWidth = '400px';
    pdfContainer.style.backgroundColor = colors.cardBg;
    pdfContainer.style.padding = '0';
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.top = '-9999px';
    
    // Create the card structure for PDF with logo
    pdfContainer.innerHTML = `
      <div style="
        width: 100%;
        max-width: 400px;
        background-color: ${colors.cardBg};
        border-radius: 16px;
        border: 1px solid ${colors.borderLight};
        box-shadow: 0 20px 60px ${colors.shadow};
        overflow: hidden;
        margin: 0 auto;
      ">
        <!-- Top border -->
        <div style="
          height: 4px;
          background-color: ${colors.primary};
          width: 100%;
        "></div>
        
        <!-- Card content -->
        <div style="padding: 40px;">
          <!-- Brand mark with logo -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 50px;
          ">
            <div style="position: relative; text-align: center;">
              <!-- Logo container - SINGLE logo will be added here -->
              <div id="pdf-logo-container" style="
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 16px;
                height: 40px;
              ">
                ${logoBase64 ? 
                  `<img src="${logoBase64}" style="width: 120px; height: 40px; object-fit: contain;" />` : 
                  `<div style="
                    font-family: 'Cormorant Garamond', serif;
                    font-weight: 300;
                    font-size: 48px;
                    letter-spacing: 0.1em;
                    color: ${colors.textDark};
                  ">PLANGEX</div>`
                }
              </div>
              <!-- Line under logo -->
              <div style="
                position: absolute;
                bottom: -8px;
                left: 0;
                right: 0;
                height: 1px;
                background-color: ${colors.primary};
              "></div>
            </div>
          </div>

          <!-- Message container -->
          <div style="position: relative;">
            <!-- Background pattern -->
            <div style="
              position: absolute;
              inset: 0;
              opacity: 0.03;
            ">
              <div style="
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 32px;
                transform: rotate(12deg);
              ">
                ${[...Array(16)].map(() => `
                  <div style="
                    height: 8px;
                    width: 8px;
                    border-radius: 50%;
                    background-color: ${colors.textDark};
                  "></div>
                `).join('')}
              </div>
            </div>
            
            <!-- Main message -->
            <div style="position: relative; z-index: 10;">
              <div style="text-align: center;">
                <div style="
                  font-size: 11px;
                  letter-spacing: 0.2em;
                  color: ${colors.textLight};
                  margin-bottom: 32px;
                  text-transform: uppercase;
                ">
                  ORDER CONFIRMED
                </div>
                
                <div style="
                  font-family: 'Cormorant Garamond', serif;
                  font-weight: 300;
                  font-size: 24px;
                  color: ${colors.textDark};
                  margin-bottom: 40px;
                  line-height: 1.6;
                ">
                  ${selectedMessage}
                </div>
              </div>
              
              <!-- Signature line -->
              <div style="
                margin-top: 48px;
                padding-top: 32px;
                border-top: 1px solid ${colors.borderLight};
              ">
                <div style="text-align: center;">
                  <div style="
                    font-size: 14px;
                    color: ${colors.textMedium};
                    margin-bottom: 4px;
                  ">
                    With gratitude,
                  </div>
                  <div style="
                    font-family: 'Cormorant Garamond', serif;
                    font-style: italic;
                    font-size: 20px;
                    color: ${colors.textDark};
                  ">
                    — Plangex
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Bottom border -->
        <div style="
          height: 4px;
          background-color: ${colors.primary};
          width: 100%;
        "></div>
      </div>
    `;
    
    document.body.appendChild(pdfContainer);
    
    try {
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: colors.cardBg,
        logging: false,
        width: 400,
        height: pdfContainer.scrollHeight,
        onclone: (clonedDoc) => {
          // Add fonts to cloned document
          const style = clonedDoc.createElement('style');
          style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&display=swap');
          `;
          clonedDoc.head.appendChild(style);
          
          // Ensure fonts are loaded for the logo text fallback
          // No need to add logo again - it's already in the HTML
        }
      });
      
      document.body.removeChild(pdfContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6'
      });
      
      const imgWidth = 100;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image on PDF
      const xPosition = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const yPosition = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
      pdf.save('plangex-thank-you.pdf');
      setIsDownloading(false);
    } catch (error) {
      console.error('PDF generation failed:', error);
      document.body.removeChild(pdfContainer);
      setIsDownloading(false);
      
      // Fallback to original element
      try {
        const input = document.getElementById('thank-you-card');
        const canvas = await html2canvas(input, {
          scale: 1,
          useCORS: true,
          backgroundColor: colors.cardBg,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a6'
        });
        
        const imgWidth = 100;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const xPosition = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
        const yPosition = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
        pdf.save('plangex-thank-you-fallback.pdf');
        setIsDownloading(false);
      } catch (fallbackError) {
        console.error('Fallback PDF generation failed:', fallbackError);
        setIsDownloading(false);
      }
    }
  };

  const handleNewMessage = () => {
    if (userName) {
      const randomMessage = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];
      const personalizedMessage = randomMessage.replace('{{name}}', userName);
      setSelectedMessage(personalizedMessage);
    }
  };

  const navigate = useNavigate();

  

  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col items-center justify-center" 
         style={{ backgroundColor: colors.background }}>
      {/* Downloadable Card */}
      <div 
        id="thank-you-card"
        className="w-full max-w-lg rounded-2xl overflow-hidden border"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.borderLight,
          boxShadow: `0 20px 60px ${colors.shadow}`,
          maxWidth: '400px'
        }}
      >
        {/* Top gold border */}
        <div className="h-1 md:h-1.5" style={{ backgroundColor: colors.primary }}></div>
        
        {/* Card content */}
        <div className="p-8 md:p-10">
          {/* Brand mark with logo */}
          <div className="flex items-center justify-center mb-12 md:mb-14">
            <div className="relative">
              <img 
                src={plangex_logo_black} 
                alt="Plangex Logo" 
                className="w-[120px] h-[40px]" 
                style={{ marginBottom: '16px' }}
              />
              {/* Line under logo */}
              <div className="absolute -bottom-1 left-0 right-0 h-px" 
                   style={{ backgroundColor: colors.primary }}></div>
            </div>
          </div>

          {/* Message container */}
          <div className="relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-4 gap-6 md:gap-8 rotate-12">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full" 
                       style={{ backgroundColor: colors.textDark }}></div>
                ))}
              </div>
            </div>
            
            {/* Main message */}
            <div className="relative z-10">
              <div className="text-center">
                <div className="text-xs tracking-widest mb-6 md:mb-8" style={{ color: colors.textLight }}>
                  ORDER CONFIRMED
                </div>
                
                <div className="text-xl md:text-2xl font-serif font-light mb-8 md:mb-10 leading-relaxed"
                     style={{ color: colors.textDark }}>
                  {selectedMessage}
                </div>
              </div>
              
              {/* Signature line */}
              <div className="mt-10 md:mt-12 pt-6 md:pt-8" style={{ borderTop: `1px solid ${colors.borderLight}` }}>
                <div className="text-center">
                  <div className="text-sm mb-1" style={{ color: colors.textMedium }}>With gratitude,</div>
                  <div className="text-lg md:text-xl font-serif italic" style={{ color: colors.textDark }}>— Plangex</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom gold border */}
        <div className="h-1 md:h-1.5" style={{ backgroundColor: colors.primary }}></div>
      </div>

      {/* Controls */}
      <div className="mt-10 flex flex-col md:flex-row gap-4 items-center">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="px-8 py-3 text-sm font-medium rounded-full flex items-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          style={{
            backgroundColor: colors.secondary,
            color: colors.cardBg,
            boxShadow: `0 4px 12px ${colors.shadow}`
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = colors.primaryDark;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 8px 20px ${colors.shadow}`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = colors.secondary;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadow}`;
          }}
        >
          <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isDownloading ? 'Creating PDF...' : 'Download Card'}
        </button>
        
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 text-sm font-medium rounded-full flex items-center transition-all duration-300 group"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.borderLight}`,
            color: colors.textDark,
            boxShadow: `0 2px 6px ${colors.shadow}`
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = colors.background;
            e.currentTarget.style.borderColor = colors.primary;
            e.currentTarget.style.color = colors.primaryDark;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = colors.cardBg;
            e.currentTarget.style.borderColor = colors.borderLight;
            e.currentTarget.style.color = colors.textDark;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span className="mr-2 transition-transform duration-300 group-hover:translate-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          Go Back
        </button>
      </div>

      {/* Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;450&display=swap');
        
        .font-serif {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
        }
        
        /* Smooth animations */
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(12deg); }
        }
        
        .absolute > div > div > div {
          animation: float 6s ease-in-out infinite;
        }
        
        .absolute > div > div > div:nth-child(4n+1) { animation-delay: 0s; }
        .absolute > div > div > div:nth-child(4n+2) { animation-delay: 0.5s; }
        .absolute > div > div > div:nth-child(4n+3) { animation-delay: 1s; }
        .absolute > div > div > div:nth-child(4n+4) { animation-delay: 1.5s; }
        
        /* Card hover effect */
        #thank-you-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        #thank-you-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 80px ${colors.shadow};
        }
      `}</style>
    </div>
  );
};

export default ThankYou;