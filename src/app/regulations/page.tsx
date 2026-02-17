import { Box, Container, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function RegulationsPage() {
  return (
    <Box minH="100vh" bg="bgDark" py={16}>
      <Container maxW="2xl">
        <Heading
          size="xl"
          fontFamily="var(--font-playfair), Georgia, serif"
          color="gold"
          mb={4}
        >
          Regulations
        </Heading>
        <Text color="textSecondary" mb={6}>
          Official academy regulations and competition rules will be published here.
        </Text>
        <Link href="/" style={{ color: "var(--chakra-colors-gold)", fontSize: "14px" }}>
          ← Back to home
        </Link>
      </Container>
    </Box>
  );
}
