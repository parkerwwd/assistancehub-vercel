
import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content - Mobile optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Logo */}
          <div className="flex justify-center sm:justify-start">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={logoImage} 
                alt="JetWord AssistanceHub" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-gray-100">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/section8" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Search Housing
                </Link>
              </li>
              <li>
                <Link to="/snap" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-gray-100">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  How to Apply
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Eligibility Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <ul className="space-y-2 mt-7">
              <li>
                <a 
                  href="https://jetword.com/privacy-policy/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="https://jetword.com/terms-of-use/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Use
                </a>
              </li>
              <li>
                <a 
                  href="https://jetword.com/contact-us/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="https://my.datasubject.com/AzqgulTW8lxxyBTTK/24402" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Do Not Sell My Personal Information
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          {/* Bottom Footer - Mobile optimized */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-xs sm:text-sm text-gray-400">
              © {new Date().getFullYear()} AssistanceHub. All rights reserved.
            </p>
            
            {/* Legal Links in Bottom Footer */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
              <a 
                href="https://jetword.com/privacy-policy/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="https://jetword.com/terms-of-use/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms of Use
              </a>
              <a 
                href="https://jetword.com/contact-us/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="https://my.datasubject.com/AzqgulTW8lxxyBTTK/24402" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Do Not Sell My Personal Information
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
