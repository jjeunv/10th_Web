import { memo } from "react";
import { MovieCard } from "@/entities/movie";
import type { Movie } from "@/entities/movie";
import styles from "./MovieList.module.css";

interface MovieListProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const MovieList = memo(({ movies, onMovieClick }: MovieListProps) => {
  return (
    <div className={styles.grid}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={() => onMovieClick(movie)}
        />
      ))}
    </div>
  );
});

export default MovieList;
