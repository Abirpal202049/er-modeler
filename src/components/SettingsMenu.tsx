import { useState } from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';
import { useSettings, type EdgeType } from '../contexts/SettingsContext';

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { defaultEdgeType, defaultEdgeAnimated, setDefaultEdgeType, setDefaultEdgeAnimated } = useSettings();

  const edgeTypes: { value: EdgeType; label: string }[] = [
    { value: 'default', label: 'Straight' },
    { value: 'smoothstep', label: 'Smooth Step' },
    { value: 'step', label: 'Step' },
    { value: 'bezier', label: 'Bezier' },
  ];

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl flex items-center justify-center"
        style={{
          backgroundColor: '#4a7ba7',
          color: '#ffffff',
        }}
        title="Settings"
      >
        <SettingsIcon className="w-5 h-5" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div
            className="fixed top-0 right-0 h-full w-80 shadow-2xl z-50 overflow-y-auto"
            style={{
              backgroundColor: '#2a2a2a',
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{
                borderColor: '#3a3a3a',
              }}
            >
              <h2 
                className="text-lg font-semibold"
                style={{ color: '#ffffff' }}
              >
                Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full transition-all duration-200 hover:bg-opacity-80 flex items-center justify-center"
                style={{
                  backgroundColor: '#3a3a3a',
                  color: '#ffffff',
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Default Edge Type */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#e0e0e0' }}
                >
                  Default Edge Type
                </label>
                <div className="space-y-2">
                  {edgeTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setDefaultEdgeType(type.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-left text-sm transition-all duration-200 flex items-center justify-between"
                      style={{
                        backgroundColor: defaultEdgeType === type.value ? '#4a7ba7' : '#3a3a3a',
                        color: '#ffffff',
                      }}
                    >
                      <span>{type.label}</span>
                      {defaultEdgeType === type.value && (
                        <span className="text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Animation */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#e0e0e0' }}
                >
                  Default Edge Animation
                </label>
                <button
                  onClick={() => setDefaultEdgeAnimated(!defaultEdgeAnimated)}
                  className="w-full px-4 py-2.5 rounded-lg text-left text-sm transition-all duration-200 flex items-center justify-between"
                  style={{
                    backgroundColor: '#3a3a3a',
                    color: '#ffffff',
                  }}
                >
                  <span>Animated Edges</span>
                  <div
                    className="relative inline-block w-12 h-6 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: defaultEdgeAnimated ? '#4a7ba7' : '#555555',
                    }}
                  >
                    <div
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
                      style={{
                        transform: defaultEdgeAnimated ? 'translateX(24px)' : 'translateX(0)',
                      }}
                    />
                  </div>
                </button>
              </div>

              {/* Info Text */}
              <div
                className="p-3 rounded-lg text-xs"
                style={{
                  backgroundColor: '#3a3a3a',
                  color: '#999999',
                }}
              >
                <p>These settings will be applied to all new edges created on the canvas.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
