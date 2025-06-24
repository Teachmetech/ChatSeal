import { useContext } from "react";
import { CryptoContext } from "../providers/CryptoProvider";

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error("useCrypto must be used within a CryptoProvider");
  }
  return context;
};
