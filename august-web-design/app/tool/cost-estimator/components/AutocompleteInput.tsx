"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AutocompleteInputProps<T extends { [key: string]: unknown }> {
  placeholder: string;
  fetchUrl: string;
  queryParam: string;
  displayKey: keyof T;
  valueKey: keyof T;
  value: T | null;
  onChange: (item: T | null) => void;
  prefetchAll?: boolean;
  icon?: React.ReactNode;
  label?: string;
  topOption?: T;
  autoSelectOnBlur?: boolean;
  errorMessage?: string;
  defaultSuggestions?: T[];
  externalQuery?: string;
}

export default function AutocompleteInput<T extends { [key: string]: unknown }>({
  placeholder,
  fetchUrl,
  queryParam,
  displayKey,
  valueKey,
  value,
  onChange,
  prefetchAll = false,
  icon,
  label,
  topOption,
  autoSelectOnBlur = false,
  errorMessage = "No match found",
  defaultSuggestions = [],
  externalQuery,
}: AutocompleteInputProps<T>) {
  const [query, setQuery] = useState("");
  const [allItems, setAllItems] = useState([] as T[]);
  const [suggestions, setSuggestions] = useState([] as T[]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<T[]>([]);

  // keep ref in sync for use in async blur handler
  useEffect(() => { suggestionsRef.current = suggestions; }, [suggestions]);

  // prefetch all items on mount (services, plans)
  useEffect(() => {
    if (!prefetchAll) return;
    fetch(fetchUrl, { headers: { "X-CE-Request": "1" } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAllItems(data); })
      .catch(() => {});
  }, [prefetchAll, fetchUrl]);

  // handle external query injection (e.g. from popular pills)
  useEffect(() => {
    if (!externalQuery) return;
    setQuery(externalQuery);
    setError("");
    onChange(null);
    if (prefetchAll && allItems.length > 0) {
      const filtered = allItems.filter((item) =>
        String(item[displayKey]).toLowerCase().includes(externalQuery.toLowerCase())
      );
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
      setActiveIdx(-1);
      if (filtered.length === 1) {
        onChange(filtered[0]);
        setQuery(String(filtered[0][displayKey]));
        setOpen(false);
      }
    }
  }, [externalQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchRemote = useCallback(
    (q: string) => {
      if (q.length < 2) {
        setSuggestions([]);
        return;
      }
      fetch(`${fetchUrl}?${queryParam}=${encodeURIComponent(q)}`, { headers: { "X-CE-Request": "1" } })
        .then((r) => r.json())
        .then((data: T[]) => {
          setSuggestions(data);
          setOpen(data.length > 0);
          setActiveIdx(-1);
        })
        .catch(() => {});
    },
    [fetchUrl, queryParam]
  );

  const handleInput = (text: string) => {
    setQuery(text);
    setError("");
    if (value) onChange(null);

    if (prefetchAll) {
      const filtered = allItems.filter((item) =>
        String(item[displayKey]).toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
      setActiveIdx(-1);
    } else {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchRemote(text), 300);
    }
  };

  const handleSelect = (item: T) => {
    onChange(item);
    setQuery(String(item[displayKey]));
    setError("");
    setOpen(false);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleFocus = () => {
    setError("");
    if (value) {
      inputRef.current?.select();
    }
    if (prefetchAll && allItems.length > 0) {
      setSuggestions(value ? allItems : (query.length === 0 ? allItems : suggestions));
      setOpen(true);
    } else if (query.length === 0 && defaultSuggestions.length > 0 && !value) {
      setSuggestions(defaultSuggestions);
      setOpen(true);
    } else if (suggestions.length > 0 || topOption) {
      setOpen(true);
    }
  };

  const handleBlur = async () => {
    if (!autoSelectOnBlur || value || !query.trim()) {
      setOpen(false);
      return;
    }

    const q = query.trim();
    let pool = suggestionsRef.current;

    // extract zip portion if query is like "10001, NY" → "10001"
    const zipPart = q.split(",")[0].trim();

    // if pool is empty (e.g. user typed and blurred before debounce fired), fetch now
    if (pool.length === 0 && q.length >= 2) {
      const queries = zipPart !== q ? [q, zipPart] : [q];
      for (const attempt of queries) {
        try {
          const res = await fetch(`${fetchUrl}?${queryParam}=${encodeURIComponent(attempt)}`, { headers: { "X-CE-Request": "1" } });
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) { pool = data; setSuggestions(data); break; }
        } catch {}
      }
    }

    setOpen(false);

    if (pool.length === 0) {
      setError(errorMessage);
      return;
    }

    const ql = q.toLowerCase();
    const zipL = zipPart.toLowerCase();

    // exact match on valueKey or displayKey, also try zip portion
    const exact = pool.find(
      (item) => {
        const vk = String(item[valueKey]).toLowerCase();
        const dk = String(item[displayKey]).toLowerCase();
        return vk === ql || dk === ql || vk === zipL || dk === zipL;
      }
    );
    if (exact) { handleSelect(exact); return; }

    // single result — auto-select
    if (pool.length === 1) { handleSelect(pool[0]); return; }

    // starts-with or contains match
    const partial = pool.find(
      (item) => {
        const vk = String(item[valueKey]).toLowerCase();
        const dk = String(item[displayKey]).toLowerCase();
        return vk.startsWith(zipL) || dk.startsWith(ql) || dk.startsWith(zipL);
      }
    );
    if (partial) { handleSelect(partial); return; }

    setError(errorMessage);
  };

  const displayValue = value ? String(value[displayKey]) : query;
  const displayedSuggestions = topOption
    ? [topOption, ...suggestions.filter((s) => String(s[valueKey]) !== String(topOption[valueKey]))]
    : suggestions;

  return (
    <div className="ce-search-row ce-autocomplete-row" ref={containerRef}>
      {icon && <div className="ce-row-icon">{icon}</div>}
      <div className="ce-row-content">
        {label && <label>{label}</label>}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid={`autocomplete-${String(valueKey)}`}
        />
        {error && <span className="ce-input-error">{error}</span>}
        {open && displayedSuggestions.length > 0 && (
          <div
            className="ce-dropdown"
            data-testid={`dropdown-${String(valueKey)}`}
            onMouseDown={(e) => e.preventDefault()}
          >
            {displayedSuggestions.map((item, i) => (
              <button
                key={String(item[valueKey])}
                className={`ce-dropdown-item ${i === activeIdx ? "ce-dropdown-active" : ""}`}
                onMouseDown={() => handleSelect(item)}
                data-testid="dropdown-item"
              >
                {String(item[displayKey])}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
