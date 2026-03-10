import { NavLink } from "react-router-dom";

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex-1 rounded-lg py-2 text-sm font-semibold transition text-center ${
          isActive ? "bg-white shadow-sm text-blue-800" : "text-gray-600 hover:bg-white/60"
        }`
      }
      end
    >
      {children}
    </NavLink>
  );
}

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* LEFT */}
          <section>
            <h1 className="text-5xl font-extrabold text-blue-700">Route Posts</h1>
            <p className="mt-4 text-lg text-gray-700 max-w-md">
              Connect with friends and the world around you on Route Posts.
            </p>

            <div className="mt-8 rounded-2xl border bg-white shadow-sm p-6">
              <p className="text-xs font-bold tracking-widest text-blue-700">
                ABOUT ROUTE ACADEMY
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Egypt&apos;s Leading IT Training Center Since 2012
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Route Academy is a premier IT training center in Egypt, established in 2012.
                We specialize in delivering high-quality training courses.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  ["2012", "FOUNDED"],
                  ["40K+", "GRADUATES"],
                  ["50+", "PARTNER COMPANIES"],
                  ["20", "DIPLOMAS AVAILABLE"],
                ].map(([num, label]) => (
                  <div key={label} className="rounded-xl border bg-slate-50 p-4">
                    <div className="text-xl font-extrabold text-blue-700">{num}</div>
                    <div className="mt-1 text-[11px] font-bold text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <section className="lg:justify-self-end w-full">
            <div className="w-full max-w-md rounded-2xl bg-white border shadow-sm p-6">
              <div className="rounded-xl bg-slate-100 p-1 flex gap-1">
                <Tab to="/login">Login</Tab>
                <Tab to="/register">Register</Tab>
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              </div>

              <div className="mt-6">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}