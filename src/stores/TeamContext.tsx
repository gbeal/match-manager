// TeamContext - Global state management for teams and players
// Implements React Context + useReducer pattern as per architecture

'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Team, Player } from '../../packages/shared/src/types';
import { getTeamRepository, getPlayerRepository, initializePersistence } from '../services/persistence/database';

// State Interface
interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  players: Player[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Action Types
type TeamAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'SET_CURRENT_TEAM'; payload: Team | null }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'UPDATE_PLAYER'; payload: Player }
  | { type: 'DELETE_PLAYER'; payload: string }
  | { type: 'RESET_STATE' };

// Initial State
const initialState: TeamState = {
  teams: [],
  currentTeam: null,
  players: [],
  loading: false,
  error: null,
  initialized: false,
};

// Reducer
function teamReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        initialized: action.payload,
      };

    case 'SET_TEAMS':
      return {
        ...state,
        teams: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_TEAM':
      return {
        ...state,
        teams: [...state.teams, action.payload],
        loading: false,
        error: null,
      };

    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: state.teams.map(team =>
          team.id === action.payload.id ? action.payload : team
        ),
        currentTeam: state.currentTeam?.id === action.payload.id ? action.payload : state.currentTeam,
        loading: false,
        error: null,
      };

    case 'DELETE_TEAM':
      return {
        ...state,
        teams: state.teams.filter(team => team.id !== action.payload),
        currentTeam: state.currentTeam?.id === action.payload ? null : state.currentTeam,
        players: state.currentTeam?.id === action.payload ? [] : state.players,
        loading: false,
        error: null,
      };

    case 'SET_CURRENT_TEAM':
      return {
        ...state,
        currentTeam: action.payload,
        players: [], // Reset players when changing teams
        loading: false,
        error: null,
      };

    case 'SET_PLAYERS':
      return {
        ...state,
        players: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.payload],
        loading: false,
        error: null,
      };

    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map(player =>
          player.id === action.payload.id ? action.payload : player
        ),
        loading: false,
        error: null,
      };

    case 'DELETE_PLAYER':
      return {
        ...state,
        players: state.players.filter(player => player.id !== action.payload),
        loading: false,
        error: null,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context Interface
interface TeamContextValue {
  // State
  state: TeamState;

  // Team Actions
  loadTeams: () => Promise<void>;
  createTeam: (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Team>;
  updateTeam: (id: string, updates: Partial<Omit<Team, 'id' | 'createdAt'>>) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
  selectTeam: (team: Team | null) => Promise<void>;

  // Player Actions
  loadPlayers: (teamId: string) => Promise<void>;
  createPlayer: (playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Player>;
  updatePlayer: (id: string, updates: Partial<Omit<Player, 'id' | 'createdAt'>>) => Promise<Player>;
  deletePlayer: (id: string) => Promise<void>;

  // Utility Actions
  initialize: () => Promise<void>;
  clearError: () => void;
}

// Context Creation
const TeamContext = createContext<TeamContextValue | undefined>(undefined);

// Provider Component
interface TeamProviderProps {
  children: React.ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(teamReducer, initialState);

  // Initialize database and load initial data
  const initialize = useCallback(async () => {
    if (state.initialized) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await initializePersistence();

      // Load teams on initialization
      const teamRepository = getTeamRepository();
      const teams = await teamRepository.findAll();

      dispatch({ type: 'SET_TEAMS', payload: teams });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    } catch (error) {
      console.error('Failed to initialize TeamContext:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize application. Please refresh the page.' });
    }
  }, [state.initialized]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Team Actions
  const loadTeams = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const teamRepository = getTeamRepository();
      const teams = await teamRepository.findAll();
      dispatch({ type: 'SET_TEAMS', payload: teams });
    } catch (error) {
      console.error('Failed to load teams:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load teams. Please try again.' });
    }
  }, []);

  const createTeam = useCallback(async (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const teamRepository = getTeamRepository();
      const newTeam = await teamRepository.create(teamData);
      dispatch({ type: 'ADD_TEAM', payload: newTeam });
      return newTeam;
    } catch (error) {
      console.error('Failed to create team:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create team. Please try again.' });
      throw error;
    }
  }, []);

  const updateTeam = useCallback(async (id: string, updates: Partial<Omit<Team, 'id' | 'createdAt'>>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const teamRepository = getTeamRepository();
      const updatedTeam = await teamRepository.update(id, updates);
      dispatch({ type: 'UPDATE_TEAM', payload: updatedTeam });
      return updatedTeam;
    } catch (error) {
      console.error('Failed to update team:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update team. Please try again.' });
      throw error;
    }
  }, []);

  const deleteTeam = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const teamRepository = getTeamRepository();
      await teamRepository.delete(id);
      dispatch({ type: 'DELETE_TEAM', payload: id });
    } catch (error) {
      console.error('Failed to delete team:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete team. Please try again.' });
      throw error;
    }
  }, []);

  // Player Actions
  const loadPlayers = useCallback(async (teamId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const playerRepository = getPlayerRepository();
      const players = await playerRepository.findByTeamId(teamId);
      dispatch({ type: 'SET_PLAYERS', payload: players });
    } catch (error) {
      console.error('Failed to load players:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load players. Please try again.' });
    }
  }, []);

  const selectTeam = useCallback(async (team: Team | null) => {
    try {
      dispatch({ type: 'SET_CURRENT_TEAM', payload: team });

      // Load players for the selected team
      if (team) {
        await loadPlayers(team.id);
      }
    } catch (error) {
      console.error('Failed to select team:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to select team. Please try again.' });
    }
  }, [loadPlayers]);

  const createPlayer = useCallback(async (playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const playerRepository = getPlayerRepository();
      const newPlayer = await playerRepository.create(playerData);
      dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
      return newPlayer;
    } catch (error) {
      console.error('Failed to create player:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create player. Please try again.' });
      throw error;
    }
  }, []);

  const updatePlayer = useCallback(async (id: string, updates: Partial<Omit<Player, 'id' | 'createdAt'>>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const playerRepository = getPlayerRepository();
      const updatedPlayer = await playerRepository.update(id, updates);
      dispatch({ type: 'UPDATE_PLAYER', payload: updatedPlayer });
      return updatedPlayer;
    } catch (error) {
      console.error('Failed to update player:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update player. Please try again.' });
      throw error;
    }
  }, []);

  const deletePlayer = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const playerRepository = getPlayerRepository();
      await playerRepository.delete(id);
      dispatch({ type: 'DELETE_PLAYER', payload: id });
    } catch (error) {
      console.error('Failed to delete player:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete player. Please try again.' });
      throw error;
    }
  }, []);

  // Utility Actions
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const contextValue: TeamContextValue = {
    state,
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    selectTeam,
    loadPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    initialize,
    clearError,
  };

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
};

// Custom Hook
export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeamContext must be used within a TeamProvider');
  }
  return context;
};

export default TeamContext;