import { useState, useCallback } from 'react';

/**
 * useToast — lightweight toast notification hook
 * Usage:  const { toasts, showToast } = useToast();
 *         showToast('Saved!', 'success');
 */
export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  return { toasts, showToast };
}
