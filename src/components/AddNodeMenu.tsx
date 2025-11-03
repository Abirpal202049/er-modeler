import { useState, useRef } from 'react';
import { Plus, Image, X, Square, Table } from 'lucide-react';

interface AddNodeMenuProps {
  onAddTextNode: () => void;
  onAddImageNode: (file: File) => void;
  onAddERNode: () => void;
}

export default function AddNodeMenu({ onAddTextNode, onAddImageNode, onAddERNode }: AddNodeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onAddImageNode(file);
      setIsOpen(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddTextNode = () => {
    onAddTextNode();
    setIsOpen(false);
  };

  const handleAddERNode = () => {
    onAddERNode();
    setIsOpen(false);
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Floating action button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Menu items */}
        {isOpen && (
          <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={handleAddERNode}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
              }}
              title="Add ER entity"
            >
              <Table className="w-5 h-5" />
              <span className="text-sm font-medium whitespace-nowrap">Add ER Entity</span>
            </button>

            <button
              onClick={handleAddTextNode}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
              }}
              title="Add text node"
            >
              <Square className="w-5 h-5" />
              <span className="text-sm font-medium whitespace-nowrap">Add Text Node</span>
            </button>

            <button
              onClick={handleImageClick}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
              }}
              title="Import image as node"
            >
              <Image className="w-5 h-5" />
              <span className="text-sm font-medium whitespace-nowrap">Import Image</span>
            </button>
          </div>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl flex items-center justify-center"
          style={{
            backgroundColor: '#4a7ba7',
            color: '#ffffff',
          }}
          title={isOpen ? 'Close menu' : 'Add node'}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>
    </>
  );
}
