import { useCallback, useRef, useState } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY_SIZE = 50; // Limit history to prevent memory issues

export function useUndoRedo<T>(initialState: T): UseUndoRedoReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Track if we're currently in an undo/redo operation to prevent adding to history
  const isUndoRedoRef = useRef(false);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    // Don't add to history if this is part of an undo/redo operation
    if (isUndoRedoRef.current) {
      return;
    }

    setHistory((currentHistory) => {
      const resolvedState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(currentHistory.present)
        : newState;

      // Don't add to history if state hasn't changed (deep comparison would be better but expensive)
      if (resolvedState === currentHistory.present) {
        return currentHistory;
      }

      const newPast = [...currentHistory.past, currentHistory.present];

      // Limit history size to prevent memory issues
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: resolvedState,
        future: [], // Clear future when new state is set
      };
    });
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;

    isUndoRedoRef.current = true;

    setHistory((currentHistory) => {
      const previous = currentHistory.past[currentHistory.past.length - 1];
      const newPast = currentHistory.past.slice(0, currentHistory.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentHistory.present, ...currentHistory.future],
      };
    });

    // Reset the flag after a tick to allow the state update to propagate
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    isUndoRedoRef.current = true;

    setHistory((currentHistory) => {
      const next = currentHistory.future[0];
      const newFuture = currentHistory.future.slice(1);

      return {
        past: [...currentHistory.past, currentHistory.present],
        present: next,
        future: newFuture,
      };
    });

    // Reset the flag after a tick to allow the state update to propagate
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
  }, [canRedo]);

  const clear = useCallback(() => {
    setHistory({
      past: [],
      present: history.present,
      future: [],
    });
  }, [history.present]);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}
