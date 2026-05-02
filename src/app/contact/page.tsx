"use client";

import { useState } from "react";
import { Box, Button, Container, Heading, HStack, Input, SimpleGrid, Text, Textarea, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { LandingNav } from "@/components/home/LandingNav";
import { LandingFooter } from "@/components/home/LandingFooter";
import { PageHeader } from "@/components/common/PageHeader";
import { fadeInUp, defaultViewport } from "@/lib/animations";
import { toaster } from "@/lib/toaster";

const CHANNELS = [
  {
    label: "General & Membership",
    value: "info@dchessacademy.com",
    href: "mailto:info@dchessacademy.com",
    note: "Joining the academy, schools, scholarships.",
  },
  {
    label: "Tournaments & Events",
    value: "events@dchessacademy.com",
    href: "mailto:events@dchessacademy.com",
    note: "Arena registration, school tournaments, broadcast access.",
  },
  {
    label: "Coaching & Lessons",
    value: "coach@dchessacademy.com",
    href: "mailto:coach@dchessacademy.com",
    note: "Private lessons, group classes, certified trainers.",
  },
  {
    label: "Partnerships",
    value: "partners@dchessacademy.com",
    href: "mailto:partners@dchessacademy.com",
    note: "Federations, sponsors, NGOs, corporate programs.",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      toaster.create({ title: "Email and message are required", type: "error" });
      return;
    }
    setSubmitting(true);
    const subject = encodeURIComponent(`[CCA Contact] ${topic} — ${name || "from website"}`);
    const body = encodeURIComponent(`From: ${name} <${email}>\nTopic: ${topic}\n\n${message}`);
    window.location.href = `mailto:info@dchessacademy.com?subject=${subject}&body=${body}`;
    setSubmitting(false);
    toaster.create({ title: "Opening your email client…", type: "success" });
  };

  return (
    <Box minH="100vh" bg="bgDark" color="white" display="flex" flexDir="column">
      <LandingNav />
      <Box flex={1} py={{ base: 8, md: 14 }}>
        <Container maxW="5xl" px={{ base: 4, md: 6 }}>
          <PageHeader
            label="Get in touch"
            title="Contact the academy"
            subtitle="Membership, tournaments, coaching, schools, partnerships — pick the right inbox or send a single message and we'll route it."
          />

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 8, lg: 12 }} mt={8}>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
            >
              <VStack align="stretch" gap={4}>
                {CHANNELS.map((c) => (
                  <Box
                    key={c.value}
                    p={5}
                    bg="bgCard"
                    borderRadius="soft"
                    borderWidth="1px"
                    borderColor="whiteAlpha.080"
                    _hover={{ borderColor: "goldDark" }}
                    transition="border-color 0.2s"
                  >
                    <Text
                      fontSize="xs"
                      color="gold"
                      fontWeight="600"
                      letterSpacing="0.06em"
                      textTransform="uppercase"
                    >
                      {c.label}
                    </Text>
                    <a href={c.href} style={{ display: "inline-block", marginTop: 4, fontWeight: 600, color: "var(--chakra-colors-textPrimary)" }}>
                      {c.value}
                    </a>
                    <Text mt={1} fontSize="sm" color="textSecondary">
                      {c.note}
                    </Text>
                  </Box>
                ))}

                <Box mt={2} p={5} bg="bgCard" borderRadius="soft" borderWidth="1px" borderColor="goldDark">
                  <Text fontSize="xs" color="gold" fontWeight="600" letterSpacing="0.06em" textTransform="uppercase">
                    Headquarters
                  </Text>
                  <Text mt={1} color="textPrimary" fontWeight="600">
                    DChessAcademy · Cameroon Chapter
                  </Text>
                  <Text mt={1} color="textSecondary" fontSize="sm">
                    Yaoundé · Douala · Buea (regional hubs)
                  </Text>
                  <HStack mt={3} gap={2}>
                    <Box w="14px" h="3px" bg="cameroonGreen" borderRadius="full" />
                    <Box w="14px" h="3px" bg="cameroonRed" borderRadius="full" />
                    <Box w="14px" h="3px" bg="cameroonYellow" borderRadius="full" />
                    <Text ml={2} fontSize="xs" color="textMuted">
                      Founding chapter — Cameroon
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
            >
              <Box
                as="form"
                onSubmit={handleSubmit}
                p={6}
                bg="bgCard"
                borderRadius="soft"
                borderWidth="1px"
                borderColor="goldDark"
              >
                <Heading
                  size="md"
                  color="textPrimary"
                  fontFamily="var(--font-playfair), Georgia, serif"
                  fontWeight="600"
                  mb={4}
                >
                  Send a message
                </Heading>
                <VStack align="stretch" gap={3}>
                  <Box>
                    <Text fontSize="xs" color="textMuted" mb={1}>
                      Your name
                    </Text>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      bg="bgDark"
                      borderColor="whiteAlpha.200"
                      color="textPrimary"
                      _placeholder={{ color: "textMuted" }}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="textMuted" mb={1}>
                      Email
                    </Text>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      bg="bgDark"
                      borderColor="whiteAlpha.200"
                      color="textPrimary"
                      _placeholder={{ color: "textMuted" }}
                      required
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="textMuted" mb={1}>
                      Topic
                    </Text>
                    <HStack gap={2} flexWrap="wrap">
                      {["General", "Tournaments", "Coaching", "Partnerships", "Press"].map((t) => (
                        <Button
                          key={t}
                          size="sm"
                          type="button"
                          variant={topic === t ? "solid" : "outline"}
                          bg={topic === t ? "gold" : "transparent"}
                          color={topic === t ? "bgDark" : "textSecondary"}
                          borderColor="goldDark"
                          borderRadius="soft"
                          onClick={() => setTopic(t)}
                        >
                          {t}
                        </Button>
                      ))}
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="textMuted" mb={1}>
                      Message
                    </Text>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can help."
                      rows={6}
                      bg="bgDark"
                      borderColor="whiteAlpha.200"
                      color="textPrimary"
                      _placeholder={{ color: "textMuted" }}
                      required
                    />
                  </Box>
                  <Button
                    type="submit"
                    size="md"
                    bg="gold"
                    color="bgDark"
                    borderRadius="soft"
                    _hover={{ bg: "goldLight" }}
                    loading={submitting}
                  >
                    Send message
                  </Button>
                  <Text fontSize="xs" color="textMuted">
                    We typically reply within 1–2 business days.
                  </Text>
                </VStack>
              </Box>
            </motion.div>
          </SimpleGrid>
        </Container>
      </Box>
      <LandingFooter />
    </Box>
  );
}
