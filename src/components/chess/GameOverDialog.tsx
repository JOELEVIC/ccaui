"use client";

import { Dialog, Button, Text, VStack } from "@chakra-ui/react";

export interface GameOverDialogProps {
  open: boolean;
  onDismiss: () => void;
  onReview: () => void;
  resultLabel: string;
  resultDetail?: string;
  hasReviewData: boolean;
}

export function GameOverDialog({
  open,
  onDismiss,
  onReview,
  resultLabel,
  resultDetail,
  hasReviewData,
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
        <Dialog.Content bg="bgCard" borderWidth="1px" borderColor="goldDark" borderRadius="soft" maxW="sm" mx={4}>
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
              Close to browse the board and move list. Review walks through each position and shows the best move for
              the side to play.
            </Text>
          </Dialog.Body>
          <Dialog.Footer flexDirection="column" gap={2} pb={6} px={6}>
            <VStack width="full" gap={2}>
              {hasReviewData && (
                <Button
                  width="full"
                  bg="gold"
                  color="bgDark"
                  borderRadius="soft"
                  _hover={{ bg: "goldLight" }}
                  onClick={() => {
                    onReview();
                  }}
                >
                  Review moves
                </Button>
              )}
              <Button width="full" variant="outline" borderColor="gold" color="gold" borderRadius="soft" onClick={onDismiss}>
                Close
              </Button>
            </VStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
