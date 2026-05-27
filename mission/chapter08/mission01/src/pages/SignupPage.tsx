import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../shared/components/InputField";
import { useNavigate } from "react-router";
import { useSignup } from "../features/auth/hooks/useSignup";

const signupSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.email("이메일 형식이 아닙니다."),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .regex(/[A-Z]/, "대문자를 포함해야 합니다.")
    .regex(/[^a-zA-Z0-9]/, "특수문자를 포함해야 합니다."),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

type SignupFormType = z.infer<typeof signupSchema>;

const STEPS = ["기본 정보", "비밀번호", "프로필"];

const SignupPage = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const navigate = useNavigate();
  const { mutate, isPending } = useSignup();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SignupFormType>({ resolver: zodResolver(signupSchema) });

  const handleNext = async () => {
    const fields = step === 1 ? ["name", "email"] : ["password"];
    const isValid = await trigger(fields as (keyof SignupFormType)[]);
    if (isValid) setStep((s) => (s + 1) as 2 | 3);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-5xl text-amber tracking-[0.1em] mb-2">
            signup
          </p>
        </div>

        <div className="flex items-start gap-2 mb-8">
          {STEPS.map((label, i) => {
            const s = i + 1;
            const active = s === step;
            const done = s < step;
            return (
              <div key={s} className="flex-1 flex flex-col gap-1.5">
                <div
                  className={`h-0.5 rounded-full transition-all ${done ? "bg-amber" : active ? "bg-amber/50" : "bg-neutral-200"}`}
                />
                <span
                  className={`text-xs ${active ? "text-amber" : done ? "text-amber/60" : "text-neutral-400"}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit((data) => mutate(data))}
          className="flex flex-col gap-5 rounded-2xl p-8 bg-white border border-neutral-200 shadow-[0_2px_32px_rgba(0,0,0,0.06)]"
        >
          {step === 1 && (
            <>
              <InputField
                label="이름"
                placeholder="홍길동"
                error={errors.name?.message}
                registration={register("name")}
              />
              <InputField
                label="이메일"
                placeholder="your@email.com"
                error={errors.email?.message}
                registration={register("email")}
                type="email"
              />
            </>
          )}
          {step === 2 && (
            <InputField
              label="비밀번호"
              placeholder="••••••••"
              error={errors.password?.message}
              registration={register("password")}
              type="password"
            />
          )}
          {step === 3 && (
            <>
              <InputField
                label="자기소개 (선택)"
                placeholder="간단한 소개를 입력하세요"
                error={errors.bio?.message}
                registration={register("bio")}
              />
              <InputField
                label="프로필 이미지 URL (선택)"
                placeholder="https://..."
                error={errors.avatar?.message}
                registration={register("avatar")}
                type="url"
              />
            </>
          )}

          <div className="flex gap-2 mt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="flex-1 py-3 rounded-lg text-sm text-neutral-600 border border-neutral-200 transition hover:bg-neutral-50 hover:border-neutral-300"
              >
                이전
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 rounded-lg bg-amber text-white font-semibold text-sm transition hover:bg-amber/90 active:scale-[0.99]"
              >
                다음
              </button>
            )}
            {step === 3 && (
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-3 rounded-lg bg-amber text-white font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber/90 active:scale-[0.99]"
              >
                {isPending ? "처리 중..." : "가입하기"}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-neutral-400">
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-amber hover:text-amber/80 transition-colors font-medium"
            >
              로그인
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
