"use client";

import { Box, Container, VStack, Text, Button, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/common/SectionHeader";
import { fadeInUp, staggerContainer, staggerChild, defaultViewport } from "@/lib/animations";

const UPCOMING_TOURNAMENTS = gql`
  query LandingUpcomingTournaments {
    tournaments(status: UPCOMING) {
      id
      name
      startDate
      school {
        name
      }
    }
  }
`;

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LandingEventsPreview() {
  const { data } = useQuery<{
    tournaments: Array<{
      id: string;
      name: string;
      startDate: string;
      school?: { name: string };
    }>;
  }>(UPCOMING_TOURNAMENTS);

  const events = (data?.tournaments ?? []).slice(0, 3);

  return (
    <Box py={{ base: 16, md: 24 }} bg="bgDark">
      <Container maxW="6xl">
        <VStack gap={10} align="stretch">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <SectionHeader
              label="Upcoming chess events"
              title="Chess tournaments"
              subtitle="Join official CCA tournaments and compete at the highest level."
              showDivider={true}
            />
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            style={{ width: "100%" }}
          >
            <VStack gap={4} align="stretch" w="full">
              {events.length === 0 ? (
                <Box
                  p={8}
                  borderRadius="soft"
                  bg="bgCard"
                  borderWidth="1px"
                  borderColor="whiteAlpha.06"
                  textAlign="center"
                >
                  <Text color="textMuted">No upcoming events. Check back soon!</Text>
                  <Link href="/tournaments">
                    <Button size="sm" mt={4} variant="outline" borderColor="gold" color="gold">
                      View all tournaments
                    </Button>
                  </Link>
                </Box>
              ) : (
                events.map((event) => (
                  <motion.div key={event.id} variants={staggerChild}>
                    <Link href={`/tournaments/${event.id}`}>
                      <Box
                        p={5}
                        borderRadius="soft"
                        bg="bgCard"
                        borderWidth="1px"
                        borderColor="whiteAlpha.06"
                        _hover={{
                          borderColor: "gold",
                          boxShadow: "var(--shadow-card-soft-hover)",
                        }}
                        transition="all 0.2s"
                      >
                        <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={2}>
                          <VStack align="flex-start" gap={0}>
                            <Text color="gold" fontSize="xs" fontWeight="600">
                              {formatEventDate(event.startDate)}
                            </Text>
                            <Text color="textPrimary" fontWeight="600" fontSize="lg">
                              {event.name}
                            </Text>
                            {event.school?.name && (
                              <Text color="textMuted" fontSize="sm">
                                {event.school.name}
                              </Text>
                            )}
                          </VStack>
                          <Text color="gold" fontSize="sm" fontWeight="600">
                            Read More →
                          </Text>
                        </HStack>
                      </Box>
                    </Link>
                  </motion.div>
                ))
              )}
            </VStack>
          </motion.div>
          <Link href="/tournaments">
            <Button
              size="sm"
              variant="outline"
              borderColor="gold"
              color="gold"
              borderRadius="soft"
              _hover={{ bg: "whiteAlpha.05" }}
            >
              View All Events
            </Button>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
}
