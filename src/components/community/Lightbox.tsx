"use client";

import { useCallback, useEffect, useRef } from "react";
import { Box, Portal, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import type { ActivityImage } from "@/graphql/activities";

/**
 * Fullscreen photo viewer for event galleries. No external gallery dep —
 * Chakra + framer-motion only. Keyboard: Esc closes, ←/→ navigate; touch:
 * swipe horizontally; neighbours are preloaded so paging feels instant.
 */
export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: ActivityImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const open = index !== null && index >= 0 && index < images.length;
  const touchX = useRef<number | null>(null);

  const step = useCallback(
    (delta: number) => {
      if (index === null || images.length === 0) return;
      onNavigate((index + delta + images.length) % images.length);
    },
    [index, images.length, onNavigate]
  );

  // Keyboard + scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, step]);

  // Preload neighbours of the current photo.
  useEffect(() => {
    if (!open || index === null) return;
    [index - 1, index + 1].forEach((i) => {
      const img = images[(i + images.length) % images.length];
      if (img) new window.Image().src = img.url;
    });
  }, [open, index, images]);

  // AnimatePresence must stay mounted across open→closed so the exit fade
  // actually plays; the conditional lives INSIDE it.
  return (
    <Portal>
      <AnimatePresence>
        {open && index !== null ? (
          <LightboxOverlay
            key="lightbox"
            images={images}
            index={index}
            onClose={onClose}
            step={step}
            touchX={touchX}
          />
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

function LightboxOverlay({
  images,
  index,
  onClose,
  step,
  touchX,
}: {
  images: ActivityImage[];
  index: number;
  onClose: () => void;
  step: (delta: number) => void;
  touchX: { current: number | null };
}) {
  const current = images[index];

  return (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            background: "rgba(10, 13, 18, 0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={onClose}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
          }}
        >
          <motion.img
            key={current.id}
            src={current.url}
            alt={current.caption ?? `Photo ${index + 1}`}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              maxWidth: "94vw",
              maxHeight: "86vh",
              objectFit: "contain",
              borderRadius: "6px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Close */}
          <Box
            as="button"
            aria-label="Close photo viewer"
            position="fixed"
            top={{ base: 3, md: 5 }}
            right={{ base: 3, md: 6 }}
            w="42px"
            h="42px"
            borderRadius="full"
            bg="rgba(255,255,255,0.10)"
            color="white"
            fontSize="lg"
            _hover={{ bg: "rgba(255,255,255,0.22)" }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ✕
          </Box>

          {/* Prev / next — desktop affordance; mobile swipes */}
          {images.length > 1 ? (
            <>
              <Box
                as="button"
                aria-label="Previous photo"
                position="fixed"
                left={{ base: 2, md: 6 }}
                top="50%"
                transform="translateY(-50%)"
                display={{ base: "none", md: "flex" }}
                alignItems="center"
                justifyContent="center"
                w="48px"
                h="48px"
                borderRadius="full"
                bg="rgba(255,255,255,0.10)"
                color="white"
                fontSize="2xl"
                _hover={{ bg: "rgba(255,255,255,0.22)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
              >
                ‹
              </Box>
              <Box
                as="button"
                aria-label="Next photo"
                position="fixed"
                right={{ base: 2, md: 6 }}
                top="50%"
                transform="translateY(-50%)"
                display={{ base: "none", md: "flex" }}
                alignItems="center"
                justifyContent="center"
                w="48px"
                h="48px"
                borderRadius="full"
                bg="rgba(255,255,255,0.10)"
                color="white"
                fontSize="2xl"
                _hover={{ bg: "rgba(255,255,255,0.22)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
              >
                ›
              </Box>
            </>
          ) : null}

          {/* Counter + caption */}
          <Box
            position="fixed"
            bottom={{ base: 4, md: 6 }}
            left="50%"
            transform="translateX(-50%)"
            textAlign="center"
            onClick={(e) => e.stopPropagation()}
          >
            {current.caption ? (
              <Text color="rgba(255,255,255,0.9)" fontSize="sm" mb={1} maxW="80vw">
                {current.caption}
              </Text>
            ) : null}
            <Text color="rgba(255,255,255,0.55)" fontSize="xs" letterSpacing="0.08em">
              {index + 1} / {images.length}
            </Text>
          </Box>
        </motion.div>
  );
}
