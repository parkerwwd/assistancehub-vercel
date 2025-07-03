
import React, { useEffect } from 'react';
import { Key } from "lucide-react";

interface TokenInputProps {
  mapboxToken: string;
  tokenError: string;
  onTokenChange: (token: string) => void;
}

const TokenInput: React.FC<TokenInputProps> = ({ mapboxToken, tokenError, onTokenChange }) => {
  // Auto-set the provided token on component mount
  useEffect(() => {
    if (!mapboxToken) {
      const providedToken = "pk.eyJ1Ijoib2RoLTEiLCJhIjoiY21jbDNxZThoMDZwbzJtb3FxeXJjenhndSJ9.lHDryqr2gOUMzjrHRP-MLA";
      console.log('Setting default Mapbox token:', providedToken);
      onTokenChange(providedToken);
    }
  }, [mapboxToken, onTokenChange]);

  // Always return null - we don't want to show the token input since we have a default token
  return null;
};

export default TokenInput;
