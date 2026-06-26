"use client";

import { useState } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://dchessacademy.com";

/**
 * Share controls for a community post. Always shares the canonical PUBLIC URL
 * (so a link shared from inside the dashboard still opens the public, richly-
 * previewed page). Uses the native share sheet on mobile, falls back to
 * per-network deep links on desktop.
 */
export function ShareBar({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${SITE}/community/${slug}`;
  const u = encodeURIComponent(shareUrl);
  const t = encodeURIComponent(title);

  const links: Record<string, string> = {
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
  };

  async function native() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        /* user dismissed */
      }
    }
  }

  function open(href: string) {
    window.open(href, "_blank", "noopener,noreferrer,width=620,height=560");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  const btn = {
    w: "36px",
    h: "36px",
    borderRadius: "full",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.12s, opacity 0.12s",
    _hover: { transform: "translateY(-1px)", opacity: 0.92 },
  } as const;

  return (
    <HStack gap={2} flexWrap="wrap" align="center">
      <Text fontSize="xs" color="textMuted" fontWeight="600" letterSpacing="0.06em" textTransform="uppercase" mr={1}>
        Share
      </Text>

      {/* Native share (mobile) */}
      <Box
        as="button"
        onClick={native}
        {...btn}
        bg="bgSurface"
        borderWidth="1px"
        borderColor="goldDark"
        color="textPrimary"
        display={{ base: "flex", md: "none" }}
        aria-label="Share"
      >
        <Text fontSize="sm">↗</Text>
      </Box>

      <Box as="button" onClick={() => open(links.whatsapp)} {...btn} bg="#25D366" color="white" aria-label="Share on WhatsApp">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
        </svg>
      </Box>

      <Box as="button" onClick={() => open(links.facebook)} {...btn} bg="#1877F2" color="white" aria-label="Share on Facebook">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      </Box>

      <Box as="button" onClick={() => open(links.x)} {...btn} bg="#000000" color="white" aria-label="Share on X">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </Box>

      <Box
        as="button"
        onClick={copy}
        px={3}
        h="36px"
        borderRadius="full"
        display="flex"
        alignItems="center"
        bg="bgSurface"
        borderWidth="1px"
        borderColor="goldDark"
        color={copied ? "gold" : "textPrimary"}
        _hover={{ borderColor: "gold" }}
        transition="all 0.12s"
        aria-label="Copy link"
      >
        <Text fontSize="xs" fontWeight="600">
          {copied ? "Copied ✓" : "Copy link"}
        </Text>
      </Box>
    </HStack>
  );
}
