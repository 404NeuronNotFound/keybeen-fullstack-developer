import { create } from 'zustand';
import { projects } from '../data';
import type { Project } from '../types';

export const PROJECT_SECTIONS = ['Overview', 'Technologies', 'Next steps'] as const;

interface ProjectReaderState {
  currentProject: Project;
  section: number;
  isOpen: boolean;
  openProject: (project?: Project) => void;
  close: () => void;
  setSection: (section: number) => void;
  nextProject: () => void;
  previousProject: () => void;
}

export const useProjectReaderStore = create<ProjectReaderState>((set, get) => {
  const moveProject = (direction: 1 | -1) => {
    const index = projects.findIndex((project) => project.id === get().currentProject.id);
    const next = projects[index + direction];
    if (next) set({ currentProject: next, section: 0 });
  };

  return {
    currentProject: projects[0],
    section: 0,
    isOpen: false,
    openProject: (project) => {
      const selected = project ? projects.find((item) => item.id === project.id) : get().currentProject;
      if (!selected) return;
      set({
        currentProject: selected,
        section: project ? 0 : get().section,
        isOpen: true,
      });
    },
    close: () => set({ isOpen: false }),
    setSection: (section) => {
      if (Number.isInteger(section) && section >= 0 && section < PROJECT_SECTIONS.length) {
        set({ section });
      }
    },
    nextProject: () => moveProject(1),
    previousProject: () => moveProject(-1),
  };
});
