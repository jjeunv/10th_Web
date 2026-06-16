import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchMovies } from "@/shared/api";
import type { FormValues } from "@/shared/model";
import type { Movie } from "@/entities/movie";

const useMovieSearch = (searchParams: FormValues | null) => {
  const query = useQuery({
    queryKey: ["movies", searchParams],
    queryFn: searchParams
      ? () =>
          fetchMovies<Movie>(
            searchParams.query,
            searchParams.adult,
            searchParams.language,
          )
      : skipToken, // enabled 옵션 대신 사용
  });

  return query;
};

export default useMovieSearch;
