import { useProjectStore } from '@/store/projectStore'

export function useProject() {
  const project = useProjectStore((s) => s.project)
  const setProject = useProjectStore((s) => s.setProject)
  const clearProject = useProjectStore((s) => s.clearProject)

  return { project, setProject, clearProject }
}
