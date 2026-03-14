"use client";

import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LoginPanel } from "@/components/auth/LoginPanel";

export function LandingHeroMinimal() {
  const { user } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  const handlePlay = () => {
    if (user) {
      router.push("/games");
    } else {
      setShowLogin(true);
    }
  };

  return (
    <>
      <Box
        position="relative"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="bgDark"
        overflow="hidden"
      >
        {/* Subtle radial gradient */}
        <Box
          position="absolute"
          inset={0}
          background="radial-gradient(ellipse 80% 50% at 50% 50%, rgba(201, 169, 110, 0.06) 0%, transparent 70%)"
          pointerEvents="none"
        />
        {/* Very subtle grid */}
        <Box
          position="absolute"
          inset={0}
          opacity={0.03}
          backgroundImage="linear-gradient(rgba(201, 169, 110, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 169, 110, 0.3) 1px, transparent 1px)"
          backgroundSize="32px 32px"
          pointerEvents="none"
        />

        <motion.div
          style={{ display: "inline-block" }}
          animate={{
            scale: [1, 1.015, 1],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <button
            type="button"
            onClick={handlePlay}
            className="play-btn-gradient"
            style={{
              position: "relative",
              padding: "2px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #C9A96E, #E8C77A, #8F793D, #C9A96E)",
              backgroundSize: "200% 200%",
              cursor: "pointer",
              border: "none",
            }}
          >
            <Box
              px={8}
              py={4}
              borderRadius="10px"
              bg="rgba(17, 19, 24, 0.95)"
              color="white"
              fontWeight="600"
              fontSize="lg"
              fontFamily="var(--font-playfair), Georgia, serif"
              transition="background 0.2s"
              _hover={{ bg: "rgba(26, 30, 38, 0.98)" }}
            >
              Play
            </Box>
          </button>
        </motion.div>
      </Box>
      <LoginPanel open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
