import { useCallback, useMemo, useState } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, type Node, type Edge, type NodeChange, type EdgeChange, type Connection, type Viewport, ConnectionLineType } from '@xyflow/react';
import type { ProOptions } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import EditableNode from './EditableNode';
import EdgeContextMenu from './EdgeContextMenu';

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
  const [nodes, setNodes] = useLocalStorage<Node[]>('er-diagram-nodes', initialNodes);
  const [edges, setEdges] = useLocalStorage<Edge[]>('er-diagram-edges', initialEdges);
  const [viewport, setViewport] = useLocalStorage<Viewport>('er-diagram-viewport', initialViewport);
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  // Handle label change
  const handleLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  }, [setNodes]);

  // Add onLabelChange to all nodes
  const nodesWithHandlers = useMemo(() => 
    nodes.map((node) => ({
      ...node,
      data: { ...node.data, onLabelChange: handleLabelChange }
    })),
    [nodes, handleLabelChange]
  );

  const nodeTypes = useMemo(() => ({ editableNode: EditableNode }), []);
 
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [setNodes],
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
      setNodes((nds) => nds.filter((node) => !deleted.find((d) => d.id === node.id)));
    },
    [setNodes],
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
      style={{ backgroundColor: colors.background }}
      onClick={() => setContextMenu(null)}
    >
      <ThemeToggle />
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
          />
        );
      })()}
    </div>
  );
}