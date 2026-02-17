"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Heading, Text, VStack, Button, Input } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { toaster } from "@/lib/toaster";
import { useAuth } from "@/lib/auth";
import { CREATE_SCHOOL } from "@/graphql/mutations/schools";

const SCHOOLS = gql`
  query SchoolsList {
    schools {
      id
      name
      region
      students {
        id
      }
      tournaments {
        id
      }
    }
  }
`;

export default function SchoolsPage() {
  const router = useRouter();
  const { canManageSchools } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");

  const { data, refetch } = useQuery<{ schools: Array<{ id: string; name: string; region: string; students: unknown[]; tournaments: unknown[] }> }>(SCHOOLS);
  const [createSchool, { loading: creating }] = useMutation<{ createSchool: { id: string } }>(CREATE_SCHOOL);

  const schools = data?.schools ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !region.trim()) {
      toaster.create({ title: "Name and region are required", type: "error" });
      return;
    }
    try {
      const { data: mutData, errors } = await createSchool({
        variables: { input: { name: name.trim(), region: region.trim() } },
      });
      if (errors?.length) {
        toaster.create({ title: errors[0]?.message ?? "Failed to create school", type: "error" });
        return;
      }
      if (mutData?.createSchool?.id) {
        toaster.create({ title: "School created", type: "success" });
        setShowCreate(false);
        setName("");
        setRegion("");
        refetch();
        router.push(`/schools/${mutData.createSchool.id}`);
      }
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Failed to create school", type: "error" });
    }
  }

  return (
    <VStack align="stretch" gap={8}>
      <Heading size="xl" color="gold" fontFamily="serif">
        Schools
      </Heading>

      {canManageSchools && (
        <Box
          p={4}
          borderRadius="md"
          bg="bgCard"
          borderWidth="1px"
          borderColor="goldDark"
        >
          {!showCreate ? (
            <Button size="sm" bg="gold" color="black" onClick={() => setShowCreate(true)} _hover={{ bg: "goldLight" }}>
              Create school
            </Button>
          ) : (
            <Box as="form" onSubmit={handleCreate}>
              <Heading size="md" color="goldLight" mb={4}>
                New school
              </Heading>
              <VStack align="stretch" gap={3}>
                <Box>
                  <Text color="whiteAlpha.900" mb={1} fontSize="sm">Name</Text>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="School name" bg="bgDark" borderColor="goldDark" color="white" />
                </Box>
                <Box>
                  <Text color="whiteAlpha.900" mb={1} fontSize="sm">Region</Text>
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" bg="bgDark" borderColor="goldDark" color="white" />
                </Box>
                <Box display="flex" gap={2}>
                  <Button type="submit" size="sm" bg="gold" color="black" loading={creating} _hover={{ bg: "goldLight" }}>
                    Create
                  </Button>
                  <Button type="button" size="sm" variant="outline" color="gold" borderColor="gold" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                </Box>
              </VStack>
            </Box>
          )}
        </Box>
      )}

      {schools.length === 0 ? (
        <Text color="whiteAlpha.700">No schools registered.</Text>
      ) : (
        <VStack align="stretch" gap={3}>
          {schools.map((s: { id: string; name: string; region: string; students: unknown[]; tournaments: unknown[] }) => (
            <Link key={s.id} href={`/schools/${s.id}`}>
              <Box
                p={4}
                borderRadius="md"
                bg="bgCard"
                borderWidth="1px"
                borderColor="goldDark"
                _hover={{ borderColor: "gold" }}
              >
                <Text color="gold" fontWeight="bold">
                  {s.name}
                </Text>
                <Text color="whiteAlpha.700">
                  {s.region} · {s.students.length} students · {s.tournaments.length} tournaments
                </Text>
              </Box>
            </Link>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
