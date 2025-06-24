import React, { createContext, useState, ReactNode } from "react";

interface CryptoContextType {
  key: CryptoKey | null;
  setKey: (key: CryptoKey | null) => void;
}

export const CryptoContext = createContext<CryptoContextType | undefined>(
  undefined
);

export const CryptoProvider = ({ children }: { children: ReactNode }) => {
  const [key, setKey] = useState<CryptoKey | null>(null);

  return (
    <CryptoContext.Provider value={{ key, setKey }}>
      {children}
    </CryptoContext.Provider>
  );
};
