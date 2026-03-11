"use client";

import { Box, Container, Text } from "@chakra-ui/react";
import { LandingNav } from "@/components/home/LandingNav";
import { LandingFooter } from "@/components/home/LandingFooter";
import { PageHeader } from "@/components/common/PageHeader";

export default function ContactPage() {
  return (
    <Box minH="100vh" bg="bgDark" color="white" display="flex" flexDir="column">
      <LandingNav />
      <Box flex={1} py={{ base: 8, md: 12 }}>
        <Container maxW="2xl" px={{ base: 4, md: 6 }}>
          <PageHeader
            label="Get in touch"
            title="Contact"
            subtitle="For institutional inquiries, support, or partnership opportunities."
          />
          <Box
            p={6}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="goldDark"
          >
            <Text color="textSecondary" lineHeight="1.7">
              Contact details will be listed here. For now, reach out through your institution or the academy coordinators.
            </Text>
          </Box>
        </Container>
      </Box>
      <LandingFooter />
    </Box>
  );
}
