import { forwardRef } from "react";
import { Alert } from "@mui/material";
import { SnackbarProvider } from "notistack";

export type SnackbarType = "info" | "warning" | "error" | "success";

export interface SnackbarContextValue {
  showSnackbar: (
    type: SnackbarType,
    message: string,
    autoDismiss?: boolean,
  ) => void;
}

const AlertSnackbar = forwardRef<
  HTMLDivElement,
  { message?: string; variant?: SnackbarType; style?: React.CSSProperties }
>(function AlertSnackbar({ message, variant = "info", style, ...rest }, ref) {
  return (
    <Alert
      ref={ref}
      severity={variant}
      sx={{ width: "100%" }}
      style={style}
      {...rest}
    >
      {message}
    </Alert>
  );
});

export function SnackbarProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      Components={{
        default: AlertSnackbar,
        info: AlertSnackbar,
        success: AlertSnackbar,
        warning: AlertSnackbar,
        error: AlertSnackbar,
      }}
    >
      {children}
    </SnackbarProvider>
  );
}
