"use client";

import {
  createToaster,
  Toaster as ChakraToaster,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastCloseTrigger,
} from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
});

export function Toaster() {
  return (
    <ChakraToaster toaster={toaster}>
      {() => (
        <ToastRoot>
          <ToastTitle />
          <ToastDescription />
          <ToastCloseTrigger />
        </ToastRoot>
      )}
    </ChakraToaster>
  );
}
