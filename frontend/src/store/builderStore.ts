import { create } from 'zustand'
import type { Section, Theme } from '../types'

interface BuilderStore {
  sections: Section[]
  selectedId: string | null
  theme: Partial<Theme>
  isDirty: boolean
  setSections: (sections: Section[]) => void   // init from server — no dirty
  initTheme: (theme: Partial<Theme>) => void    // init from server — no dirty
  addSection: (section: Section) => void
  updateSection: (id: string, props: Record<string, unknown>) => void
  removeSection: (id: string) => void
  reorderSections: (sections: Section[]) => void
  selectSection: (id: string | null) => void
  setTheme: (theme: Partial<Theme>) => void     // user-triggered — marks dirty
  resetStore: () => void
  markClean: () => void
}

const INITIAL: Pick<BuilderStore, 'sections' | 'selectedId' | 'theme' | 'isDirty'> = {
  sections: [],
  selectedId: null,
  theme: {},
  isDirty: false,
}

export const useBuilderStore = create<BuilderStore>((set) => ({
  ...INITIAL,

  setSections: (sections) => set({ sections, isDirty: false }),

  initTheme: (theme) => set({ theme: { ...theme }, isDirty: false }),

  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, { ...section, order: state.sections.length }],
      selectedId: section.id,
      isDirty: true,
    })),

  updateSection: (id, props) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, props: { ...s.props, ...props } } : s,
      ),
      isDirty: true,
    })),

  removeSection: (id) =>
    set((state) => ({
      sections: state.sections
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i })),
      selectedId: state.selectedId === id ? null : state.selectedId,
      isDirty: true,
    })),

  reorderSections: (sections) =>
    set({ sections: sections.map((s, i) => ({ ...s, order: i })), isDirty: true }),

  selectSection: (id) => set({ selectedId: id }),

  setTheme: (theme) =>
    set((state) => ({ theme: { ...state.theme, ...theme }, isDirty: true })),

  resetStore: () => set({ ...INITIAL }),

  markClean: () => set({ isDirty: false }),
}))
