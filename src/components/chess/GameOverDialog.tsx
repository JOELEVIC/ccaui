"use client";

import { Box, Dialog, Button, Text, VStack } from "@chakra-ui/react";

export interface GameOverDialogProps {
  open: boolean;
  onDismiss: () => void;
  onAnalyze: () => void;
  onRematch?: () => void;
  resultLabel: string;
  resultDetail?: string;
  canAnalyze: boolean;
}

export function GameOverDialog({
  open,
  onDismiss,
  onAnalyze,
  onRematch,
  resultLabel,
  resultDetail,
  canAnalyze,
}: GameOverDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => {
        if (!d.open) onDismiss();
      }}
    >
      <Dialog.Backdrop bg="blackAlpha.700" />
      <Dialog.Positioner>
        <Dialog.Content position="relative" bg="bgCard" borderWidth="1px" borderColor="goldDark" borderRadius="soft" maxW="sm" mx={4}>
          <Dialog.CloseTrigger asChild>
            <Box
              as="button"
              onClick={onDismiss}
              position="absolute"
              top="12px"
              right="12px"
              w="32px"
              h="32px"
              borderRadius="full"
              bg="whiteAlpha.100"
              color="textSecondary"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="md"
              lineHeight="1"
              transition="all 0.15s"
              _hover={{ color: "gold", bg: "whiteAlpha.200" }}
              aria-label="Close"
              zIndex={2}
            >
              ✕
            </Box>
          </Dialog.CloseTrigger>
          <Dialog.Body pt={6} pb={2}>
            <Dialog.Title>
              <Text color="gold" fontSize="2xl" fontWeight="800" textAlign="center" mb={2}>
                Game over
              </Text>
            </Dialog.Title>
            <Text textAlign="center" fontSize="3xl" fontWeight="800" color="textPrimary" mb={1}>
              {resultLabel}
            </Text>
            {resultDetail && (
              <Text color="textMuted" fontSize="sm" textAlign="center">
                {resultDetail}
              </Text>
            )}
            <Text color="textSecondary" fontSize="sm" textAlign="center" mt={4}>
              Rematch your opponent, run a full engine review of every move, or close to browse the board.
            </Text>
          </Dialog.Body>
          <Dialog.Footer flexDirection="column" gap={2} pb={6} px={6}>
            <VStack width="full" gap={2}>
              {onRematch && (
                <Button
                  width="full"
                  bg="gold"
                  color="bgDark"
                  borderRadius="soft"
                  _hover={{ bg: "goldLight" }}
                  onClick={onRematch}
                >
                  Rematch
                </Button>
              )}
              {canAnalyze && (
                <Button
                  width="full"
                  variant="outline"
                  borderColor="gold"
                  color="gold"
                  borderRadius="soft"
                  _hover={{ bg: "whiteAlpha.50" }}
                  onClick={onAnalyze}
                >
                  Analyze game
                </Button>
              )}
              <Button width="full" variant="ghost" color="textSecondary" borderRadius="soft" onClick={onDismiss}>
                Close
              </Button>
            </VStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
