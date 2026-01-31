"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import { TokenIcon } from "@web3icons/react";
import { FEATURED_TOKENS, TOKEN_TO_HODLOCK } from "@/shared/config/contracts";
import { Input } from "@/shared/ui";
import { useGetHodlock, useCanCreateHodlock } from "@/entities/token/hooks";

interface TokenSelectorProps {
  selectedToken: string | null;
  onSelectToken: (tokenAddress: string, hodlockAddress: string | null) => void;
}

export function TokenSelector({ selectedToken, onSelectToken }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customTokenAddress, setCustomTokenAddress] = useState("");

  // Check if custom token has a Hodlock
  const { data: customHodlock } = useGetHodlock(
    customTokenAddress.length === 42 ? customTokenAddress as `0x${string}` : undefined
  );
  const { data: canCreate } = useCanCreateHodlock(
    customTokenAddress.length === 42 ? customTokenAddress as `0x${string}` : undefined
  );

  const selectedTokenInfo = useMemo(() => {
    if (!selectedToken) return null;
    return FEATURED_TOKENS.find(
      (t) => t.address.toLowerCase() === selectedToken.toLowerCase()
    );
  }, [selectedToken]);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return FEATURED_TOKENS;
    const query = searchQuery.toLowerCase();
    return FEATURED_TOKENS.filter(
      (t) =>
        t.symbol.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query) ||
        t.address.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectToken = (token: typeof FEATURED_TOKENS[number]) => {
    onSelectToken(token.address, token.hodlockAddress);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleCustomToken = () => {
    if (customTokenAddress.length === 42) {
      const hodlock = TOKEN_TO_HODLOCK[customTokenAddress.toLowerCase()];
      onSelectToken(customTokenAddress, hodlock || (customHodlock as string) || null);
      setIsOpen(false);
      setSearchQuery("");
      setCustomTokenAddress("");
    }
  };

  const isValidAddress = customTokenAddress.length === 42 && customTokenAddress.startsWith("0x");

  return (
    <div className="relative">
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        Select Token
      </label>

      {/* Selected Token Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-primary-300 transition-colors"
      >
        {selectedTokenInfo ? (
          <div className="flex items-center gap-3">
            <TokenIcon
              symbol={selectedTokenInfo.icon}
              variant="branded"
              size={28}
            />
            <div className="text-left">
              <p className="font-medium text-gray-900">{selectedTokenInfo.symbol}</p>
              <p className="text-xs text-gray-500">{selectedTokenInfo.name}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Select a token</span>
        )}
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search or paste address..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.startsWith("0x")) {
                    setCustomTokenAddress(e.target.value);
                  }
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredTokens.map((token) => (
              <button
                key={token.address}
                type="button"
                onClick={() => handleSelectToken(token)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors"
              >
                <TokenIcon symbol={token.icon} variant="branded" size={32} />
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900">{token.symbol}</p>
                  <p className="text-xs text-gray-500">{token.name}</p>
                </div>
              </button>
            ))}

            {/* Custom Token Option */}
            {isValidAddress && !filteredTokens.some(
              (t) => t.address.toLowerCase() === customTokenAddress.toLowerCase()
            ) && (
              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCustomToken}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900">
                      {customHodlock ? "Use Custom Token" : "Create New Pool"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {customTokenAddress}
                    </p>
                  </div>
                  {!customHodlock && canCreate?.[0] && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </button>
              </div>
            )}

            {filteredTokens.length === 0 && !isValidAddress && (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No tokens found</p>
                <p className="text-xs mt-1">Paste a token address to add it</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
