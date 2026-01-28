import React, { useState } from 'react';
import { MessageCircle, Smartphone, Globe, ExternalLink } from 'lucide-react';

const ContactUs = () => {
  const [message, setMessage] = useState('');
  const whatsappNumber = '+233556664343';
  
  // Create WhatsApp link
  const createWhatsAppLink = (customMessage = '') => {
    const text = customMessage || message || 'Hello PlangeX, I need assistance.';
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedText}`;
  };

  // Quick messages
  const quickMessages = [
    "Hello, I need help with my order",
    "I have a question about a product",
    "I need support with my account",
    "Can you tell me about shipping?"
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-600 mb-8">Get in touch with us via WhatsApp</p>
      
      {/* Simple Contact Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-green-100 rounded-full">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">WhatsApp Support</h2>
            <p className="text-gray-600">Chat with us directly</p>
          </div>
        </div>
        
        {/* Phone Number Display */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Our WhatsApp Number:</p>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <span className="font-mono text-lg font-semibold">{whatsappNumber}</span>
            <button
              onClick={() => navigator.clipboard.writeText(whatsappNumber)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Copy
            </button>
          </div>
        </div>
        
        {/* Quick Message Buttons */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">Quick messages:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickMessages.map((msg, index) => (
              <a
                key={index}
                href={createWhatsAppLink(msg)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 text-left transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{msg}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                </div>
              </a>
            ))}
          </div>
        </div>
        
        {/* Custom Message */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">Or write your own message:</p>
          <div className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
              rows="3"
            />
            <a
              href={createWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full py-3 text-center font-medium rounded-lg transition-colors ${
                message.trim()
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Open WhatsApp to Send
            </a>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click any message button above</li>
                <li>• WhatsApp will open automatically (app or web)</li>
                <li>• Your message will be pre-filled</li>
                <li>• Just tap send to start chatting!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alternative Contact */}
      {/* <div className="text-center text-gray-500 text-sm">
        <p>Prefer email? Contact us at <span className="text-green-600">support@plangex.com</span></p>
      </div> */}
      
      {/* Floating WhatsApp Button (Simple Version) */}
      <a
        href={createWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl flex items-center gap-2 transition-all hover:scale-110 z-40 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline text-sm font-medium group-hover:pr-2">Chat with us</span>
      </a>
    </div>
  );
};

export default ContactUs;