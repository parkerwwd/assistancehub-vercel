
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Disclaimer</h3>
          <p className="text-blue-100 text-sm max-w-4xl mx-auto leading-relaxed">
            JetWord is a privately owned platform and is not affiliated with or endorsed by any government agency. 
            The information provided on this site is for general educational purposes only and should not be considered 
            legal or financial advice. Government programs may change without notice, and while we aim to keep information 
            accurate and up to date, readers should verify details through official sources or directly with approved 
            service providers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
