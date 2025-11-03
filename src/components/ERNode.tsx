import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Key, Plus, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { DATABASE_TYPES } from '../constants/databaseTypes';

export interface ERAttribute {
  id: string;
  name: string;
  type: string;
  isPrimaryKey?: boolean;
}

export interface ERNodeData {
  entityName: string;
  attributes: ERAttribute[];
  onEntityNameChange?: (nodeId: string, newName: string) => void;
  onAttributesChange?: (nodeId: string, newAttributes: ERAttribute[]) => void;
  headerColor?: string;
}

function ERNode({ id, data, selected }: NodeProps) {
  const { colors } = useTheme();
  const nodeData = data as unknown as ERNodeData;
  const [isEditingEntity, setIsEditingEntity] = useState(false);
  const [entityName, setEntityName] = useState(nodeData.entityName);
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingType, setEditingType] = useState('');

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
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ backgroundColor: headerColor }}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="grid grid-cols-3 gap-0.5">
            <div className="w-1.5 h-1.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-sm"></div>
          </div>
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
              className="flex-1 text-white font-semibold text-sm cursor-text"
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
              <div className="px-3 py-2 flex items-center gap-2">
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
              <div className="px-3 py-2 flex items-center justify-between gap-2">
                <div
                  className="flex-1 flex items-center gap-2 cursor-text"
                  onDoubleClick={() => startEditingAttribute(attr)}
                  title="Double-click to edit"
                >
                  {attr.isPrimaryKey && <Key className="w-3.5 h-3.5" style={{ color: colors.accent }} />}
                  <span className="text-xs font-medium" style={{ color: colors.nodeText }}>
                    {attr.name}
                  </span>
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
    </div>
  );
}

export default memo(ERNode);
