"use client";

import {
  createToaster,
  Toaster as ChakraToaster,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastCloseTrigger,
  ToastIndicator,
  Box,
  HStack,
} from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
});

/** Ark/Chakra ToastTitle only wires a11y props — body text must be passed as children. */
export function Toaster() {
  return (
    <ChakraToaster toaster={toaster}>
      {(t) => (
        <ToastRoot maxW={{ base: "calc(100vw - 1.5rem)", md: "420px" }} minW={{ md: "260px" }}>
          <HStack align="flex-start" gap={3} flex={1} minW={0}>
            {t.type === "info" || t.type === "loading" ? (
              <Box
                as="span"
                flexShrink={0}
                mt={0.5}
                boxSize={5}
                borderRadius="full"
                borderWidth="2px"
                borderColor="currentColor"
                opacity={0.85}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="10px"
                fontWeight="bold"
                aria-hidden
              >
                i
              </Box>
            ) : (
              <ToastIndicator mt={0.5} />
            )}
            <Box flex={1} minW={0} pe={8}>
              {t.title != null && String(t.title).length > 0 && <ToastTitle>{t.title}</ToastTitle>}
              {t.description != null && String(t.description).length > 0 && (
                <ToastDescription>{t.description}</ToastDescription>
              )}
            </Box>
          </HStack>
          <ToastCloseTrigger />
        </ToastRoot>
      )}
    </ChakraToaster>
  );
}
