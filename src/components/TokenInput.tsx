import React from 'react';

interface TokenInputProps {
  mapboxToken: string;
  tokenError: string;
  onTokenChange: (token: string) => void;
}

const TokenInput: React.FC<TokenInputProps> = ({ mapboxToken, tokenError, onTokenChange }) => {
  // Always return null - we're using a hardcoded token so no input needed
  return null;
};

export default TokenInput;