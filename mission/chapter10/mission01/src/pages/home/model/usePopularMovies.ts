import { useQuery } from "@tanstack/react-query";
import { fetchPopularMovies } from "@/shared/api";
import type { Movie } from "@/entities/movie";

const usePopularMovies = () => {
  const query = useQuery({
    queryKey: ["popular"],
    queryFn: fetchPopularMovies<Movie>,
  });

  return query;
};

export default usePopularMovies;
