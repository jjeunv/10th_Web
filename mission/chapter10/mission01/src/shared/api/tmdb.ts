import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export const tmdbClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
});

tmdbClient.interceptors.request.use((config) => {
  config.params = { ...config.params, api_key: API_KEY };
  return config;
});

export const fetchMovies = async <T>(
  query: string,
  adult: boolean,
  language: string,
): Promise<T[]> => {
  const response = await tmdbClient.get("/search/movie", {
    params: {
      query: query,
      include_adult: adult,
      language: language,
    },
  });
  return response.data.results;
};

export const fetchPopularMovies = async <T>(): Promise<T[]> => {
  const response = await tmdbClient.get("/movie/popular");
  return response.data.results;
};
