import { useCallback, useMemo, useState } from "react";
import type { FormValues } from "@/shared/model";
import { useMovieStore } from "@/entities/movie";
import { MovieList } from "@/widgets/movie-list";
import { MovieModal } from "@/widgets/movie-modal";
import { SearchBar } from "@/widgets/search-bar";
import useMovieSearch from "../model/useMovieSearch";
import usePopularMovies from "../model/usePopularMovies";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const [searchParams, setSearchParams] = useState<FormValues | null>(null);
  const {
    data: movies,
    isLoading: isSearching,
    isError,
  } = useMovieSearch(searchParams);
  const { data: popularMovies, isLoading: isLoadingPopular } =
    usePopularMovies();
  const { setSelectedMovie, selectedMovie } = useMovieStore();

  const handleSearch = useCallback(
    (data: FormValues) => setSearchParams(data),
    [],
  );

  const displayMovies = useMemo(
    () => movies ?? popularMovies ?? [],
    [movies, popularMovies],
  );

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.logo}>
          KA<span>SA</span>
        </div>
        <p className={styles.tagline}>10주차 미 션 하 기 ! ! !</p>
      </header>
      <div className={styles.content}>
        <SearchBar onSearch={handleSearch} />
        {(isSearching || isLoadingPopular) && (
          <p className={styles.status}>검색 중...</p>
        )}
        {isError && (
          <p className={styles.status}>오류가 발생했어요. 다시 시도해주세요.</p>
        )}
        {movies && movies.length > 0 && (
          <p className={styles.resultCount}>
            <span>{movies.length}</span> results found
          </p>
        )}
        <MovieList movies={displayMovies} onMovieClick={setSelectedMovie} />
      </div>
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
};

export default HomePage;
