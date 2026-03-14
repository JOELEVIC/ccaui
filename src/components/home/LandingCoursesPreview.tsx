"use client";

import { Box, Container, VStack, Text, Button, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/common/SectionHeader";
import { fadeInUp, staggerContainer, staggerChild, defaultViewport } from "@/lib/animations";

const COURSES = [
  {
    title: "Mastering chess strategy: from basics to brilliance",
    duration: "8 hours",
    category: "Chess Basics",
    href: "/learning",
  },
  {
    title: "Chess for creative minds: imagination, style, brilliance",
    duration: "7 hours",
    category: "Strategy & Tactics",
    href: "/learning",
  },
  {
    title: "Chess for schools & teachers: education and growth",
    duration: "13 hours",
    category: "Chess Basics",
    href: "/learning",
  },
];

export function LandingCoursesPreview() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="bgCard">
      <Container maxW="6xl">
        <VStack gap={10} align="stretch">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <SectionHeader
              label="Explore unique chess classes"
              title="Unlock your chess potential with tailored courses"
              subtitle="Sharpen your mind with engaging puzzles and strategic training."
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
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
              {COURSES.map((course) => (
                <motion.div key={course.title} variants={staggerChild}>
                  <Box
                    p={6}
                    borderRadius="soft"
                    bg="bgSurface"
                    borderWidth="1px"
                    borderColor="whiteAlpha.06"
                    h="full"
                    display="flex"
                    flexDir="column"
                    _hover={{
                      borderColor: "gold",
                      boxShadow: "var(--shadow-card-soft-hover)",
                    }}
                    transition="all 0.2s"
                  >
                    <Text color="textMuted" fontSize="xs" mb={2}>
                      {course.category}
                    </Text>
                    <Text color="textPrimary" fontWeight="600" fontSize="md" mb={2} flex={1}>
                      {course.title}
                    </Text>
                    <Text color="gold" fontSize="sm" mb={4}>
                      {course.duration}
                    </Text>
                    <Link href={course.href}>
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="gold"
                        color="gold"
                        borderRadius="soft"
                        _hover={{ bg: "whiteAlpha.05" }}
                      >
                        Start learning →
                      </Button>
                    </Link>
                  </Box>
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
          <Link href="/learning">
            <Button
              size="sm"
              variant="outline"
              borderColor="gold"
              color="gold"
              borderRadius="soft"
              _hover={{ bg: "whiteAlpha.05" }}
            >
              View All Courses
            </Button>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
}
