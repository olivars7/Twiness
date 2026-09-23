import { create } from 'zustand'
import type { Project } from '@/types/project'

interface ProjectStore {
  project: Project | null
  setProject: (project: Project) => void
  updateProject: (partial: Partial<Project>) => void
  clearProject: () => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  project: null,
  setProject: (project) => set({ project }),
  updateProject: (partial) =>
    set((state) => ({
      project: state.project ? { ...state.project, ...partial } : null,
    })),
  clearProject: () => set({ project: null }),
}))
