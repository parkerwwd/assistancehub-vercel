
import React from 'react';
import { Key } from "lucide-react";

interface TokenInputProps {
  mapboxToken: string;
  tokenError: string;
  onTokenChange: (token: string) => void;
}

const TokenInput: React.FC<TokenInputProps> = ({ mapboxToken, tokenError, onTokenChange }) => {
  if (mapboxToken) return null;

  return (
    <div className="mx-4 mt-4 mb-2">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-700 mb-3">
              Enter your Mapbox token to display the map. Get one free at{' '}
              <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-yellow-800">
                mapbox.com
              </a>
            </p>
            <input
              type="text"
              placeholder="Enter Mapbox token (pk.)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={mapboxToken}
              onChange={(e) => onTokenChange(e.target.value)}
            />
            {tokenError && (
              <p className="text-xs text-red-600 mt-2">{tokenError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInput;
