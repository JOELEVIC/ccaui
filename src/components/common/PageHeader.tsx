"use client";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";

interface PageHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
}

/** Consistent page header for public pages - matches landing section style */
export function PageHeader({ label, title, subtitle }: PageHeaderProps) {
  return (
    <VStack align="flex-start" gap={2} mb={8}>
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
      <Box h="1px" w="48px" bg="gold" opacity={0.8} />
      {subtitle && (
        <Text color="textMuted" fontSize="sm" lineHeight="1.6" maxW="xl">
          {subtitle}
        </Text>
      )}
    </VStack>
  );
}
