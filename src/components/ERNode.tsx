import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Key, Plus, X, Link, Table2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { DATABASE_TYPES } from '../constants/databaseTypes';

export interface ERAttribute {
  id: string;
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referencedEntity?: string;
  referencedAttribute?: string;
  referencedNodeId?: string;
  referencedAttributeId?: string;
}

export interface ERNodeData {
  entityName: string;
  attributes: ERAttribute[];
  onEntityNameChange?: (nodeId: string, newName: string) => void;
  onAttributesChange?: (nodeId: string, newAttributes: ERAttribute[]) => void;
  headerColor?: string;
  availableEntities?: { id: string; name: string; attributes: ERAttribute[] }[];
}

function ERNode({ id, data, selected }: NodeProps) {
  const { colors } = useTheme();
  const nodeData = data as unknown as ERNodeData;
  const [isEditingEntity, setIsEditingEntity] = useState(false);
  const [entityName, setEntityName] = useState(nodeData.entityName);
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingType, setEditingType] = useState('');
  const [fkModalAttributeId, setFkModalAttributeId] = useState<string | null>(null);

  const headerColor = nodeData.headerColor || colors.primary;

  const handleEntityNameDoubleClick = () => {
    setIsEditingEntity(true);
  };

  const handleEntityNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEntityName(e.target.value);
  };

  const handleEntityNameBlur = () => {
    setIsEditingEntity(false);
    if (entityName.trim() && nodeData.onEntityNameChange) {
      nodeData.onEntityNameChange(id, entityName.trim());
    }
  };

  const handleEntityNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEntityNameBlur();
    } else if (e.key === 'Escape') {
      setEntityName(nodeData.entityName);
      setIsEditingEntity(false);
    }
  };

  const handleAddAttribute = () => {
    const newAttribute: ERAttribute = {
      id: `attr-${Date.now()}`,
      name: 'new_field',
      type: 'VARCHAR',
      isPrimaryKey: false,
    };
    const newAttributes = [...nodeData.attributes, newAttribute];
    if (nodeData.onAttributesChange) {
      nodeData.onAttributesChange(id, newAttributes);
    }
  };

  const handleDeleteAttribute = (attrId: string) => {
    const newAttributes = nodeData.attributes.filter(attr => attr.id !== attrId);
    if (nodeData.onAttributesChange) {
      nodeData.onAttributesChange(id, newAttributes);
    }
  };

  const handleTogglePrimaryKey = (attrId: string) => {
    const newAttributes = nodeData.attributes.map(attr =>
      attr.id === attrId ? { ...attr, isPrimaryKey: !attr.isPrimaryKey } : attr
    );
    if (nodeData.onAttributesChange) {
      nodeData.onAttributesChange(id, newAttributes);
    }
  };

  const startEditingAttribute = (attr: ERAttribute) => {
    setEditingAttributeId(attr.id);
    setEditingName(attr.name);
    setEditingType(attr.type);
  };

  const saveAttributeEdit = () => {
    if (editingAttributeId && editingName.trim() && editingType) {
      const newAttributes = nodeData.attributes.map(attr =>
        attr.id === editingAttributeId
          ? { ...attr, name: editingName.trim(), type: editingType }
          : attr
      );
      if (nodeData.onAttributesChange) {
        nodeData.onAttributesChange(id, newAttributes);
      }
    }
    setEditingAttributeId(null);
  };

  const cancelAttributeEdit = () => {
    setEditingAttributeId(null);
  };

  const handleAttributeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveAttributeEdit();
    } else if (e.key === 'Escape') {
      cancelAttributeEdit();
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditingType(e.target.value);
  };

  const handleToggleForeignKey = (attrId: string) => {
    const attr = nodeData.attributes.find(a => a.id === attrId);
    if (attr?.isForeignKey) {
      // Remove foreign key
      const newAttributes = nodeData.attributes.map(a =>
        a.id === attrId ? {
          ...a,
          isForeignKey: false,
          referencedEntity: undefined,
          referencedAttribute: undefined,
          referencedNodeId: undefined,
          referencedAttributeId: undefined,
        } : a
      );
      if (nodeData.onAttributesChange) {
        nodeData.onAttributesChange(id, newAttributes);
      }
    } else {
      // Open modal to select foreign key reference
      setFkModalAttributeId(attrId);
    }
  };

  const handleSetForeignKey = (entityId: string, attributeId: string) => {
    if (fkModalAttributeId) {
      const referencedEntity = nodeData.availableEntities?.find(e => e.id === entityId);
      const referencedAttr = referencedEntity?.attributes.find(a => a.id === attributeId);

      const newAttributes = nodeData.attributes.map(attr =>
        attr.id === fkModalAttributeId
          ? {
              ...attr,
              isForeignKey: true,
              referencedEntity: referencedEntity?.name,
              referencedAttribute: referencedAttr?.name,
              referencedNodeId: entityId,
              referencedAttributeId: attributeId,
            }
          : attr
      );
      if (nodeData.onAttributesChange) {
        nodeData.onAttributesChange(id, newAttributes);
      }
    }
    setFkModalAttributeId(null);
  };

  return (
    <div
      className="rounded-lg overflow-hidden shadow-lg transition-shadow duration-200 group"
      style={{
        backgroundColor: colors.nodeBg,
        border: `2px solid ${selected ? colors.primary : colors.nodeBorder}`,
        minWidth: '280px',
        boxShadow: selected ? `0 0 0 2px ${colors.primary}40` : undefined,
      }}
    >
      {/* Connection Handles - Multiple positions */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3! h-3! border-2! bg-white! opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ borderColor: colors.primary }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3! h-3! border-2! bg-white! opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ borderColor: colors.primary }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! border-2! bg-white! opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ borderColor: colors.primary }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! border-2! bg-white! opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ borderColor: colors.primary }}
      />

      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center gap-2 cursor-grab"
        style={{ backgroundColor: headerColor }}
      >
        <div className="flex items-center gap-2 flex-1">
          <Table2 size={20} className='text-white' />
          {isEditingEntity ? (
            <input
              type="text"
              value={entityName}
              onChange={handleEntityNameChange}
              onBlur={handleEntityNameBlur}
              onKeyDown={handleEntityNameKeyDown}
              className="flex-1 bg-white/20 border border-white/40 rounded px-2 py-1 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 text-white font-semibold text-sm cursor-grab"
              onDoubleClick={handleEntityNameDoubleClick}
              title="Double-click to edit"
            >
              {nodeData.entityName}
            </span>
          )}
        </div>
      </div>

      {/* Attributes Table */}
      <div className="divide-y" style={{ borderColor: colors.border }}>
        {nodeData.attributes.map((attr, index) => (
          <div
            key={attr.id}
            className="group/row hover:bg-opacity-50 transition-colors duration-150"
            style={{
              backgroundColor: index % 2 === 0 ? 'transparent' : `${colors.border}20`,
            }}
          >
            {editingAttributeId === attr.id ? (
              <div className="px-3 py-2 flex items-center gap-2 relative">
                {/* Attribute-specific connection handles */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${id}-${attr.id}-source`}
                  className="w-2! h-2! border! bg-blue-400! opacity-0 group-hover/row:opacity-100"
                  style={{ right: '-8px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`${id}-${attr.id}-target`}
                  className="w-2! h-2! border! bg-blue-400! opacity-0 group-hover/row:opacity-100"
                  style={{ left: '-8px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <div className="flex-1 flex items-center gap-2">
                  {attr.isPrimaryKey && <Key className="w-3.5 h-3.5" style={{ color: colors.accent }} />}
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleAttributeKeyDown}
                    className="nodrag flex-1 bg-white/5 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1"
                    style={{
                      borderColor: colors.border,
                      color: colors.nodeText,
                      backgroundColor: colors.background,
                    }}
                    placeholder="Field name"
                    autoFocus
                  />
                </div>
                <select
                  value={editingType}
                  onChange={handleSelectChange}
                  className="nodrag w-28 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 cursor-pointer"
                  style={{
                    borderColor: colors.border,
                    color: colors.nodeText,
                    backgroundColor: colors.background,
                  }}
                >
                  {DATABASE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <button
                  onClick={saveAttributeEdit}
                  className="nodrag p-1 rounded hover:bg-green-500/20 transition-colors"
                  title="Save"
                >
                  <Key className="w-3.5 h-3.5 text-green-500" />
                </button>
                <button
                  onClick={cancelAttributeEdit}
                  className="nodrag p-1 rounded hover:bg-red-500/20 transition-colors"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ) : (
              <div className="px-3 py-2 flex items-center justify-between gap-2 relative">
                {/* Attribute-specific connection handles */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${id}-${attr.id}-source`}
                  className="w-2! h-2! border! bg-blue-400! opacity-0 group-hover/row:opacity-100"
                  style={{ right: '-8px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`${id}-${attr.id}-target`}
                  className="w-2! h-2! border! bg-blue-400! opacity-0 group-hover/row:opacity-100"
                  style={{ left: '-8px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <div
                  className="flex-1 flex items-center gap-2 cursor-text"
                  onDoubleClick={() => startEditingAttribute(attr)}
                  title="Double-click to edit"
                >
                  {attr.isPrimaryKey && <Key className="w-3.5 h-3.5" style={{ color: colors.accent }} />}
                  {attr.isForeignKey && <Link className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />}
                  <span className="text-xs font-medium" style={{ color: colors.nodeText }}>
                    {attr.name}
                  </span>
                  {attr.isForeignKey && attr.referencedEntity && (
                    <span className="text-xs opacity-50 italic" style={{ color: colors.nodeText }}>
                      → {attr.referencedEntity}.{attr.referencedAttribute}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-60" style={{ color: colors.nodeText }}>
                    {attr.type}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleTogglePrimaryKey(attr.id)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                      title={attr.isPrimaryKey ? 'Remove primary key' : 'Set as primary key'}
                    >
                      <Key
                        className="w-3.5 h-3.5"
                        style={{ color: attr.isPrimaryKey ? colors.accent : colors.nodeText }}
                      />
                    </button>
                    <button
                      onClick={() => handleToggleForeignKey(attr.id)}
                      className="p-1 rounded hover:bg-blue-500/20 transition-colors"
                      title={attr.isForeignKey ? 'Remove foreign key' : 'Set as foreign key'}
                    >
                      <Link
                        className="w-3.5 h-3.5"
                        style={{ color: attr.isForeignKey ? '#3b82f6' : colors.nodeText }}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteAttribute(attr.id)}
                      className="p-1 rounded hover:bg-red-500/20 transition-colors"
                      title="Delete attribute"
                    >
                      <X className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Attribute Button */}
      <div
        className="px-3 py-2 border-t opacity-60 hover:opacity-100 transition-opacity"
        style={{ borderColor: colors.border }}
      >
        <button
          onClick={handleAddAttribute}
          className="flex items-center gap-2 text-xs hover:underline w-full"
          style={{ color: colors.nodeText }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Attribute</span>
        </button>
      </div>

      {/* Foreign Key Selection Modal */}
      {fkModalAttributeId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setFkModalAttributeId(null)}
        >
          <div
            className="rounded-lg shadow-xl p-4 max-w-md w-full mx-4"
            style={{ backgroundColor: colors.nodeBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: colors.nodeText }}>
                Select Foreign Key Reference
              </h3>
              <button
                onClick={() => setFkModalAttributeId(null)}
                className="p-1 rounded hover:bg-red-500/20 transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {nodeData.availableEntities && nodeData.availableEntities.length > 0 ? (
                nodeData.availableEntities.map((entity) => (
                  <div key={entity.id} className="mb-3">
                    <div
                      className="font-medium text-sm mb-1 px-2 py-1 rounded"
                      style={{ color: colors.nodeText, backgroundColor: colors.border + '40' }}
                    >
                      {entity.name}
                    </div>
                    <div className="space-y-1">
                      {entity.attributes.map((attr) => (
                        <button
                          key={attr.id}
                          onClick={() => handleSetForeignKey(entity.id, attr.id)}
                          className="w-full text-left px-3 py-2 rounded text-xs hover:bg-white/10 transition-colors flex items-center gap-2"
                          style={{ color: colors.nodeText }}
                        >
                          {attr.isPrimaryKey && <Key className="w-3 h-3" style={{ color: colors.accent }} />}
                          <span>{attr.name}</span>
                          <span className="opacity-60">({attr.type})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm opacity-60" style={{ color: colors.nodeText }}>
                  No other entities available. Create more ER nodes to establish foreign key relationships.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ERNode);
