"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Text, HStack, VStack, Button, Input } from "@chakra-ui/react";

export interface ChatMsg {
  id: number;
  userId: string;
  text: string;
}

/**
 * In-game chat for players and spectators. Messages arrive live over the game
 * subscription; `label` maps a sender's userId to a display name + whether it's
 * the current viewer.
 */
export function GameChat({
  messages,
  label,
  onSend,
}: {
  messages: ChatMsg[];
  label: (userId: string) => { name: string; me: boolean };
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep the newest message in view.
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <Box py={3} px={4} borderRadius="soft" borderWidth="1px" borderColor="goldDark" bg="bgCard">
      <Text color="gold" fontSize="xs" fontWeight="600" mb={2}>
        Chat
      </Text>
      <VStack
        ref={listRef}
        align="stretch"
        gap={1}
        maxH="180px"
        minH="60px"
        overflowY="auto"
        mb={2}
        css={{ scrollbarWidth: "thin" }}
      >
        {messages.length === 0 ? (
          <Text color="textMuted" fontSize="xs">
            No messages yet — say hello 👋
          </Text>
        ) : (
          messages.map((m) => {
            const l = label(m.userId);
            return (
              <Text key={m.id} fontSize="sm" color="textSecondary" wordBreak="break-word">
                <Text as="span" fontWeight="700" color={l.me ? "gold" : "textPrimary"}>
                  {l.name}:
                </Text>{" "}
                {m.text}
              </Text>
            );
          })
        )}
      </VStack>
      <HStack gap={2}>
        <Input
          size="sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Message…"
          maxLength={500}
          bg="bgSurface"
          borderColor="goldDark"
          color="textPrimary"
          borderRadius="soft"
          _placeholder={{ color: "textMuted" }}
        />
        <Button size="sm" bg="gold" color="bgDark" borderRadius="soft" onClick={submit} flexShrink={0}>
          Send
        </Button>
      </HStack>
    </Box>
  );
}
