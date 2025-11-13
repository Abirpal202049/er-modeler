import { useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { useUndoRedo } from './useUndoRedo';

interface FlowState {
  nodes: Node[];
  edges: Edge[];
}

interface UseFlowHistoryReturn {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  takeSnapshot: () => void;
  pauseHistory: () => void;
  resumeHistory: () => void;
}

export function useFlowHistory(
  initialNodes: Node[],
  initialEdges: Edge[]
): UseFlowHistoryReturn {
  const {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<FlowState>({
    nodes: initialNodes,
    edges: initialEdges,
  });

  const historyPausedRef = useRef(false);
  const pendingStateRef = useRef<FlowState | null>(null);
  const snapshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setNodes = useCallback((nodes: Node[] | ((prev: Node[]) => Node[])) => {
    setState((prevState) => {
      const newNodes = typeof nodes === 'function' ? nodes(prevState.nodes) : nodes;
      const newState = {
        ...prevState,
        nodes: newNodes,
      };

      // If history is paused (e.g., during drag), store pending state
      if (historyPausedRef.current) {
        pendingStateRef.current = newState;
        return newState;
      }

      return newState;
    });
  }, [setState]);

  const setEdges = useCallback((edges: Edge[] | ((prev: Edge[]) => Edge[])) => {
    setState((prevState) => {
      const newEdges = typeof edges === 'function' ? edges(prevState.edges) : edges;
      const newState = {
        ...prevState,
        edges: newEdges,
      };

      // If history is paused (e.g., during drag), store pending state
      if (historyPausedRef.current) {
        pendingStateRef.current = newState;
        return newState;
      }

      return newState;
    });
  }, [setState]);

  const takeSnapshot = useCallback(() => {
    // Force a snapshot of current state
    setState(state);
  }, [setState, state]);

  const pauseHistory = useCallback(() => {
    historyPausedRef.current = true;
    pendingStateRef.current = null;
  }, []);

  const resumeHistory = useCallback(() => {
    historyPausedRef.current = false;

    // If there's a pending state from drag operation, create a snapshot after a short delay
    if (pendingStateRef.current) {
      // Clear any existing timeout
      if (snapshotTimeoutRef.current) {
        clearTimeout(snapshotTimeoutRef.current);
      }

      // Debounce: wait 300ms after last change to create snapshot
      snapshotTimeoutRef.current = setTimeout(() => {
        if (pendingStateRef.current) {
          setState(pendingStateRef.current);
          pendingStateRef.current = null;
        }
      }, 300);
    }
  }, [setState]);

  return {
    nodes: state.nodes,
    edges: state.edges,
    setNodes,
    setEdges,
    undo,
    redo,
    canUndo,
    canRedo,
    takeSnapshot,
    pauseHistory,
    resumeHistory,
  };
}
