import { useCallback } from "react";
import { useSnackbar } from "notistack";
import type { SnackbarType } from "./SnackbarContext";

const SNACKBAR_DURATION = 3000;

export function useSnackbarContext() {
  const { enqueueSnackbar } = useSnackbar();

  const showSnackbar = useCallback(
    (type: SnackbarType, message: string, autoDismiss: boolean = true) => {
      enqueueSnackbar(message, {
        variant: type,
        autoHideDuration: autoDismiss !== false ? SNACKBAR_DURATION : undefined,
      });
    },
    [enqueueSnackbar],
  );

  return { showSnackbar };
}
