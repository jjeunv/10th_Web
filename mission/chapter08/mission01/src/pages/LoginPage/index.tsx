import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../../components/common/InputField";
import { useNavigate } from "react-router";
import { useLogin } from "./hooks/useLogin";

const loginSchema = z.object({
  email: z.email("이메일 형식이 아닙니다."),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .regex(/[A-Z]/, "대문자를 포함해야 합니다.")
    .regex(/[^a-zA-Z0-9]/, "특수문자를 포함해야 합니다."),
});

type LoginFormType = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({ resolver: zodResolver(loginSchema) });

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-5xl text-amber tracking-[0.1em] mb-2">
            SIGN IN
          </p>
          <p className="text-sm text-neutral-400">
            바이닐 컬렉션에 오신 걸 환영합니다
          </p>
        </div>

        <form
          onSubmit={handleSubmit((data) => mutate(data))}
          className="flex flex-col gap-5 rounded-2xl p-8 bg-white border border-neutral-200 shadow-[0_2px_32px_rgba(0,0,0,0.06)]"
        >
          <InputField
            label="이메일"
            placeholder="your@email.com"
            error={errors.email?.message}
            registration={register("email")}
            type="email"
          />
          <InputField
            label="비밀번호"
            placeholder="••••••••"
            error={errors.password?.message}
            registration={register("password")}
            type="password"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-lg bg-amber text-white font-semibold text-sm transition-all mt-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber/90 active:scale-[0.99]"
          >
            {isPending ? "로그인 중..." : "로그인"}
          </button>
          {isError && (
            <p className="text-xs text-red-500 text-center">
              {error.message ?? "로그인에 실패했습니다."}
            </p>
          )}
          <p className="text-center text-xs text-neutral-400">
            계정이 없으신가요?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-amber hover:text-amber/80 transition-colors font-medium"
            >
              회원가입
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
