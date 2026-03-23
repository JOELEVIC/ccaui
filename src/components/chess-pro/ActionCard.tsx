"use client";

import Link from "next/link";
import { Box, Text, VStack } from "@chakra-ui/react";

export interface ActionCardProps {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function ActionCard({ href, title, description, icon, variant = "primary" }: ActionCardProps) {
  const isPrimary = variant === "primary";
  return (
    <Link href={href}>
      <Box
        p={6}
        borderRadius="soft"
        bg={isPrimary ? "gold" : "bgSurface"}
        color={isPrimary ? "bgDark" : "textPrimary"}
        borderWidth={isPrimary ? "0" : "1px"}
        borderColor="whiteAlpha.100"
        minH="140px"
        transition="transform 0.15s, box-shadow 0.15s"
        _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
      >
        <VStack align="start" gap={2}>
          {icon && (
            <Text fontSize="2xl" lineHeight={1}>
              {icon}
            </Text>
          )}
          <Text fontWeight="700" fontSize="lg">
            {title}
          </Text>
          <Text fontSize="sm" opacity={isPrimary ? 0.9 : 0.85}>
            {description}
          </Text>
        </VStack>
      </Box>
    </Link>
  );
}
