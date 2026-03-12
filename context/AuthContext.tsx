"use client";

import {
  createContext, useContext, useEffect, useState, ReactNode,
} from "react";
import {
  onAuthStateChanged, User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup, signOut,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider, reauthenticateWithCredential,
} from "firebase/auth";
import { auth, googleProvider, firebaseReady } from "@/lib/firebase";
import { getUserProfile, UserProfile } from "@/lib/firestore";

interface AuthContextValue {
  user:    User | null;
  profile: UserProfile | null;
  loading: boolean;
  ready:   boolean;
  loginEmail:  (email: string, password: string) => Promise<void>;
  loginGoogle: () => Promise<User>;
  register:    (email: string, password: string) => Promise<User>;
  logout:      () => Promise<void>;
  resetPassword:  (email: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const noop = () => Promise.resolve() as never;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(firebaseReady); // false when not configured

  /* Session cookie yardımcıları */
  const setSessionCookie = async (u: User) => {
    const token = await u.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  };

  const clearSessionCookie = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
  };

  /* Auth state listener — sadece Firebase yapılandırıldıysa */
  useEffect(() => {
    if (!firebaseReady || !auth) { setLoading(false); return; }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await getUserProfile(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase yapılandırılmamış.");
    const { user: u } = await signInWithEmailAndPassword(auth, email, password);
    await setSessionCookie(u);
  };

  const loginGoogle = async (): Promise<User> => {
    if (!auth) throw new Error("Firebase yapılandırılmamış.");
    const { user: u } = await signInWithPopup(auth, googleProvider);
    await setSessionCookie(u);
    return u;
  };

  const register = async (email: string, password: string): Promise<User> => {
    if (!auth) throw new Error("Firebase yapılandırılmamış.");
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
    await setSessionCookie(u);
    return u;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    await clearSessionCookie();
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase yapılandırılmamış.");
    await sendPasswordResetEmail(auth, email);
  };

  const changePassword = async (current: string, next: string) => {
    if (!auth || !user?.email) throw new Error("Kullanıcı bulunamadı.");
    const cred = EmailAuthProvider.credential(user.email, current);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, next);
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      ready: firebaseReady,
      loginEmail, loginGoogle, register, logout,
      resetPassword, changePassword, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
