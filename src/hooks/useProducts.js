import { useCallback, useEffect, useState } from 'react';
import { getProducts } from '../api/products';

export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(paramsKey);
      const response = await getProducts(parsed);
      setProducts(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err?.message || 'Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const parsed = JSON.parse(paramsKey);
        const response = await getProducts(parsed);
        if (active) {
          setProducts(response.data);
          setMeta(response.meta);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || 'Unable to load products. Please try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [paramsKey]);

  return { products, meta, loading, error, refetch: fetchProducts };
}
