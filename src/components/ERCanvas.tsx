import { useCallback, useMemo, useState, useRef } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, type Node, type Edge, type NodeChange, type EdgeChange, type Connection, type Viewport, ConnectionLineType } from '@xyflow/react';
import type { ProOptions } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import EditableNode from './EditableNode';
import ImageNode from './ImageNode';
import EdgeContextMenu from './EdgeContextMenu';
import AddNodeMenu from './AddNodeMenu';

const proOptions: ProOptions = { account: "paid-pro", hideAttribution: true };
 
const initialNodes: Node[] = [
  { id: 'n1', type: 'editableNode', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', type: 'editableNode', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges: Edge[] = [{ 
  id: 'n1-n2', 
  source: 'n1', 
  target: 'n2',
  type: 'smoothstep',
  animated: true,
  data: { borderRadius: 8 },
  ...({ borderRadius: 8 } as any),
}];
const initialViewport: Viewport = { x: 0, y: 0, zoom: 1 };
 
export default function ERCanvas() {
  const { colors } = useTheme();
  
  // Custom serialization for nodes - exclude imageUrl from localStorage
  const serializeNodes = useCallback((nodes: Node[]) => {
    return nodes.map(node => {
      if (node.type === 'imageNode' && node.data.imageUrl) {
        // Don't store the image data, just a placeholder
        return {
          ...node,
          data: {
            ...node.data,
            imageUrl: '[IMAGE_DATA_NOT_PERSISTED]',
            _hasImage: true
          }
        };
      }
      return node;
    });
  }, []);

  const deserializeNodes = useCallback((nodes: Node[]) => {
    return nodes.map(node => {
      if (node.type === 'imageNode' && node.data._hasImage && node.data.imageUrl === '[IMAGE_DATA_NOT_PERSISTED]') {
        // Image nodes without data will show a placeholder
        return {
          ...node,
          data: {
            ...node.data,
            imageUrl: undefined,
            _hasImage: false
          }
        };
      }
      return node;
    });
  }, []);

  const [storedNodes, setStoredNodes] = useLocalStorage<Node[]>('er-diagram-nodes', initialNodes);
  const [nodes, setNodes] = useState<Node[]>(() => deserializeNodes(storedNodes));
  const [edges, setEdges] = useLocalStorage<Edge[]>('er-diagram-edges', initialEdges);
  const [viewport, setViewport] = useLocalStorage<Viewport>('er-diagram-viewport', initialViewport);
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  
  // Ref to store ReactFlow instance for auto-focus
  const reactFlowInstance = useRef<any>(null);

  // Sync nodes to localStorage (serialized without image data)
  const updateNodes = useCallback((newNodes: Node[] | ((prev: Node[]) => Node[])) => {
    setNodes(prev => {
      const updated = typeof newNodes === 'function' ? newNodes(prev) : newNodes;
      setStoredNodes(serializeNodes(updated));
      return updated;
    });
  }, [serializeNodes, setStoredNodes]);

  // Auto-focus on newly added node
  const focusOnNode = useCallback((x: number, y: number) => {
    if (reactFlowInstance.current) {
      setTimeout(() => {
        reactFlowInstance.current?.setCenter(x, y, { zoom: 1.2, duration: 800 });
      }, 100);
    }
  }, []);

  // Handle label change
  const handleLabelChange = useCallback((nodeId: string, newLabel: string) => {
    updateNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  }, [updateNodes]);

  // Add onLabelChange to all nodes
  const nodesWithHandlers = useMemo(() => 
    nodes.map((node) => ({
      ...node,
      data: { ...node.data, onLabelChange: handleLabelChange }
    })),
    [nodes, handleLabelChange]
  );

  const nodeTypes = useMemo(() => ({ 
    editableNode: EditableNode,
    imageNode: ImageNode,
  }), []);
 
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => updateNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [updateNodes],
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [setEdges],
  );
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      data: { borderRadius: 8 },
      ...({ borderRadius: 8 } as any),
    }, edgesSnapshot)),
    [setEdges],
  );

  const onViewportChange = useCallback(
    (newViewport: Viewport) => setViewport(newViewport),
    [setViewport],
  );

  // Handle node/edge deletion with Delete key
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      updateNodes((nds) => nds.filter((node) => !deleted.find((d) => d.id === node.id)));
    },
    [updateNodes],
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      setEdges((eds) => eds.filter((edge) => !deleted.find((d) => d.id === edge.id)));
    },
    [setEdges],
  );

  // Handle edge context menu (right-click)
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setContextMenu({
        id: edge.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [],
  );

  // Change edge type
  const handleChangeEdgeType = useCallback(
    (edgeId: string, newType: string) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? { ...edge, type: newType }
            : edge
        )
      );
    },
    [setEdges],
  );

  // Toggle edge animation
  const handleToggleAnimation = useCallback(
    (edgeId: string) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? { ...edge, animated: !edge.animated }
            : edge
        )
      );
    },
    [setEdges],
  );

  // Delete edge
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges],
  );

  // Add new text node
  const handleAddTextNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'editableNode',
      position: { 
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: { label: 'New Node' },
    };
    updateNodes((nds) => [...nds, newNode]);
    
    // Auto-focus on the new node
    focusOnNode(newNode.position.x + 100, newNode.position.y + 50);
  }, [updateNodes, focusOnNode]);

  // Add image node from file
  const handleAddImageNode = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const newNode: Node = {
        id: `image-node-${Date.now()}`,
        type: 'imageNode',
        position: { 
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
        data: { 
          imageUrl,
          label: file.name,
        },
        style: {
          width: 300,
          height: 250,
        },
      };
      updateNodes((nds) => [...nds, newNode]);
      
      // Auto-focus on the new image node
      focusOnNode(newNode.position.x + 150, newNode.position.y + 125);
    };
    reader.readAsDataURL(file);
  }, [updateNodes, focusOnNode]);

  // Enhanced edges with selection styling and border radius
  const styledEdges = useMemo(() =>
    edges.map((edge) => {
      const baseEdge: any = {
        ...edge,
        style: {
          ...edge.style,
          stroke: edge.selected ? colors.nodeBorder : colors.edgeColor,
          strokeWidth: edge.selected ? 3 : 2,
        },
        data: edge.data || {},
      };

      // For smoothstep edges, apply borderRadius as a direct property
      if (edge.type === 'smoothstep') {
        const radius = edge.data?.borderRadius ?? (edge as any).borderRadius ?? 8;
        baseEdge.borderRadius = radius;
        baseEdge.data = {
          ...baseEdge.data,
          borderRadius: radius,
        };
      }

      return baseEdge as Edge;
    }),
    [edges, colors]
  );

  return (
    <div 
      className="w-screen h-screen" 
      onClick={() => setContextMenu(null)}
      style={{ backgroundColor: colors.background }}
    >
      <ReactFlow
        proOptions={proOptions}
        nodes={nodesWithHandlers}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onEdgeContextMenu={onEdgeContextMenu}
        onViewportChange={onViewportChange}
        onInit={(instance) => { reactFlowInstance.current = instance; }}
        defaultViewport={viewport}
        deleteKeyCode="Delete"
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: colors.edgeColor, strokeWidth: 2 },
        }}
        style={{ backgroundColor: colors.background }}
      >
        <Background color={colors.gridColor} gap={16} />
      </ReactFlow>
      
      <ThemeToggle />
      <AddNodeMenu 
        onAddTextNode={handleAddTextNode}
        onAddImageNode={handleAddImageNode}
      />

      {contextMenu && (() => {
        const edge = edges.find(e => e.id === contextMenu.id);
        if (!edge) return null;
        
        return (
          <EdgeContextMenu
            id={contextMenu.id}
            top={contextMenu.y}
            left={contextMenu.x}
            edge={edge}
            onClose={() => setContextMenu(null)}
            onChangeType={handleChangeEdgeType}
            onToggleAnimation={handleToggleAnimation}
            onDelete={handleDeleteEdge}
          />
        );
      })()}
    </div>
  );
}