"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { Box } from "@chakra-ui/react";
import { toaster } from "@/lib/toaster";
import { LOGIN_WITH_GOOGLE } from "@/graphql/mutations/auth";

// Public OAuth client ID (safe to ship in the browser; the secret is never used).
const GOOGLE_CLIENT_ID =
  "649457496601-402n1u69bjcev77ntndni2ms4o22b03k.apps.googleusercontent.com";

type GoogleId = {
  accounts?: {
    id?: {
      initialize: (cfg: {
        client_id: string;
        callback: (r: { credential?: string }) => void;
      }) => void;
      renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
    };
  };
};

interface GoogleSignInButtonProps {
  /** Called with the app JWT on success; defaults to storing it and going to the dashboard. */
  onSuccess?: (token: string) => void;
}

/**
 * "Continue with Google" — renders Google Identity Services' button, exchanges
 * the returned ID token for an app session via the loginWithGoogle mutation.
 */
export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [loginWithGoogle] = useMutation<{ loginWithGoogle: { token: string } }>(LOGIN_WITH_GOOGLE);

  useEffect(() => {
    let cancelled = false;

    const handleCredential = async (resp: { credential?: string }) => {
      if (!resp?.credential) return;
      try {
        const { data } = await loginWithGoogle({ variables: { idToken: resp.credential } });
        const token = data?.loginWithGoogle?.token;
        if (!token) return;
        if (onSuccess) {
          onSuccess(token);
          return;
        }
        localStorage.setItem("cca_token", token);
        toaster.create({ title: "Signed in with Google", type: "success" });
        window.location.href = "/dashboard";
      } catch (e) {
        toaster.create({
          title: e instanceof Error ? e.message : "Google sign-in failed",
          type: "error",
        });
      }
    };

    const render = (): boolean => {
      const g = (window as unknown as { google?: GoogleId }).google;
      if (cancelled || !g?.accounts?.id || !ref.current) return false;
      g.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential });
      ref.current.innerHTML = "";
      g.accounts.id.renderButton(ref.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "center",
        width: 320,
      });
      return true;
    };

    if (render()) {
      return () => {
        cancelled = true;
      };
    }

    const existing = document.getElementById("gsi-client") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", render);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", render);
      };
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.id = "gsi-client";
    s.onload = render;
    document.head.appendChild(s);
    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, onSuccess]);

  return <Box ref={ref} display="flex" justifyContent="center" minH="44px" w="full" />;
}
