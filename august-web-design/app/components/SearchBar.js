'use client';
import React from 'react';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import { useLanguage } from '../contexts/LanguageContext';
import { staticSearchData } from '../lib/staticSearchData';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { getRedirectPath } from '@/app/utils/getRedirectPath';
import { fileURLToPath } from 'url';
const logger = require('../utils/logger');

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;

export default function SearchBar({ placeholder, indices, tags }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();
    const { t, language } = useLanguage();
    

    const searchApi = async (query) => {
        if (query.length <= 1) {
            setResults([]);
            setDropdownOpen(false);
            return;
        }
        
        setLoading(true);
        try {
            const allResults = [];
            
            for (const [key, indexName] of Object.entries(indices)) {
                const filterTags = tags ? tags.map(tag => `_tags:${tag}`).join(' AND ') : '';
                const filterString = filterTags ? `${filterTags}` : '';
                
                const response = await fetch(`https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${indexName}/query`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Algolia-API-Key': ALGOLIA_API_KEY,
                        'X-Algolia-Application-Id': ALGOLIA_APP_ID,
                    },
                    body: JSON.stringify({
                        query,
                        filters: filterString,
                        "attributesToRetrieve": [`name_${language}`, 'redirectslug'],
                 }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                allResults.push(
                  ...data.hits.map((hit) => {
                    return { ...hit, category: key };
                  })
                );
            }
            logger.info('search results', allResults)
            setResults(allResults);
            setDropdownOpen(true);
        } catch (error) {
            logger.error('Search failed:', error);
            const fallbackData = staticSearchData[language] || staticSearchData.en;
            const filteredHits = fallbackData.hits.filter(item =>
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filteredHits);
            setDropdownOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useCallback(
        debounce((query) => searchApi(query), 300),
        []
    );

    const handleInputChange = (newValue) => {
        setInputValue(newValue);
        debouncedSearch(newValue);
    };

    const handleResultSelect = (result) => {
        let url;
        if (result.redirectslug) {
            url = `/${language}${result.redirectslug}`;
        } 
        router.push(getRedirectPath(url));
    };

    const getOptionLabel = (option) => {
        const nameKey = `name_${language}`;
           return option[nameKey] || option["name_en"] ||option.Name || option.title || "";
    };

    const renderOption = (props, option) => {
        const name = getOptionLabel(option);
    
        return name ? (
            <div
                {...props}
                key={option.objectID}
                style={{ borderBottom: '1px solid #eee' }}
                onMouseEnter={(e) => e.currentTarget.querySelector('strong').style.color = '#206E55'}
                onMouseLeave={(e) => e.currentTarget.querySelector('strong').style.color = 'inherit'}
            >
                <strong
                    style={{
                        textTransform: 'capitalize',
                        transition: 'color 0.3s',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                    }}
                >
                    {name}
                </strong>
            </div>
        ) : null;
    };

    return (
        <Autocomplete
            open={dropdownOpen}
            onOpen={() => {
                // Only allow opening if we have results
                if (results.length === 0) {
                    setDropdownOpen(false);
                }
            }}
            options={results}
            getOptionLabel={getOptionLabel}
            renderOption={renderOption}
            noOptionsText={t('common.notFound')}
            popupIcon={null}
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={{
                        '& .MuiInputBase-root': {
                            background: 'white',
                            border: 'none',
                            borderRadius: '52px',
                            padding: '16px',
                            boxShadow: 'var(--lib-shadow-subtle)',
                            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                        },
                    }}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    fullWidth
                />
            )}
            onChange={(event, value) => handleResultSelect(value)}
        />
    );
}
