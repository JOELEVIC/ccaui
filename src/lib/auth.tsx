"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      username
      role
      rating
      profile {
        id
        firstName
        lastName
        dateOfBirth
        country
        badges {
          id
          name
          description
          earnedAt
        }
      }
      school {
        id
        name
        region
      }
      createdAt
      updatedAt
    }
  }
`;

export type UserRole =
  | "STUDENT"
  | "COACH"
  | "SCHOOL_ADMIN"
  | "REGIONAL_ADMIN"
  | "NATIONAL_ADMIN"
  | "VOLUNTEER";

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  country: string;
  badges: Badge[];
}

export interface School {
  id: string;
  name: string;
  region: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  rating: number;
  profile: Profile | null;
  school: School | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  refetchUser: () => void;
  isAdmin: boolean;
  canManageSchools: boolean;
  canManageTournaments: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_ROLES: UserRole[] = ["SCHOOL_ADMIN", "REGIONAL_ADMIN", "NATIONAL_ADMIN"];
const SCHOOL_MANAGER_ROLES: UserRole[] = ["SCHOOL_ADMIN", "REGIONAL_ADMIN", "NATIONAL_ADMIN"];
const TOURNAMENT_MANAGER_ROLES: UserRole[] = ["COACH", "SCHOOL_ADMIN", "REGIONAL_ADMIN", "NATIONAL_ADMIN"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loadMe, { data, loading }] = useLazyQuery<{ me: User }>(ME_QUERY);

  const setToken = useCallback((t: string | null) => {
    if (typeof window === "undefined") return;
    if (t) localStorage.setItem("cca_token", t);
    else localStorage.removeItem("cca_token");
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    if (typeof window !== "undefined") window.location.href = "/login";
  }, [setToken]);

  const refetchUser = useCallback(() => {
    if (token) loadMe();
  }, [token, loadMe]);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("cca_token") : null;
    setTokenState(t);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && token) loadMe();
  }, [hydrated, token, loadMe]);

  const user = data?.me ?? null;
  const isAdmin = user ? ADMIN_ROLES.includes(user.role) : false;
  const canManageSchools = user ? SCHOOL_MANAGER_ROLES.includes(user.role) : false;
  const canManageTournaments = user ? TOURNAMENT_MANAGER_ROLES.includes(user.role) : false;

  const value: AuthContextValue = {
    user,
    loading: !hydrated || (!!token && loading),
    token,
    setToken,
    logout,
    refetchUser,
    isAdmin,
    canManageSchools,
    canManageTournaments,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
