"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Heading, Text, VStack, Button, Input, SimpleGrid, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { toaster } from "@/lib/toaster";
import { useAuth } from "@/lib/auth";
import {
  CREATE_TOURNAMENT,
  JOIN_TOURNAMENT,
} from "@/graphql/mutations/tournaments";

const TOURNAMENTS = gql`
  query TournamentsList($status: TournamentStatus) {
    tournaments(status: $status) {
      id
      name
      status
      startDate
      endDate
      school {
        id
        name
        region
      }
      participants {
        id
        score
        user {
          id
          username
          rating
        }
      }
    }
  }
`;

const SCHOOLS = gql`
  query TournamentsSchools {
    schools {
      id
      name
      region
    }
  }
`;

interface TournamentItem {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  school: { id: string; name: string; region: string };
  participants: Array<{ user: { id: string; username: string; rating: number } }>;
}

type TabKey = "ongoing" | "upcoming" | "completed";

export default function TournamentsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("ongoing");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: upcoming, refetch: refetchUpcoming } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, { variables: { status: "UPCOMING" } });
  const { data: ongoing } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, { variables: { status: "ONGOING" } });
  const { data: completed } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, { variables: { status: "COMPLETED" } });
  const { data: schoolsData } = useQuery<{ schools: Array<{ id: string; name: string; region: string }> }>(SCHOOLS);
  const [createTournament, { loading: creating }] = useMutation<{ createTournament: { id: string } }>(CREATE_TOURNAMENT);
  const [joinTournament, { loading: joining }] = useMutation<{ joinTournament: { id: string } }>(JOIN_TOURNAMENT);

  const upcomingList = upcoming?.tournaments ?? [];
  const ongoingList = ongoing?.tournaments ?? [];
  const completedList = completed?.tournaments ?? [];
  const schools = schoolsData?.schools ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !schoolId || !startDate) {
      toaster.create({ title: "Name, school and start date are required", type: "error" });
      return;
    }
    try {
      const { data, error } = await createTournament({
        variables: {
          input: {
            name: name.trim(),
            schoolId,
            startDate: new Date(startDate).toISOString(),
            ...(endDate ? { endDate: new Date(endDate).toISOString() } : {}),
          },
        },
      });
      if (error) {
        toaster.create({ title: error.message || "Failed to create tournament", type: "error" });
        return;
      }
      if (data?.createTournament?.id) {
        toaster.create({ title: "Tournament created", type: "success" });
        setShowCreate(false);
        setName("");
        setSchoolId("");
        setStartDate("");
        setEndDate("");
        router.push(`/tournaments/${data.createTournament.id}`);
      }
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Failed to create tournament", type: "error" });
    }
  }

  async function handleJoin(tournamentId: string) {
    try {
      const { data, error } = await joinTournament({ variables: { tournamentId } });
      if (error) {
        toaster.create({ title: error.message || "Failed to join", type: "error" });
        return;
      }
      if (data?.joinTournament) {
        toaster.create({ title: "Joined tournament", type: "success" });
        refetchUpcoming();
      }
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Failed to join", type: "error" });
    }
  }

  return (
    <VStack align="stretch" gap={8}>
      <Heading size="xl" color="gold" fontFamily="var(--font-playfair), Georgia, serif">
        Tournaments
      </Heading>

      {(isAdmin || user?.role === "COACH" || user?.role === "SCHOOL_ADMIN" || user?.role === "REGIONAL_ADMIN") && (
        <Box
          p={6}
          borderRadius="soft"
          bg="bgCard"
          borderWidth="1px"
          borderColor="goldDark"
        >
          {!showCreate ? (
            <Button size="sm" bg="gold" color="black" borderRadius="soft" onClick={() => setShowCreate(true)} _hover={{ bg: "goldLight" }}>
              Create tournament
            </Button>
          ) : (
            <Box as="form" onSubmit={handleCreate}>
              <Heading size="md" color="gold" mb={4}>
                New tournament
              </Heading>
              <VStack align="stretch" gap={3}>
                <Box>
                  <Text color="whiteAlpha.900" mb={1} fontSize="sm">Name</Text>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tournament name" bg="bgCard" borderColor="goldDark" color="textPrimary" borderRadius="soft" />
                </Box>
                <Box>
                  <Text color="whiteAlpha.900" mb={1} fontSize="sm">School</Text>
                  <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      backgroundColor: "var(--chakra-colors-bgCard)",
                      border: "1px solid var(--chakra-colors-goldDark)",
                      color: "var(--chakra-colors-textPrimary)",
                    }}
                  >
                    <option value="">Select school</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} · {s.region}</option>
                    ))}
                  </select>
                </Box>
                <Box>
                  <Text color="whiteAlpha.900" mb={1} fontSize="sm">Start date</Text>
                  <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} bg="bgCard" borderColor="goldDark" color="textPrimary" borderRadius="soft" />
                </Box>
                <Box>
                  <Text color="whiteAlpha.900" mb={1} fontSize="sm">End date (optional)</Text>
                  <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} bg="bgCard" borderColor="goldDark" color="textPrimary" borderRadius="soft" />
                </Box>
                <Box display="flex" gap={2}>
                  <Button type="submit" size="sm" bg="gold" color="black" borderRadius="soft" loading={creating} _hover={{ bg: "goldLight" }}>
                    Create
                  </Button>
                  <Button type="button" size="sm" variant="outline" color="gold" borderColor="gold" borderRadius="soft" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                </Box>
              </VStack>
            </Box>
          )}
        </Box>
      )}

      <Box>
        <HStack gap={2} mb={6}>
          {(["ongoing", "upcoming", "completed"] as TabKey[]).map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={tab === activeTab ? "solid" : "outline"}
              bg={tab === activeTab ? "gold" : "transparent"}
              color={tab === activeTab ? "black" : "gold"}
              borderColor="gold"
              borderRadius="soft"
              onClick={() => setActiveTab(tab)}
            >
              {tab === "ongoing" ? "Live" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </HStack>
        {activeTab === "ongoing" && <TournamentGrid list={ongoingList} />}
        {activeTab === "upcoming" && (
          <TournamentGrid
            list={upcomingList}
            upcoming
            currentUserId={user?.id}
            onJoin={handleJoin}
            joining={joining}
          />
        )}
        {activeTab === "completed" && <TournamentGrid list={completedList} />}
      </Box>
    </VStack>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isLive = status === "ONGOING";
  return (
    <HStack gap={2}>
      {isLive && (
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg="gold"
          style={{ animation: "pulse 1.5s ease-in-out infinite" }}
        />
      )}
      <Text
        color="textSecondary"
        fontSize="xs"
        fontWeight="600"
        textTransform="uppercase"
      >
        {status === "ONGOING" ? "Live" : status === "UPCOMING" ? "Upcoming" : "Completed"}
      </Text>
    </HStack>
  );
}

function TournamentGrid({
  list,
  upcoming,
  currentUserId,
  onJoin,
  joining,
}: {
  list: TournamentItem[];
  upcoming?: boolean;
  currentUserId?: string;
  onJoin?: (id: string) => void;
  joining?: boolean;
}) {
  if (list.length === 0) {
    return <Text color="textMuted">No tournaments in this category.</Text>;
  }
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
      {list.map((t) => {
        const isParticipant = currentUserId && t.participants?.some((p) => p.user?.id === currentUserId);
        const initial = t.school.name?.charAt(0)?.toUpperCase() ?? "?";
        return (
          <Box
            key={t.id}
            p={5}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="goldDark"
            boxShadow="var(--shadow-card-soft)"
            _hover={{ borderColor: "gold", boxShadow: "var(--shadow-card-soft-hover)" }}
            transition="all 0.2s"
            display="flex"
            flexDir="column"
            gap={3}
          >
            <HStack justify="space-between" align="flex-start">
              <Box
                w="40px"
                h="40px"
                borderRadius="soft"
                bg="goldDark"
                color="gold"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                fontSize="sm"
              >
                {initial}
              </Box>
              <StatusBadge status={t.status} />
            </HStack>
            <Link href={`/tournaments/${t.id}`}>
              <Text color="gold" fontWeight="bold" fontSize="lg" _hover={{ textDecoration: "underline" }}>
                {t.name}
              </Text>
              <Text color="textSecondary" fontSize="sm" mt={1}>
                {t.school.name} · {t.participants.length} participants
              </Text>
              <Text color="textMuted" fontSize="xs" mt={1}>
                {new Date(t.startDate).toLocaleDateString()}
              </Text>
            </Link>
            {upcoming && currentUserId && !isParticipant && onJoin && (
              <Button
                size="sm"
                variant="outline"
                color="gold"
                borderColor="gold"
                borderRadius="soft"
                alignSelf="flex-start"
                loading={joining}
                onClick={(e) => {
                  e.preventDefault();
                  onJoin(t.id);
                }}
              >
                Register
              </Button>
            )}
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
