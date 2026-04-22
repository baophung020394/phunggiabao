"use client";

import { create } from "zustand";

type UiState = {
  isNoiseEnabled: boolean;
  toggleNoise: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isNoiseEnabled: true,
  toggleNoise: () => set((state) => ({ isNoiseEnabled: !state.isNoiseEnabled })),
}));
