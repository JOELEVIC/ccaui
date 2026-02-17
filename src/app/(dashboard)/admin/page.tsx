"use client";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "@/lib/auth";

const USERS = gql`
  query AdminUsers {
    users {
      id
      username
      email
      role
      rating
      school {
        name
      }
    }
  }
`;

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { data } = useQuery<{ users: Array<{ id: string; username: string; email: string; role: string; rating: number; school?: { name: string } }> }>(USERS);

  if (!isAdmin) {
    return (
      <Box>
        <Heading size="xl" color="gold">
          Admin
        </Heading>
        <Text color="whiteAlpha.700" mt={4}>
          You do not have permission to view this page.
        </Text>
      </Box>
    );
  }

  const users = data?.users ?? [];

  return (
    <VStack align="stretch" gap={8}>
      <Heading size="xl" color="gold" fontFamily="serif">
        Admin
      </Heading>
      <Box>
        <Heading size="md" color="goldLight" mb={4}>
          Users
        </Heading>
        {users.length === 0 ? (
          <Text color="whiteAlpha.700">No users.</Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {users.slice(0, 50).map((u: { id: string; username: string; email: string; role: string; rating: number; school?: { name: string } }) => (
              <Box
                key={u.id}
                p={3}
                borderRadius="md"
                bg="bgCard"
                borderWidth="1px"
                borderColor="goldDark"
                color="whiteAlpha.900"
              >
                {u.username} — {u.email} · {u.role} · {u.rating} ELO
                {u.school && ` · ${u.school.name}`}
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
