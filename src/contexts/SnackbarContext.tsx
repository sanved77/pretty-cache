import { forwardRef } from "react";
import { Alert } from "@mui/material";
import type { CustomContentProps } from "notistack";
import { SnackbarProvider } from "notistack";

export type SnackbarType = "info" | "warning" | "error" | "success";

export interface SnackbarContextValue {
  showSnackbar: (
    type: SnackbarType,
    message: string,
    autoDismiss?: boolean,
  ) => void;
}

function mapNotistackVariantToSeverity(
  variant: CustomContentProps["variant"],
): "success" | "info" | "warning" | "error" {
  if (variant === "default" || variant === undefined) return "info";
  return variant;
}

/** Only pass MUI-safe props — notistack passes many fields that must not reach <Alert /> */
const AlertSnackbar = forwardRef<HTMLDivElement, CustomContentProps>(
  function AlertSnackbar(props, ref) {
    const { message, variant, style, className, id } = props;
    return (
      <Alert
        ref={ref}
        id={id != null ? String(id) : undefined}
        severity={mapNotistackVariantToSeverity(variant)}
        sx={{ width: "100%" }}
        style={style}
        className={className}
      >
        {message}
      </Alert>
    );
  },
);

const snackbarDomRoot =
  typeof document !== "undefined" ? document.body : undefined;

export function SnackbarProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SnackbarProvider
      domRoot={snackbarDomRoot}
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
