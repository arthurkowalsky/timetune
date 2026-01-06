import { createContext, useContext } from 'react';
import type { UnifiedGameContext } from '../types/unified';

export const GameContext = createContext<UnifiedGameContext | null>(null);

export function useGame(): UnifiedGameContext {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
