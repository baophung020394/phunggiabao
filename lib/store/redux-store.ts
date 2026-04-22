"use client";

import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { TechCategory } from "@/lib/data";

type FilterState = {
  activeCategory: TechCategory;
};

const initialState: FilterState = {
  activeCategory: "All",
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<TechCategory>) => {
      state.activeCategory = action.payload;
    },
  },
});

export const { setCategory } = filterSlice.actions;

export const makeStore = () =>
  configureStore({
    reducer: {
      filters: filterSlice.reducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = useStore.withTypes<AppStore>();
