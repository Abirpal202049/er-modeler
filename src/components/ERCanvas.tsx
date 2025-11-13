import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, type Node, type Edge, type NodeChange, type EdgeChange, type Connection, type Viewport, ConnectionLineType } from '@xyflow/react';
import type { ProOptions } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import ThemeToggle from './ThemeToggle';
import EditableNode from './EditableNode';
import ImageNode from './ImageNode';
import ERNode, { type ERAttribute } from './ERNode';
import EdgeContextMenu from './EdgeContextMenu';
import CanvasContextMenu from './CanvasContextMenu';
import AddNodeMenu from './AddNodeMenu';
import SettingsMenu from './SettingsMenu';
import FloatingEdge from './FloatingEdge';
import SimpleFloatingEdge from './SimpleFloatingEdge';
import FloatingConnectionLine from './FloatingConnectionLine';

const proOptions: ProOptions = { account: "paid-pro", hideAttribution: true };
 
const initialNodes: Node[] = [
  { id: 'n1', type: 'editableNode', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', type: 'editableNode', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges: Edge[] = [{
  id: 'n1-n2',
  source: 'n1',
  target: 'n2',
  type: 'simple-floating',
  animated: true,
  data: {
    borderRadius: 8,
    type: 'smoothstep', // Store the visual edge type in data
  },
  ...({ borderRadius: 8 } as any),
}];
const initialViewport: Viewport = { x: 0, y: 0, zoom: 1 };
 
export default function ERCanvas() {
  const { colors } = useTheme();
  const { defaultEdgeType, defaultEdgeAnimated, edgeMode } = useSettings();
  const { saveImage, getImage, deleteImage } = useIndexedDB();
  
  // Custom serialization for nodes - exclude imageUrl from localStorage
  const serializeNodes = useCallback((nodes: Node[]) => {
    return nodes.map(node => {
      if (node.type === 'imageNode' && node.data.imageUrl) {
        // Don't store the image data in localStorage, it's in IndexedDB
        return {
          ...node,
          data: {
            ...node.data,
            imageUrl: undefined,
            _hasImage: true
          }
        };
      }
      return node;
    });
  }, []);

  const [storedNodes, setStoredNodes] = useLocalStorage<Node[]>('er-diagram-nodes', initialNodes);
  const [nodes, setNodes] = useState<Node[]>(storedNodes);

  // Migrate existing edges based on edge mode
  const migrateEdges = useCallback((edges: Edge[]): Edge[] => {
    return edges.map(edge => {
      // Skip edges with individual mode overrides (marked with hasIndividualMode flag)
      if (edge.data?.hasIndividualMode) {
        return edge;
      }

      // If using normal mode, keep edges as-is but ensure they have the correct structure
      if (edgeMode === 'normal') {
        // If edge was floating/simple-floating, convert back to normal
        if (edge.type === 'floating' || edge.type === 'simple-floating') {
          const visualType = edge.data?.type || 'smoothstep';
          return {
            ...edge,
            type: visualType as string,
            data: edge.data,
          };
        }
        return edge;
      }

      // If edge is already the correct floating type, return as-is
      if (edge.type === edgeMode) {
        return edge;
      }

      // Migrate edge to the current edge mode (floating or simple-floating)
      const newEdgeType = edgeMode as string;
      return {
        ...edge,
        type: newEdgeType,
        data: {
          ...edge.data,
          type: edge.data?.type || edge.type || 'smoothstep', // Store original visual type in data
        },
      };
    });
  }, [edgeMode]);

  const [storedEdges, setStoredEdges] = useLocalStorage<Edge[]>('er-diagram-edges', initialEdges);
  const [edges, setEdges] = useState<Edge[]>(() => migrateEdges(storedEdges));
  const [viewport, setViewport] = useLocalStorage<Viewport>('er-diagram-viewport', initialViewport);

  // Update edges when edge mode changes
  useEffect(() => {
    setEdges((currentEdges) => migrateEdges(currentEdges));
  }, [edgeMode, migrateEdges]);

  // Update localStorage with edges
  useEffect(() => {
    setStoredEdges(edges);
  }, [edges, setStoredEdges]);
  const [edgeContextMenu, setEdgeContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [canvasContextMenu, setCanvasContextMenu] = useState<{ x: number; y: number } | null>(null);
  
  // Ref to store ReactFlow instance for auto-focus
  const reactFlowInstance = useRef<any>(null);

  // Load images from IndexedDB on mount
  useEffect(() => {
    const loadImages = async () => {
      const updatedNodes = await Promise.all(
        nodes.map(async (node) => {
          if (node.type === 'imageNode' && node.data._hasImage && !node.data.imageUrl) {
            const imageUrl = await getImage(node.id);
            if (imageUrl) {
              return {
                ...node,
                data: {
                  ...node.data,
                  imageUrl,
                },
              };
            }
          }
          return node;
        })
      );
      setNodes(updatedNodes);
    };

    loadImages();
  }, [getImage]); // Only run on mount

  // Ref for file input to trigger image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle ER entity name change
  const handleEntityNameChange = useCallback((nodeId: string, newName: string) => {
    updateNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, entityName: newName } }
          : node
      )
    );
  }, [updateNodes]);

  // Handle ER attributes change
  const handleAttributesChange = useCallback((nodeId: string, newAttributes: ERAttribute[]) => {
    updateNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, attributes: newAttributes } }
          : node
      )
    );
  }, [updateNodes]);

  // Generate foreign key edges based on node attributes
  const foreignKeyEdges = useMemo(() => {
    const fkEdges: Edge[] = [];

    nodes.forEach((node) => {
      if (node.type === 'erNode' && node.data.attributes && Array.isArray(node.data.attributes)) {
        (node.data.attributes as ERAttribute[]).forEach((attr) => {
          if (attr.isForeignKey && attr.referencedNodeId && attr.referencedAttributeId) {
            const edgeId = `fk-${node.id}-${attr.id}`;
            fkEdges.push({
              id: edgeId,
              source: node.id,
              target: attr.referencedNodeId,
              sourceHandle: `${node.id}-${attr.id}-source`,
              targetHandle: `${attr.referencedNodeId}-${attr.referencedAttributeId}-target`,
              type: edgeMode === 'normal' ? 'smoothstep' : edgeMode, // Use edge mode
              animated: false,
              style: {
                stroke: '#3b82f6',
                strokeWidth: 2,
                strokeDasharray: '5,5',
              },
              markerEnd: {
                type: 'arrowclosed' as const,
                color: '#3b82f6',
              },
              data: {
                isForeignKey: true,
                type: 'smoothstep', // Store the visual edge type in data
              },
            });
          }
        });
      }
    });

    return fkEdges;
  }, [nodes, edgeMode]);

  // Add handlers to all nodes
  const nodesWithHandlers = useMemo(() =>
    nodes.map((node) => {
      if (node.type === 'erNode') {
        // Get all other ER nodes as available entities for foreign key selection
        const availableEntities = nodes
          .filter(n => n.type === 'erNode' && n.id !== node.id)
          .map(n => ({
            id: n.id,
            name: n.data.entityName || 'Unnamed',
            attributes: n.data.attributes || []
          }));

        return {
          ...node,
          data: {
            ...node.data,
            onEntityNameChange: handleEntityNameChange,
            onAttributesChange: handleAttributesChange,
            availableEntities,
          }
        };
      }
      return {
        ...node,
        data: { ...node.data, onLabelChange: handleLabelChange }
      };
    }),
    [nodes, handleLabelChange, handleEntityNameChange, handleAttributesChange]
  );

  const nodeTypes = useMemo(() => ({
    editableNode: EditableNode,
    imageNode: ImageNode,
    erNode: ERNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    floating: FloatingEdge,
    'simple-floating': SimpleFloatingEdge,
  }), []);
 
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => updateNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [updateNodes],
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge({
      ...params,
      type: edgeMode === 'normal' ? defaultEdgeType : edgeMode, // Use edge mode or default type for normal mode
      animated: defaultEdgeAnimated,
      data: {
        borderRadius: 8,
        type: defaultEdgeType, // Store the visual edge type in data
      },
      ...({ borderRadius: 8 } as any),
    }, edgesSnapshot)),
    [defaultEdgeType, defaultEdgeAnimated, edgeMode],
  );

  const onViewportChange = useCallback(
    (newViewport: Viewport) => setViewport(newViewport),
    [setViewport],
  );

  // Handle node/edge deletion with Delete key
  const onNodesDelete = useCallback(
    async (deleted: Node[]) => {
      // Delete images from IndexedDB for image nodes
      const imageNodes = deleted.filter(node => node.type === 'imageNode');
      if (imageNodes.length > 0) {
        try {
          await Promise.all(imageNodes.map(node => deleteImage(node.id)));
        } catch (error) {
          console.error('Failed to delete images from IndexedDB:', error);
        }
      }
      
      updateNodes((nds) => nds.filter((node) => !deleted.find((d) => d.id === node.id)));
    },
    [updateNodes, deleteImage],
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      setEdges((eds) => eds.filter((edge) => !deleted.find((d) => d.id === edge.id)));
    },
    [],
  );

  // Handle edge context menu (right-click)
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setCanvasContextMenu(null);
      setEdgeContextMenu({
        id: edge.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [],
  );

  // Handle canvas context menu (right-click on empty space)
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      setEdgeContextMenu(null);
      setCanvasContextMenu({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [],
  );

  // Change edge type (visual type stored in data, actual type remains 'floating')
  const handleChangeEdgeType = useCallback(
    (edgeId: string, newType: string) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                data: {
                  ...edge.data,
                  type: newType, // Store visual edge type in data
                }
              }
            : edge
        )
      );
    },
    [],
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
    [],
  );

  // Change edge color
  const handleChangeEdgeColor = useCallback(
    (edgeId: string, color: string) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            const updatedEdge: Edge = {
              ...edge,
              style: {
                ...edge.style,
                stroke: color,
              },
            };

            // Update marker color if it exists
            if (edge.markerEnd && typeof edge.markerEnd === 'object' && 'type' in edge.markerEnd) {
              updatedEdge.markerEnd = {
                ...(edge.markerEnd as any),
                color: color,
              };
            }

            return updatedEdge;
          }
          return edge;
        })
      );
    },
    [],
  );

  // Delete edge
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [],
  );

  // Change edge mode (normal, floating, simple-floating)
  const handleChangeEdgeMode = useCallback(
    (edgeId: string, newMode: string) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            // If switching to normal mode, use the visual type as the actual type
            if (newMode === 'normal') {
              const visualType = edge.data?.type || 'smoothstep';
              return {
                ...edge,
                type: visualType as string,
                data: {
                  ...edge.data,
                  hasIndividualMode: true, // Mark this edge as having an individual override
                },
              };
            }
            // If switching to floating or simple-floating, keep visual type in data
            return {
              ...edge,
              type: newMode as string,
              data: {
                ...edge.data,
                type: edge.data?.type || edge.type || 'smoothstep',
                hasIndividualMode: true, // Mark this edge as having an individual override
              },
            };
          }
          return edge;
        })
      );
    },
    [],
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
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      const nodeId = `image-node-${Date.now()}`;

      // Save image to IndexedDB
      try {
        await saveImage(nodeId, imageUrl);
      } catch (error) {
        console.error('Failed to save image to IndexedDB:', error);
      }

      const newNode: Node = {
        id: nodeId,
        type: 'imageNode',
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
        data: {
          imageUrl,
          label: file.name,
          _hasImage: true,
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
  }, [updateNodes, focusOnNode, saveImage]);

  // Add new ER entity node
  const handleAddERNode = useCallback(() => {
    const newNode: Node = {
      id: `er-node-${Date.now()}`,
      type: 'erNode',
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        entityName: 'Entity',
        attributes: [
          { id: 'attr-1', name: 'id', type: 'INT', isPrimaryKey: true },
          { id: 'attr-2', name: 'name', type: 'VARCHAR', isPrimaryKey: false },
        ],
        headerColor: colors.primary,
      },
    };
    updateNodes((nds) => [...nds, newNode]);

    // Auto-focus on the new ER node
    focusOnNode(newNode.position.x + 140, newNode.position.y + 100);
  }, [updateNodes, focusOnNode, colors.primary]);

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAddImageNode(file);
      // Reset input so same file can be selected again
      event.target.value = '';
    }
  }, [handleAddImageNode]);

  // Keyboard shortcuts for adding nodes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Cmd/Ctrl + E: Add ER Entity
      if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
        event.preventDefault();
        handleAddERNode();
      }
      // Cmd/Ctrl + T: Add Text Node
      else if ((event.metaKey || event.ctrlKey) && event.key === 't') {
        event.preventDefault();
        handleAddTextNode();
      }
      // Cmd/Ctrl + I: Add Image Node (trigger file input)
      else if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault();
        fileInputRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddERNode, handleAddTextNode]);

  // Enhanced edges with selection styling and border radius
  const styledEdges = useMemo(() => {
    // Filter out user-created edges (non-FK edges)
    const userEdges = edges.filter(edge => !edge.data?.isForeignKey);

    // Combine user edges with foreign key edges
    const allEdges = [...userEdges, ...foreignKeyEdges];

    return allEdges.map((edge) => {
      // Determine stroke color: use custom color if set, otherwise use defaults
      const customStroke = edge.style?.stroke;
      const defaultStroke = edge.data?.isForeignKey ? '#3b82f6' : colors.edgeColor;
      const strokeColor = customStroke || defaultStroke;

      const baseEdge: any = {
        ...edge,
        style: {
          ...edge.style,
          stroke: strokeColor,
          strokeWidth: edge.selected ? 3 : 2,
          opacity: edge.selected ? 0.85 : 1,
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
    });
  }, [edges, foreignKeyEdges, colors]);

  return (
    <div 
      className="w-screen h-screen" 
      onClick={() => {
        setEdgeContextMenu(null);
        setCanvasContextMenu(null);
      }}
      style={{ backgroundColor: colors.background }}
    >
      <ReactFlow
        proOptions={proOptions}
        nodes={nodesWithHandlers}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={edgeMode === 'normal' ? undefined : FloatingConnectionLine}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onViewportChange={onViewportChange}
        onInit={(instance) => { reactFlowInstance.current = instance; }}
        defaultViewport={viewport}
        deleteKeyCode="Delete"
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: edgeMode === 'normal' ? defaultEdgeType : edgeMode, // Use edge mode or default type for normal mode
          animated: defaultEdgeAnimated,
          style: { stroke: colors.edgeColor, strokeWidth: 2 },
          data: { type: defaultEdgeType }, // Store visual edge type in data
        }}
        style={{ backgroundColor: colors.background }}
      >
        <Background color={colors.gridColor} gap={16} />
      </ReactFlow>
      
      <ThemeToggle />
      <SettingsMenu />
      <AddNodeMenu
        onAddTextNode={handleAddTextNode}
        onAddImageNode={handleAddImageNode}
        onAddERNode={handleAddERNode}
      />

      {/* Canvas Context Menu */}
      {canvasContextMenu && (
        <CanvasContextMenu
          top={canvasContextMenu.y}
          left={canvasContextMenu.x}
          onClose={() => setCanvasContextMenu(null)}
          onAddTextNode={handleAddTextNode}
          onAddERNode={handleAddERNode}
          onAddImageNode={() => fileInputRef.current?.click()}
        />
      )}

      {/* Edge Context Menu */}
      {edgeContextMenu && (() => {
        const edge = edges.find(e => e.id === edgeContextMenu.id);
        if (!edge) return null;
        
        return (
          <EdgeContextMenu
            id={edgeContextMenu.id}
            top={edgeContextMenu.y}
            left={edgeContextMenu.x}
            edge={edge}
            onClose={() => setEdgeContextMenu(null)}
            onChangeType={handleChangeEdgeType}
            onToggleAnimation={handleToggleAnimation}
            onChangeColor={handleChangeEdgeColor}
            onDelete={handleDeleteEdge}
            onChangeEdgeMode={handleChangeEdgeMode}
          />
        );
      })()}

      {/* Hidden file input for keyboard shortcut */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}