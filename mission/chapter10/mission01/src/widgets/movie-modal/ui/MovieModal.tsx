import { TMDB_BACKDROP_URL, TMDB_IMAGE_BASE_URL } from "@/shared/config";
import type { Movie } from "@/entities/movie";
import styles from "./MovieModal.module.css";

const MAX_POPULARITY = 500;

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

const MovieModal = ({ movie, onClose }: MovieModalProps) => {
  if (!movie) return null;

  const popularityPct = Math.min(
    (movie.popularity / MAX_POPULARITY) * 100,
    100,
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.hero}>
          <img
            className={styles.backdrop}
            src={`${TMDB_BACKDROP_URL}${movie.backdrop_path}`}
            alt={movie.title}
          />
          <div className={styles.heroGradient} />
          <div className={styles.heroText}>
            <h2 className={styles.heroTitle}>{movie.title}</h2>
            <p className={styles.heroSubtitle}>{movie.original_title}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <img
            className={styles.poster}
            src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
            alt={movie.title}
          />
          <div className={styles.details}>
            <div className={styles.rating}>
              <span className={styles.ratingScore}>
                {movie.vote_average.toFixed(1)}
              </span>
              <span className={styles.ratingCount}>
                ({movie.vote_count.toLocaleString()} 평가)
              </span>
            </div>

            <div className={styles.section}>
              <span className={styles.label}>개봉일</span>
              <span className={styles.value}>{movie.release_date}</span>
            </div>

            <div className={styles.section}>
              <span className={styles.label}>인기도</span>
              <div className={styles.popularityBar}>
                <div
                  className={styles.popularityFill}
                  style={{ width: `${popularityPct}%` }}
                />
              </div>
            </div>

            <div className={styles.section}>
              <span className={styles.label}>줄거리</span>
              <p className={styles.overview}>
                {movie.overview || "줄거리 정보가 없습니다."}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <a
            className={styles.imdbButton}
            href={`https://www.imdb.com/find?q=${movie.title}`}
            target="_blank"
            rel="noreferrer"
          >
            IMDb에서 검색
          </a>
          <button className={styles.closeButton} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
