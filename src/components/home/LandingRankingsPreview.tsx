"use client";

import { Box, Container, Heading, Text, VStack, HStack, Button, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { motion } from "framer-motion";
import { fadeInUp, defaultViewport } from "@/lib/animations";

const TOP_USERS = gql`
  query LandingTopUsers {
    users(filters: {}) {
      id
      username
      rating
      profile {
        firstName
        lastName
      }
      school {
        name
        region
      }
    }
  }
`;

function Avatar({ name }: { name: string; rank: number }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";
  return (
    <Box
      w="48px"
      h="48px"
      borderRadius="full"
      bg="goldDark"
      color="gold"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="bold"
      fontSize="lg"
      flexShrink={0}
    >
      {initial}
    </Box>
  );
}

export function LandingRankingsPreview() {
  const { data } = useQuery<{
    users: Array<{
      id: string;
      username: string;
      rating: number;
      profile?: { firstName?: string; lastName?: string };
      school?: { name: string; region: string };
    }>;
  }>(TOP_USERS);

  const top5 = (data?.users ?? []).slice(0, 5);

  return (
    <Box py={{ base: 20, md: 24 }} bg="bgDark">
      <Container maxW="6xl">
        <VStack gap={10} align="stretch">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <VStack gap={2} align="stretch">
              <Heading
              size="lg"
              fontFamily="var(--font-playfair), Georgia, serif"
              color="textPrimary"
              letterSpacing="0.05em"
              textTransform="uppercase"
            >
              National Rankings
            </Heading>
            <Box h="1px" w="64px" bg="gold" opacity={0.8} />
          </VStack>
          </motion.div>

          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} gap={4} w="full">
            {top5.map((user, i) => (
              <Link key={user.id} href="/rankings">
                <Box
                  p={4}
                  borderRadius="soft"
                  bg="bgSurface"
                  borderWidth="1px"
                  borderColor="whiteAlpha.06"
                  boxShadow="var(--shadow-card-soft)"
                  _hover={{
                    borderColor: "gold",
                    boxShadow: "var(--shadow-card-soft-hover)",
                    transform: "scale(1.01)",
                  }}
                  transition="all 0.2s"
                  position="relative"
                >
                  {i === 0 && (
                    <Box
                      position="absolute"
                      top={2}
                      right={2}
                      fontSize="lg"
                      color="gold"
                      aria-hidden
                    >
                      ♔
                    </Box>
                  )}
                  <HStack gap={3}>
                    <Text color="textMuted" fontWeight="bold" fontSize="2xl">
                      #{i + 1}
                    </Text>
                    <Avatar
                      name={user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.username}
                      rank={i + 1}
                    />
                    <VStack align="flex-start" gap={0} flex={1} minW={0}>
                      <Text color="textPrimary" fontWeight="600" fontSize="sm" lineClamp={1}>
                        {user.profile
                          ? `${user.profile.firstName} ${user.profile.lastName}`
                          : user.username}
                      </Text>
                      <Text color="textMuted" fontSize="xs" lineClamp={1}>
                        {user.school?.name ?? "—"}
                      </Text>
                      <Text color="gold" fontWeight="700" fontSize="lg">
                        {user.rating}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </Link>
            ))}
          </SimpleGrid>

          <HStack justify="flex-end" w="full">
            <Link href="/rankings">
              <Button
                size="sm"
                variant="outline"
                borderColor="gold"
                color="gold"
                borderRadius="soft"
                _hover={{ bg: "whiteAlpha.05" }}
              >
                View Full Rankings
              </Button>
            </Link>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
