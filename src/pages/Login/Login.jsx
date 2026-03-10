import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { User, KeyRound } from "lucide-react";
import AuthLayout from "../../components/AuthLayout/AuthLayout.jsx";
import { loginApi } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

const schema = z.object({
  login: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

function Input({ icon: Icon, error, ...props }) {
  return (
    <div>
      <div className={`relative rounded-xl border ${error ? "border-red-500" : "border-gray-200"} bg-white`}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </span>
        <input
          className="w-full rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-200"
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ mode: "onTouched", resolver: zodResolver(schema) });

const onSubmit = async (data) => {
  try {
    const res = await loginApi(data);

    const token = res?.data?.data?.token;
    const user = res?.data?.data?.user;

    saveSession(token, user); // تخزين التوكين

    navigate("/home", { replace: true }); // 👈 ده المهم
  } catch (err) {
    console.log(err);
  }
};
const { isAuthed } = useAuth();

if (isAuthed) {
  return <Navigate to="/home" replace />;
}
  return (
    <AuthLayout title="Log in to Route Posts" subtitle="Log in and continue your social journey.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Email or username"
          error={errors.login?.message}
          icon={User}
          {...register("login")}
        />
        <Input
          type="password"
          placeholder="Password"
          error={errors.password?.message}
          icon={KeyRound}
          {...register("password")}
        />

        <button
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-800 py-3 text-white font-semibold hover:bg-blue-900 disabled:opacity-60"
        >
          {isSubmitting ? "Loading..." : "Log In"}
        </button>

        <button type="button" className="w-full text-center text-sm text-blue-700 hover:underline">
          Forgot password?
        </button>
      </form>
    </AuthLayout>
  );
}