"use client";

import { useCallback } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export interface LoginPanelProps {
  open: boolean;
  onClose: () => void;
}

export function LoginPanel({ open, onClose }: LoginPanelProps) {
  const { setToken } = useAuth();
  const router = useRouter();

  const handleSuccess = useCallback(
    (token: string) => {
      setToken(token);
      onClose();
      router.push("/games");
    },
    [setToken, onClose, router]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 50,
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(400px, 100vw)",
              maxWidth: "100%",
              zIndex: 51,
              background: "var(--chakra-colors-bgCard)",
              borderLeftWidth: "1px",
              borderLeftColor: "rgba(255,255,255,0.06)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
            }}
          >
            <Box p={6} h="full" display="flex" flexDirection="column">
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
                <Text color="gold" fontWeight="600" fontFamily="var(--font-playfair), Georgia, serif">
                  Sign in
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  color="textMuted"
                  onClick={onClose}
                  aria-label="Close"
                >
                  ×
                </Button>
              </Box>
              <LoginForm onSuccess={handleSuccess} compact />
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
