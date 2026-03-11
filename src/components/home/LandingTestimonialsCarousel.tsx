"use client";

import { useState } from "react";
import { Box, Container, Text, VStack, HStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/common/SectionHeader";
import { fadeInUp, defaultViewport } from "@/lib/animations";

const TESTIMONIALS = [
  {
    quote:
      "CCA has such a welcoming vibe. I've made new friends and learned a lot during tournaments. Love this platform for chess and more!",
    author: "Student Player",
    location: "Yaoundé",
  },
  {
    quote:
      "The staff and coaches are so kind and helpful. The academy is always buzzing with fun events. CCA is my go-to for competitive chess.",
    author: "University Player",
    location: "Douala",
  },
  {
    quote:
      "This platform is my favorite for improving my game. The puzzle variety is amazing and the community is always supportive. I always feel welcome at CCA!",
    author: "Rated Player",
    location: "Buea",
  },
];

export function LandingTestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const testimonial = TESTIMONIALS[index];

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
              label="Chess tales at CCA"
              title="What our community says"
              subtitle="Hear from players, coaches, and students who have grown with us."
              showDivider={true}
            />
          </motion.div>
          <Box
            position="relative"
            minH="200px"
            py={8}
            px={6}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="goldDark"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <VStack gap={4} align="center" textAlign="center" maxW="2xl" mx="auto">
                  <Text
                    color="textSecondary"
                    fontSize="lg"
                    lineHeight="1.7"
                    fontStyle="italic"
                    fontFamily="var(--font-accent), var(--font-playfair), Georgia, serif"
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </Text>
                  <VStack gap={0}>
                    <Text color="gold" fontWeight="600" fontSize="sm">
                      {testimonial.author}
                    </Text>
                    <Text color="textMuted" fontSize="xs">
                      {testimonial.location}
                    </Text>
                  </VStack>
                </VStack>
              </motion.div>
            </AnimatePresence>
            <HStack
              justify="center"
              gap={2}
              mt={6}
              position="absolute"
              bottom={4}
              left="50%"
              transform="translateX(-50%)"
            >
              {TESTIMONIALS.map((_, i) => (
                <Box
                  key={i}
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg={i === index ? "gold" : "goldDark"}
                  opacity={i === index ? 1 : 0.5}
                  cursor="pointer"
                  onClick={() => setIndex(i)}
                  _hover={{ opacity: 1 }}
                  transition="all 0.2s"
                />
              ))}
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
