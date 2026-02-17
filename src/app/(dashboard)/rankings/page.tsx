"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack, HStack, Button, Input } from "@chakra-ui/react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

const USERS = gql`
  query RankingsUsers($filters: UserFilters) {
    users(filters: $filters) {
      id
      username
      rating
      profile {
        firstName
        lastName
      }
      school {
        id
        name
        region
      }
    }
  }
`;

const SCHOOLS = gql`
  query RankingsSchools {
    schools {
      id
      name
      region
    }
  }
`;

type UserRow = {
  id: string;
  username: string;
  rating: number;
  profile?: { firstName: string; lastName: string };
  school?: { id: string; name: string; region: string };
};

export default function RankingsPage() {
  const [schoolId, setSchoolId] = useState("");
  const [search, setSearch] = useState("");

  const { data: usersData } = useQuery<{ users: UserRow[] }>(USERS, {
    variables: {
      filters: {
        ...(schoolId ? { schoolId } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      },
    },
  });
  const { data: schoolsData } = useQuery<{ schools: Array<{ id: string; name: string; region: string }> }>(SCHOOLS);

  const users = usersData?.users ?? [];
  const schools = schoolsData?.schools ?? [];

  return (
    <VStack align="stretch" gap={8}>
      <Heading
        size="xl"
        color="gold"
        fontFamily="var(--font-playfair), Georgia, serif"
        letterSpacing="0.03em"
        textTransform="uppercase"
      >
        National Rankings
      </Heading>

      <HStack gap={4} flexWrap="wrap">
        <Box>
          <Text color="textMuted" fontSize="xs" mb={1}>
            University / School
          </Text>
          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              backgroundColor: "var(--chakra-colors-bgCard)",
              border: "1px solid var(--chakra-colors-goldDark)",
              color: "var(--chakra-colors-textPrimary)",
              minWidth: 200,
            }}
          >
            <option value="">All</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.region}
              </option>
            ))}
          </select>
        </Box>
        <Box>
          <Text color="textMuted" fontSize="xs" mb={1}>
            Search
          </Text>
          <Input
            placeholder="Player name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="bgCard"
            borderColor="goldDark"
            color="textPrimary"
            maxW="200px"
            borderRadius="cca"
          />
        </Box>
      </HStack>

      <Box
        overflowX="auto"
        borderRadius="cca"
        borderWidth="1px"
        borderColor="goldDark"
        bg="bgCard"
      >
        <Box as="table" w="full" borderCollapse="collapse">
          <thead>
            <Box as="tr" borderBottomWidth="1px" borderColor="goldDark">
              <Box as="th" py={3} px={4} textAlign="left" color="gold" fontSize="xs" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase">
                Rank
              </Box>
              <Box as="th" py={3} px={4} textAlign="left" color="gold" fontSize="xs" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase">
                Player
              </Box>
              <Box as="th" py={3} px={4} textAlign="left" color="gold" fontSize="xs" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase">
                University
              </Box>
              <Box as="th" py={3} px={4} textAlign="right" color="gold" fontSize="xs" fontWeight="600" letterSpacing="0.05em" textTransform="uppercase">
                Rating
              </Box>
            </Box>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <Box
                as="tr"
                key={user.id}
                borderBottomWidth={i < users.length - 1 ? "1px" : 0}
                borderColor="goldDark"
                bg={i < 3 ? "whiteAlpha.03" : "transparent"}
                _hover={{ bg: "whiteAlpha.05" }}
                sx={{
                  "& td": { py: 3, px: 4 },
                }}
              >
                <Box as="td" color="textMuted" fontWeight="bold">
                  #{i + 1}
                </Box>
                <Box as="td" color="textPrimary">
                  {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.username}
                </Box>
                <Box as="td" color="textSecondary" fontSize="sm">
                  {user.school?.name ?? "—"}
                </Box>
                <Box as="td" textAlign="right" color="gold" fontWeight="700">
                  {user.rating}
                </Box>
              </Box>
            ))}
          </tbody>
        </Box>
      </Box>

      {users.length === 0 && (
        <Text color="textMuted">No players found.</Text>
      )}
    </VStack>
  );
}
