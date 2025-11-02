import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type EdgeType = 'default' | 'smoothstep' | 'step' | 'bezier' | 'straight';

interface Settings {
  defaultEdgeType: EdgeType;
  defaultEdgeAnimated: boolean;
}

interface SettingsContextType extends Settings {
  setDefaultEdgeType: (type: EdgeType) => void;
  setDefaultEdgeAnimated: (animated: boolean) => void;
}

const defaultSettings: Settings = {
  defaultEdgeType: 'smoothstep',
  defaultEdgeAnimated: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>('er-diagram-settings', defaultSettings);

  const setDefaultEdgeType = (type: EdgeType) => {
    setSettings(prev => ({ ...prev, defaultEdgeType: type }));
  };

  const setDefaultEdgeAnimated = (animated: boolean) => {
    setSettings(prev => ({ ...prev, defaultEdgeAnimated: animated }));
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setDefaultEdgeType,
        setDefaultEdgeAnimated,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
