import { TMDB_IMAGE_BASE_URL } from "@/shared/config";
import type { Movie } from "../model/types";
import styles from "./MovieCard.module.css";

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

const MovieCard = ({ movie, onClick }: MovieCardProps) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <img
        loading="lazy"
        className={styles.poster}
        src={
          movie.poster_path
            ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
            : undefined
        }
        alt={movie.title}
      />
      <div className={styles.overlay}>
        <p className={styles.title}>{movie.title}</p>
        <div className={styles.meta}>
          <span className={styles.rating}>
            ★ {movie.vote_average.toFixed(1)}
          </span>
          <span className={styles.date}>{movie.release_date?.slice(0, 4)}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
