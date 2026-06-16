import { create } from "zustand";
import type { Movie } from "./types";

interface StoreType {
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
}

export const useMovieStore = create<StoreType>((set) => ({
  selectedMovie: null,
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
}));
