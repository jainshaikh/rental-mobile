import { useEffect, useState } from 'react';

// Shared by any search/filter field that should type instantly but only
// trigger a fetch once the user pauses — bind the TextInput itself to the
// raw, undebounced value (so it never lags or drops keystrokes) and use the
// debounced value only for whatever actually fires the query.
export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
