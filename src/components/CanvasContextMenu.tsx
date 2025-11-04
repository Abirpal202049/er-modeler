interface CanvasContextMenuProps {
  top: number;
  left: number;
  onClose: () => void;
  onAddTextNode: () => void;
  onAddERNode: () => void;
  onAddImageNode: () => void;
}

export default function CanvasContextMenu({ 
  top, 
  left, 
  onClose, 
  onAddTextNode,
  onAddERNode,
  onAddImageNode,
}: CanvasContextMenuProps) {
  const menuItems = [
    { 
      label: 'Add ER Entity', 
      shortcut: '⌘/Ctrl+E',
      onClick: () => {
        onAddERNode();
        onClose();
      },
    },
    { 
      label: 'Add Text Node', 
      shortcut: '⌘/Ctrl+T',
      onClick: () => {
        onAddTextNode();
        onClose();
      },
    },
    { 
      label: 'Add Image Node', 
      shortcut: '⌘/Ctrl+I',
      onClick: () => {
        onAddImageNode();
        onClose();
      },
    },
  ];

  return (
    <>
      {/* Context Menu */}
      <div
        className="fixed z-50 min-w-[180px] rounded shadow-2xl overflow-hidden"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          backgroundColor: '#2a2a2a',
          border: '1px solid #3a3a3a',
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div 
          className="px-2.5 py-1.5 text-xs font-medium"
          style={{ 
            backgroundColor: '#3a3a3a',
            color: '#e0e0e0',
          }}
        >
          Add Node
        </div>
        
        {/* Menu Items */}
        <div className="py-0.5" style={{ backgroundColor: '#2a2a2a' }}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full px-3 py-1.5 text-left text-xs transition-all duration-100 flex items-center justify-between"
              style={{
                color: '#e0e0e0',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3a3a3a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span className="text-xs">{item.label}</span>
              <kbd 
                className="text-xs px-1.5 py-0.5 rounded font-mono"
                style={{ 
                  backgroundColor: '#3a3a3a',
                  color: '#999999',
                }}
              >
                {item.shortcut}
              </kbd>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
