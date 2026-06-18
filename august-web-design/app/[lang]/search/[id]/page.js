'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
const logger = require('@/app/utils/logger');

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

export default function SearchResultPage() {
    const params = useParams();
    const id = params?.id; // Get the ID from the URL
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ALGOLIA_APP_ID || !ALGOLIA_API_KEY || !ALGOLIA_INDEX_NAME) {
            logger.error(
                'Missing Algolia env vars: NEXT_PUBLIC_ALGOLIA_APP_ID / NEXT_PUBLIC_ALGOLIA_API_KEY / NEXT_PUBLIC_ALGOLIA_INDEX_NAME'
            );
            setLoading(false);
            return;
        }

        if (id) {
            const fetchData = async () => {
                const response = await fetch(
                    `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/${encodeURIComponent(
                        String(id)
                    )}`,
                    {
                        method: 'GET',
                        headers: {
                            'X-Algolia-API-Key': ALGOLIA_API_KEY,
                            'X-Algolia-Application-Id': ALGOLIA_APP_ID,
                        },
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                } else {
                    logger.error('Failed to fetch data');
                }
                setLoading(false);
            };

            fetchData();
        }
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>No data found</div>;

    return (
        <div>
            <h1>{data.name}</h1>
            <p>{data.description || data.overview}</p>
            {data.brand_name && <p>Brand: {data.brand_name}</p>}
            {data.side_effects && <p>Side Effects: {data.side_effects}</p>}
        </div>
    );
}
