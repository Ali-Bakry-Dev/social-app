import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { User, AtSign, KeyRound, CalendarDays } from "lucide-react";
import AuthLayout from "../../components/AuthLayout/AuthLayout.jsx";
import { registerApi } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";

const passwordSchema = z
  .string()
  .min(8, "Min 8 characters")
  .regex(/[A-Z]/, "Must include 1 uppercase letter")
  .regex(/[0-9]/, "Must include 1 number")
  .regex(/[^A-Za-z0-9]/, "Must include 1 special character");

const schema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female"], {
      errorMap: () => ({ message: "Gender is required" }),
    }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function Input({ icon: Icon, error, right, className = "", ...props }) {
  return (
    <div>
      <div
        className={`relative rounded-xl border ${
          error ? "border-red-500" : "border-gray-200"
        } bg-white`}
      >
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </span>

        <input
          className={`w-full rounded-xl py-3 pl-10 ${
            right ? "pr-20" : "pr-4"
          } outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
          {...props}
        />

        {right}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    mode: "onTouched",
    resolver: zodResolver(schema),
    defaultValues: { gender: "male" },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        rePassword: data.confirmPassword, //  required by API
        dateOfBirth: data.dateOfBirth,    //  required by API
        gender: data.gender,              //  required by API
      };

      const res = await registerApi(payload);

      const token = res?.data?.data?.token;
      const user = res?.data?.data?.user;

      // لو السيرفر مارجّعش user، نخزن اللي عندنا
      const fallbackUser = {
        name: data.name,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      };

      // Auto-login بعد التسجيل (أحسن UX)
      if (token) {
        saveSession(token, user || fallbackUser);
       // ✅ بعد التسجيل دايمًا يروح Login
navigate("/login", { replace: true });
      }
    } catch (e) {
      // غالبًا server بيرجع errors/message
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Register failed";

      // لو فيه errors مفصلة
      const serverErrors = e?.response?.data?.errors;
      console.log("REGISTER ERROR:", msg, serverErrors);

      setError("email", { message: msg });
    }
  };

  return (
    <AuthLayout title="Create a new account" subtitle="It is quick and easy.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Name"
          error={errors.name?.message}
          icon={User}
          {...register("name")}
        />

        <Input
          placeholder="Email"
          error={errors.email?.message}
          icon={AtSign}
          {...register("email")}
        />

        {/* Gender Radio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>

          <div
            className={`rounded-xl border bg-white p-4 ${
              errors.gender ? "border-red-500" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="male"
                  {...register("gender")}
                  className="h-4 w-4 accent-blue-800"
                />
                <span className="text-sm text-gray-700">Male</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="female"
                  {...register("gender")}
                  className="h-4 w-4 accent-blue-800"
                />
                <span className="text-sm text-gray-700">Female</span>
              </label>
            </div>
          </div>

          {errors.gender?.message && (
            <p className="mt-2 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        <Input
          type="date"
          error={errors.dateOfBirth?.message}
          icon={CalendarDays}
          {...register("dateOfBirth")}
        />

        <Input
          type={showPass ? "text" : "password"}
          placeholder="Password"
          error={errors.password?.message}
          icon={KeyRound}
          {...register("password")}
          right={
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-700 hover:underline"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          }
        />

        <Input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm Password"
          error={errors.confirmPassword?.message}
          icon={KeyRound}
          {...register("confirmPassword")}
          right={
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-700 hover:underline"
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          }
        />

        <button
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-800 py-3 text-white font-semibold hover:bg-blue-900 disabled:opacity-60"
        >
          {isSubmitting ? "Loading..." : "Create New Account"}
        </button>
      </form>
    </AuthLayout>
  );
}