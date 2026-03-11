"use client";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  showDivider?: boolean;
  align?: "left" | "center";
}

export function SectionHeader({
  label,
  title,
  subtitle,
  showDivider = true,
  align = "center",
}: SectionHeaderProps) {
  return (
    <VStack
      gap={2}
      align={align === "center" ? "center" : "flex-start"}
      textAlign={align}
      maxW="2xl"
      mx={align === "center" ? "auto" : undefined}
    >
      {label && (
        <Text
          color="gold"
          fontSize="xs"
          fontWeight="600"
          letterSpacing="0.08em"
          textTransform="uppercase"
          fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
        >
          {label}
        </Text>
      )}
      <Heading
        size="xl"
        fontFamily="var(--font-playfair), Georgia, serif"
        color="textPrimary"
        letterSpacing="0.03em"
      >
        {title}
      </Heading>
      {showDivider && (
        <Box h="1px" w="48px" bg="gold" opacity={0.8} flexShrink={0} />
      )}
      {subtitle && (
        <Text color="textMuted" fontSize="sm" lineHeight="1.6" maxW="xl">
          {subtitle}
        </Text>
      )}
    </VStack>
  );
}
