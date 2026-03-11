"use client";

import { Box, Container, Text } from "@chakra-ui/react";
import { LandingNav } from "@/components/home/LandingNav";
import { LandingFooter } from "@/components/home/LandingFooter";
import { PageHeader } from "@/components/common/PageHeader";

export default function RegulationsPage() {
  return (
    <Box minH="100vh" bg="bgDark" color="white" display="flex" flexDir="column">
      <LandingNav />
      <Box flex={1} py={{ base: 8, md: 12 }}>
        <Container maxW="2xl" px={{ base: 4, md: 6 }}>
          <PageHeader
            label="Official standards"
            title="Regulations"
            subtitle="Academy regulations and competition rules."
          />
          <Box
            p={6}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="goldDark"
          >
            <Text color="textSecondary" lineHeight="1.7">
              Official academy regulations and competition rules will be published here.
            </Text>
          </Box>
        </Container>
      </Box>
      <LandingFooter />
    </Box>
  );
}
