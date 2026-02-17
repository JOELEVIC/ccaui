"use client";

import { Box, Container, HStack, Text, VStack, SimpleGrid, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";

const FOOTER_LINKS = {
  Academy: [
    { label: "About", href: "/" },
    { label: "Schools", href: "/schools" },
  ],
  Rankings: [{ label: "National Rankings", href: "/rankings" }],
  Tournaments: [{ label: "Tournaments", href: "/tournaments" }],
  Regulations: [{ label: "Regulations", href: "/regulations" }],
  Contact: [{ label: "Contact", href: "/contact" }],
};

export function LandingFooter() {
  return (
    <Box
      py={10}
      borderTopWidth="1px"
      borderColor="goldDark"
      bg="bgDark"
    >
      <Container maxW="6xl">
        <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} gap={8} mb={10}>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <VStack key={heading} align="flex-start" gap={2}>
              <Text color="gold" fontSize="xs" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase">
                {heading}
              </Text>
              {links.map(({ label, href }) => (
                <Link key={href} href={href}>
                  <ChakraLink
                    as="span"
                    color="textMuted"
                    fontSize="sm"
                    _hover={{ color: "gold" }}
                    transition="color 0.2s"
                  >
                    {label}
                  </ChakraLink>
                </Link>
              ))}
            </VStack>
          ))}
        </SimpleGrid>
        <VStack gap={3} pt={6} borderTopWidth="1px" borderColor="whiteAlpha.08">
          <Box
            w="48px"
            h="48px"
            borderRadius="full"
            borderWidth="1px"
            borderColor="gold"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="gold"
            fontSize="xl"
            aria-hidden
          >
            ♔
          </Box>
          <Text color="textMuted" fontSize="sm" fontStyle="italic">
            Discipline. Strategy. Excellence.
          </Text>
          <Text color="textMuted" fontSize="xs">
            © Cameroon Chess Academy
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
