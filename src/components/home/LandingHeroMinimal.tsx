"use client";

import { useState } from "react";
import { Box, Button } from "@chakra-ui/react";
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
      >
        <Button
          size="lg"
          bg="gold"
          color="black"
          fontWeight="600"
          px={12}
          py={6}
          fontSize="lg"
          borderRadius="soft"
          _hover={{ bg: "goldLight" }}
          transition="all 0.2s"
          onClick={handlePlay}
        >
          Play
        </Button>
      </Box>
      <LoginPanel open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
