"use client";

import { Box } from "@chakra-ui/react";
import { LandingLegends } from "@/components/home/LandingLegends";

/**
 * Hall of Legends — its own page so the landing stays lean on every screen
 * size. The gallery component brings its own section spacing; pull it flush
 * against the public layout's container padding.
 */
export default function LegendsPage() {
  return (
    <Box mx={{ base: -4, md: -6 }} my={{ base: -8, md: -12 }}>
      <LandingLegends />
    </Box>
  );
}
