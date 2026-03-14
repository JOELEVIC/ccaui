"use client";

import { Box, Container, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { SectionHeader } from "@/components/common/SectionHeader";
import { fadeInUp, defaultViewport } from "@/lib/animations";

const STATS = [
  { value: 3, label: "Years experience", suffix: "" },
  { value: 500, label: "Happy members", suffix: "+" },
  { value: 50, label: "Events hosted", suffix: "+" },
  { value: 20, label: "Schools", suffix: "+" },
];

export function LandingStats() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="bgCard">
      <Container maxW="6xl">
        <VStack gap={12} align="stretch">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <SectionHeader
              label="Bringing strategy to your day"
              title="Impressive Facts About Our Chess Academy"
              subtitle="At CCA, we invite all to enjoy great games and friends. Our academy makes learning chess easy and fun for everyone."
              showDivider={true}
            />
          </motion.div>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={6} w="full">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <VStack
                  p={6}
                  borderRadius="soft"
                  bg="bgSurface"
                  borderWidth="1px"
                  borderColor="whiteAlpha.06"
                  align="center"
                  gap={2}
                  _hover={{
                    borderColor: "gold",
                    boxShadow: "var(--shadow-card-soft-hover)",
                  }}
                  transition="all 0.2s"
                >
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    fontSize="3xl"
                    fontWeight="700"
                    color="gold"
                  />
                  <Text color="textMuted" fontSize="sm" textAlign="center">
                    {stat.label}
                  </Text>
                </VStack>
              </motion.div>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
