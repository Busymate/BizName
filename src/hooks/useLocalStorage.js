import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '../utils/storage';

// Generic hook: behaves like useState but persists to localStorage under `key`.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => getItem(key, initialValue));

  useEffect(() => {
    setItem(key, value);
  }, [key, value]);

  const update = useCallback((next) => {
    setValue((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  return [value, update];
}
