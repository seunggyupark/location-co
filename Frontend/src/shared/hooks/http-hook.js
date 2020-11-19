import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const activeHttpRequests = useRef([])

    const sendRequest = useCallback(async (axios, url = '', method = 'GET', data = null, headers = {}) => {
        setIsLoading(true);
        const httpAbortCtrl = new AbortController();
        activeHttpRequests.current.push(httpAbortCtrl);

        try {
            const response = await axios({ method, data, url, headers, signal: httpAbortCtrl.signal });

            activeHttpRequests.current = activeHttpRequests.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl);
            setIsLoading(false);
            return response.data;
        } catch(err) {
            setIsLoading(false);
            setError(err.response.data.message || 'Something went wrong, please try again.');
            throw err;
        };
    }, []);

    const clearError = () => setError(null);

    useEffect(() => {
        return () => {
            activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
        };
    }, [])

    return { isLoading, error, sendRequest, clearError };
};