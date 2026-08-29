"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, X, Search } from "lucide-react";
import { KnownLocation, searchLocations } from "@/lib/transport/locationIndex";

interface LocationSearchInputProps {
  label: string;
  value: KnownLocation | null;
  onSelect: (loc: KnownLocation) => void;
  onClear: () => void;
  accentColor: string;
  placeholder: string;
  disabled?: boolean;
}

export function LocationSearchInput({
  label,
  value,
  onSelect,
  onClear,
  accentColor,
  placeholder,
  disabled = false,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<KnownLocation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      const results = searchLocations(query);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    }, 150);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((loc: KnownLocation) => {
    onSelect(loc);
    setQuery(loc.name);
    setShowDropdown(false);
    setSuggestions([]);
    inputRef.current?.blur();
  }, [onSelect]);

  const handleClear = useCallback(() => {
    onClear();
    setQuery("");
    setShowDropdown(false);
    setSuggestions([]);
  }, [onClear]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      handleSelect(suggestions[0]);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const accentStyles: React.CSSProperties = {
    borderColor: accentColor,
    boxShadow: `0 0 0 2px ${accentColor}40`,
  };

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: "Poppins, sans-serif" }}>
        {label}
      </label>
      <div className="relative">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ color: accentColor }}>
            <MapPin size={18} />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query || (value ? value.name : "")}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (debouncedQuery) {
                const results = searchLocations(debouncedQuery);
                setSuggestions(results);
                setShowDropdown(results.length > 0);
              }
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-sm transition-all focus:outline-none ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={accentStyles as any}
            autoComplete="off"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {suggestions.map((loc) => (
              <button
                key={`${loc.name}-${loc.area}`}
                type="button"
                onClick={() => handleSelect(loc)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span className="flex-1">
                  <span className="font-medium text-sm text-gray-900">{loc.name}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{loc.area}</span>
                </span>
                <Search size={16} className="text-gray-400" style={{ color: accentColor }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}