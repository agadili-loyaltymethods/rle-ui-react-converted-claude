import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  globalError: string | null;
  selectedProgram: string | null;
  selectedDivision: string | null;
  sidebarOpen: boolean;
  setLoading: (loading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  setSelectedProgram: (programId: string | null) => void;
  setSelectedDivision: (divisionId: string | null) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  globalError: null,
  selectedProgram: null,
  selectedDivision: null,
  sidebarOpen: true,

  setLoading: (isLoading) => set({ isLoading }),
  setGlobalError: (globalError) => set({ globalError }),
  setSelectedProgram: (selectedProgram) => set({ selectedProgram }),
  setSelectedDivision: (selectedDivision) => set({ selectedDivision }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
