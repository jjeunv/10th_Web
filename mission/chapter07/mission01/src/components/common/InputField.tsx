type InputFieldProps = {
  label: string;
  placeholder?: string;
  error?: string;
  registration: React.InputHTMLAttributes<HTMLInputElement>;
  type?: string;
};

const InputField = ({
  label,
  placeholder,
  error,
  registration,
  type,
}: InputFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        {label}
      </label>
      <input
        {...registration}
        type={type}
        placeholder={placeholder}
        className={`rounded-lg px-4 py-3 text-sm outline-none transition-all bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 ${
          error
            ? "border border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)]"
            : "border border-neutral-200 focus:border-amber/60 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.07)]"
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default InputField;
