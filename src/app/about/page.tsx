import type { Metadata } from "next";
import { Box, Container, Heading, Text, VStack, List, ListItem } from "@chakra-ui/react";
import { LandingNav } from "@/components/home/LandingNav";
import { LandingFooter } from "@/components/home/LandingFooter";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "DChessAcademy (Chess Group Cameroon) uses the philosophy of chess for intellectual development, ethical leadership, and community building. Founded by Desmond. Discipline. Strategy. Excellence.",
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://cameroonchessacademy.com";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "DChessAcademy – Chess Group Cameroon",
  alternateName: ["Cameroon Chess Academy", "CCA", "DChessAcademy Cameroon"],
  url: siteUrl,
  description:
    "We promote the philosophy of chess as a tool for intellectual development, ethical leadership, strategic thinking, social empowerment, and lifelong learning.",
  foundingDate: "2024",
  areaServed: { "@type": "Country", name: "Cameroon" },
};

export default function AboutPage() {
  return (
    <Box minH="100vh" bg="bgDark" color="white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <LandingNav />
      <Container maxW="3xl" py={{ base: 8, md: 12 }} px={4}>
        <VStack align="stretch" gap={10} textAlign="left">
          <VStack align="stretch" gap={2}>
            <Heading
              size="2xl"
              fontFamily="var(--font-playfair), Georgia, serif"
              color="gold"
              letterSpacing="0.02em"
            >
              About Us
            </Heading>
            <Text color="gold" fontSize="md" fontWeight="600" letterSpacing="0.04em">
              Discipline. Strategy. Excellence.
            </Text>
            <Text color="textMuted" fontSize="sm" fontStyle="italic">
              Chess as life. Think. Lead.
            </Text>
          </VStack>

          <Section title="Background">
            <Text color="textSecondary">
              Chess is more than a game. It is a reflection of human thought, discipline, planning, creativity, and
              resilience. For centuries, chess has been used as a tool to develop the mind and character. In many
              communities, especially in Africa, chess is often seen only as a competitive sport, rather than as a
              philosophy and a tool for personal and social development.
            </Text>
            <Text color="textSecondary" mt={4}>
              DChessAcademy was founded to redefine chess as a way of thinking and living, not just as a game. The
              organization seeks to promote the philosophy of chess as a foundation for education, leadership,
              innovation, and community development. Originally established as <strong>Chess Group Cameroon</strong>,
              the initiative now aims to expand globally under the name <strong>DChessAcademy</strong>, reflecting its
              broader vision and international mission. Cameroon Chess Academy is the founding chapter.
            </Text>
          </Section>

          <Section title='Meaning of "DChessAcademy"'>
            <Text color="textSecondary" mb={3}>
              The letter &ldquo;D&rdquo; has multiple meanings:
            </Text>
            <List spacing={2} color="textSecondary">
              <ListItem><strong>Desmond</strong> – Honoring the founder and visionary behind the organization.</ListItem>
              <ListItem>
                <strong>Dynamic Countries</strong> – Representing national chapters such as DChessAcademy Cameroon,
                DChessAcademy Nigeria, DChessAcademy USA, DChessAcademy Ghana, DChessAcademy UK, and others.
              </ListItem>
              <ListItem>
                <strong>&ldquo;The&rdquo; Chess Academy</strong> – Symbolizing excellence, leadership, and global
                standards in chess philosophy and education.
              </ListItem>
            </List>
            <Text color="textSecondary" mt={4}>
              This structure supports the organization&apos;s goal of becoming a unified global network while allowing
              strong local identities.
            </Text>
          </Section>

          <Section title="Vision">
            <Text color="textSecondary">
              To become a leading global institution that uses the philosophy of chess to develop intelligent,
              disciplined, creative, and socially responsible individuals.
            </Text>
          </Section>

          <Section title="Mission">
            <Text color="textSecondary" mb={3}>
              To promote the philosophy of chess as a tool for:
            </Text>
            <List spacing={2} color="textSecondary">
              <ListItem>Intellectual development</ListItem>
              <ListItem>Ethical leadership</ListItem>
              <ListItem>Strategic thinking</ListItem>
              <ListItem>Social empowerment</ListItem>
              <ListItem>Lifelong learning</ListItem>
            </List>
            <Text color="textSecondary" mt={4}>
              Through education, mentorship, research, and community programs.
            </Text>
          </Section>

          <Section title="Core Philosophy">
            <Text color="textSecondary" mb={3}>
              DChessAcademy is built on the belief that chess represents life itself. Its philosophy includes:
            </Text>
            <List spacing={2} color="textSecondary">
              <ListItem><strong>Responsibility</strong> – Every move has consequences.</ListItem>
              <ListItem><strong>Strategy</strong> – Long-term vision is essential for success.</ListItem>
              <ListItem><strong>Adaptability</strong> – Change is constant; flexibility is key.</ListItem>
              <ListItem><strong>Discipline</strong> – Growth requires commitment and practice.</ListItem>
              <ListItem><strong>Creativity</strong> – Freedom exists within structure.</ListItem>
              <ListItem><strong>Resilience</strong> – Failure is a lesson, not an end.</ListItem>
            </List>
          </Section>

          <Section title="Objectives">
            <List spacing={2} color="textSecondary">
              <ListItem>To promote chess philosophy as a life skill.</ListItem>
              <ListItem>To train young people in critical thinking and leadership.</ListItem>
              <ListItem>To establish chess and life-skills academies in different countries.</ListItem>
              <ListItem>To support research and innovation in chess education.</ListItem>
              <ListItem>To create platforms for mentorship and personal development.</ListItem>
              <ListItem>To use chess as a tool for social change and community building.</ListItem>
              <ListItem>To expand DChessAcademy into education, technology, entrepreneurship, and arts.</ListItem>
            </List>
          </Section>

          <Section title="Key Areas of Activity">
            <VStack align="stretch" gap={4}>
              <Block title="1. Chess Philosophy Education">
                Workshops and seminars · Online courses · Publications and research · Public lectures
              </Block>
              <Block title="2. Youth Development Programs">
                School chess clubs · Leadership camps · Mentorship programs · Talent development
              </Block>
              <Block title="3. Community Engagement">
                Community tournaments · Outreach programs · Inclusion projects · Awareness campaigns
              </Block>
              <Block title="4. Academic and Professional Development">
                Scholarships · Study groups · Career guidance · Soft skills training
              </Block>
              <Block title="5. Digital Platform">
                DChessAcademy website and learning portal · Mobile learning tools · Online competitions · Global
                networking platform
              </Block>
            </VStack>
          </Section>

          <Section title="Target Beneficiaries">
            <Text color="textSecondary">
              Children and youth · Students · Teachers and coaches · Community leaders · Entrepreneurs ·
              Educational institutions · Underserved communities
            </Text>
          </Section>

          <Section title="Organizational Structure">
            <Text color="textSecondary">
              DChessAcademy operates through a Global Headquarters, National Chapters (e.g. DChessAcademy Cameroon,
              Nigeria, USA), Regional Coordinators, and Local Clubs and Partners. Each chapter follows the central
              philosophy and standards while adapting to local needs.
            </Text>
          </Section>

          <Section title="Conclusion">
            <Text color="textSecondary">
              DChessAcademy is more than a chess organization. It is a movement dedicated to shaping minds and building
              futures through the philosophy of chess. Founded by Desmond and rooted in Cameroon, the organization aims
              to grow into a global institution that empowers individuals and communities worldwide. Through
              discipline, strategy, creativity, and responsibility, DChessAcademy will produce leaders for tomorrow.
            </Text>
          </Section>
        </VStack>
      </Container>
      <LandingFooter />
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <VStack align="stretch" gap={3}>
      <Heading
        size="md"
        fontFamily="var(--font-playfair), Georgia, serif"
        color="gold"
        letterSpacing="0.02em"
        borderBottomWidth="1px"
        borderColor="goldDark"
        pb={2}
      >
        {title}
      </Heading>
      {children}
    </VStack>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text color="gold" fontSize="sm" fontWeight="600" mb={1}>
        {title}
      </Text>
      <Text color="textSecondary" fontSize="sm">
        {children}
      </Text>
    </Box>
  );
}
