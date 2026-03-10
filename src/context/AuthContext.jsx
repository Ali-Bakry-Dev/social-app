import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMyProfileApi } from "../api/users.js";

const AuthContext = createContext(null);

function safeParse(json, fallback = null) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function getUserIdFromToken(token) {
  try {
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.user || "";
  } catch {
    return "";
  }
}

function mergeUsers(oldUser, newUser, token) {
  const tokenUserId = getUserIdFromToken(token);

  const merged = {
    ...(oldUser || {}),
    ...(newUser || {}),
  };

  const finalId =
    merged?._id ||
    merged?.id ||
    tokenUserId ||
    "";

  return {
    ...merged,
    _id: finalId,
    id: finalId,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const [user, setUser] = useState(() => {
    const storedUser = safeParse(localStorage.getItem("user"), {});
    const storedCurrentUser = safeParse(localStorage.getItem("currentUser"), {});
    const storedExtra = safeParse(localStorage.getItem("profileExtra"), {});

    return mergeUsers(
      {
        ...storedCurrentUser,
        ...storedUser,
        ...storedExtra,
      },
      {},
      localStorage.getItem("token") || ""
    );
  });

  const [loading, setLoading] = useState(true);

  const isAuthed = !!token;
  const userId = user?._id || user?.id || getUserIdFromToken(token) || "";

  const persistMergedUser = (nextUser, tokenToUse) => {
    if (!nextUser) return;

    const full = mergeUsers({}, nextUser, tokenToUse);

    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        name: full?.name || "",
        email: full?.email || "",
      })
    );

    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: full?._id || "",
        id: full?.id || "",
        photo: full?.photo || full?.profilePhoto || full?.image || full?.avatar || "",
      })
    );

    localStorage.setItem(
      "profileExtra",
      JSON.stringify({
        dateOfBirth: full?.dateOfBirth || "",
        gender: full?.gender || "",
      })
    );
  };

  const saveSession = (newToken, newUser) => {
    const tokenToUse = newToken || token;

    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    }

    if (newUser) {
      setUser((prev) => {
        const merged = mergeUsers(prev, newUser, tokenToUse);
        persistMergedUser(merged, tokenToUse);
        return merged;
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("profileExtra");

    setToken("");
    setUser(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getMyProfileApi();

        const me =
          res?.data?.data?.user ||
          res?.data?.data ||
          res?.data?.user ||
          null;

        if (me) {
          setUser((prev) => {
            const merged = mergeUsers(prev, me, token);
            persistMergedUser(merged, token);
            return merged;
          });
        } else {
          setUser((prev) => mergeUsers(prev, {}, token));
        }
      } catch (e) {
        console.log("AUTH BOOTSTRAP ERROR:", e);
        setUser((prev) => mergeUsers(prev, {}, token));
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      userId,
      setUser,
      loading,
      isAuthed,
      saveSession,
      logout,
    }),
    [token, user, userId, loading, isAuthed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);