import { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type FormValues, searchSchema } from "@/shared/model";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  onSearch: (data: FormValues) => void;
}

const SearchBar = memo(({ onSearch }: SearchBarProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
      adult: false,
      language: "ko-KR",
    },
  });

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit(onSearch)}>
        <input
          className={styles.input}
          type="text"
          placeholder="영화 제목을 입력하세요"
          {...register("query")}
        />
        <div className={styles.divider} />
        <label className={styles.checkboxLabel} htmlFor="adult">
          <input
            className={styles.checkbox}
            type="checkbox"
            id="adult"
            {...register("adult")}
          />
          Adult
        </label>
        <div className={styles.divider} />
        <select className={styles.select} {...register("language")}>
          <option value="ko-KR">KO</option>
          <option value="en-US">EN</option>
          <option value="ja-JP">JA</option>
        </select>
        <button className={styles.button} type="submit">
          Search
        </button>
      </form>
      {errors.query && (
        <p className={styles.errorMessage}>{errors.query.message}</p>
      )}
    </div>
  );
});

export default SearchBar;
