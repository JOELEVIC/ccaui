"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { APP_NAME } from "@/lib/appName";
import { LuxuryButton } from "@/components/luxury/LuxuryPrimitives";

/**
 * MoreDrawer — slide-in side drawer in the Luxury Academic skin.
 *
 * Obsidian glass surface, gold rule under the wordmark, list of routes
 * with a thin gold underline on the active item, signed-in footer with
 * a luxury Sign out button.
 */

const SECTIONS: { title: string; links: { href: string; label: string; auth?: boolean }[] }[] = [
  {
    title: "Play",
    links: [
      { href: "/games", label: "Games" },
      { href: "/play/bot", label: "Engine" },
      { href: "/play/local", label: "Local" },
      { href: "/watch", label: "Watch" },
    ],
  },
  {
    title: "Study",
    links: [
      { href: "/learning", label: "Learn" },
      { href: "/road-to-master", label: "Road to Master" },
      { href: "/analysis", label: "Analysis" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/community", label: "Community" },
      { href: "/dashboard/tournaments", label: "Tournaments" },
      { href: "/players", label: "Players" },
      { href: "/dashboard/rankings", label: "Rankings" },
      { href: "/schools", label: "Schools", auth: true },
    ],
  },
  {
    title: "You",
    links: [{ href: "/profile", label: "Profile" }],
  },
];

export interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreDrawer({ isOpen, onClose }: MoreDrawerProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              background: "rgba(5,7,10,0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            aria-hidden
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(360px, 92vw)",
              zIndex: 41,
              background: "rgba(10, 13, 18, 0.92)",
              borderLeft: "1px solid var(--lux-glass-border-strong)",
              boxShadow: "-30px 0 80px rgba(0,0,0,0.5)",
              backdropFilter: "blur(22px) saturate(130%)",
              WebkitBackdropFilter: "blur(22px) saturate(130%)",
              padding: "28px 22px",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <HStack justify="space-between" mb={5} align="center">
              <HStack gap={2.5} align="center">
                <Box
                  w="22px"
                  h="1px"
                  bg="var(--lux-gold)"
                  style={{ boxShadow: "0 0 6px var(--lux-gold-muted)" }}
                />
                <Text
                  fontFamily="var(--font-playfair), Georgia, serif"
                  fontSize="lg"
                  color="var(--lux-text-primary)"
                  fontWeight="600"
                  letterSpacing="0.04em"
                >
                  {APP_NAME}
                </Text>
              </HStack>
              <Box
                as="button"
                onClick={onClose}
                w="34px"
                h="34px"
                borderRadius="999px"
                bg="var(--lux-glass-surface)"
                borderWidth="1px"
                borderColor="var(--lux-glass-border)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="var(--lux-text-secondary)"
                _hover={{
                  borderColor: "var(--lux-gold-muted)",
                  color: "var(--lux-gold-bright)",
                }}
                transition="all 0.18s"
                aria-label="Close"
              >
                <Text fontSize="md" lineHeight="1">✕</Text>
              </Box>
            </HStack>

            <Box className="lux-divider" mb={5} />

            {/* Sections */}
            <VStack align="stretch" gap={5}>
              {SECTIONS.map((section) => {
                const visibleLinks = section.links.filter((l) => !l.auth || user);
                if (visibleLinks.length === 0) return null;
                return (
                  <Box key={section.title}>
                    <Text
                      fontFamily="var(--font-inter), sans-serif"
                      fontSize="10px"
                      fontWeight="700"
                      letterSpacing="0.24em"
                      textTransform="uppercase"
                      color="var(--lux-gold)"
                      mb={2}
                      style={{ textShadow: "0 0 4px var(--lux-gold-muted)" }}
                    >
                      {section.title}
                    </Text>
                    <VStack align="stretch" gap={0.5}>
                      {visibleLinks.map((item) => {
                        const active =
                          pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                          <Link key={item.href} href={item.href} onClick={onClose} style={{ textDecoration: "none" }}>
                            <Box
                              position="relative"
                              px={3}
                              py={2.5}
                              borderRadius="6px"
                              bg={active ? "rgba(212,175,55,0.08)" : "transparent"}
                              transition="all 0.18s"
                              _hover={{
                                bg: "rgba(255,255,255,0.04)",
                              }}
                            >
                              {active && (
                                <Box
                                  position="absolute"
                                  left={0}
                                  top="50%"
                                  w="2px"
                                  h="18px"
                                  bg="var(--lux-gold)"
                                  style={{
                                    transform: "translateY(-50%)",
                                    boxShadow: "0 0 6px var(--lux-gold)",
                                  }}
                                />
                              )}
                              <Text
                                fontFamily="var(--font-inter), sans-serif"
                                fontSize="sm"
                                fontWeight={active ? "600" : "500"}
                                letterSpacing="0.04em"
                                color={
                                  active
                                    ? "var(--lux-text-primary)"
                                    : "var(--lux-text-secondary)"
                                }
                                pl={active ? 2 : 0}
                                transition="padding 0.18s"
                              >
                                {item.label}
                              </Text>
                            </Box>
                          </Link>
                        );
                      })}
                    </VStack>
                  </Box>
                );
              })}
              {isAdmin && (
                <Box>
                  <Text
                    fontFamily="var(--font-inter), sans-serif"
                    fontSize="10px"
                    fontWeight="700"
                    letterSpacing="0.24em"
                    textTransform="uppercase"
                    color="var(--lux-text-muted)"
                    mb={2}
                  >
                    Admin
                  </Text>
                  <Link href="/admin" onClick={onClose} style={{ textDecoration: "none" }}>
                    <Box
                      px={3}
                      py={2.5}
                      borderRadius="6px"
                      _hover={{ bg: "rgba(255,255,255,0.04)" }}
                    >
                      <Text
                        fontFamily="var(--font-inter), sans-serif"
                        fontSize="sm"
                        fontWeight="500"
                        color="var(--lux-text-secondary)"
                      >
                        Admin panel
                      </Text>
                    </Box>
                  </Link>
                </Box>
              )}
            </VStack>

            {/* Sign out footer */}
            {user && (
              <Box mt={8} pt={5} borderTopWidth="1px" borderColor="var(--lux-glass-border)">
                <Text
                  fontSize="10px"
                  color="var(--lux-text-muted)"
                  letterSpacing="0.22em"
                  textTransform="uppercase"
                  fontFamily="var(--font-inter), sans-serif"
                  mb={2.5}
                >
                  Signed in as
                </Text>
                <Text
                  fontFamily="var(--font-playfair), Georgia, serif"
                  fontSize="md"
                  fontWeight="600"
                  color="var(--lux-text-primary)"
                  letterSpacing="0.03em"
                  mb={3}
                >
                  {user.username}
                </Text>
                <LuxuryButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                >
                  Sign out
                </LuxuryButton>
              </Box>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
