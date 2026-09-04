import { createTheme } from "@mui/material/styles";

export const lsManagerTheme = createTheme({
  palette: {
    primary: { main: "#1976D2", dark: "#005DAC", light: "#D4E3FF", contrastText: "#FFFFFF" },
    secondary: { main: "#455A64", contrastText: "#FFFFFF" },
    success: { main: "#00685C" },
    warning: { main: "#A15C00" },
    error: { main: "#BA1A1A" },
    background: { default: "#F5F5F5", paper: "#FFFFFF" },
    text: { primary: "#1A1C1C", secondary: "#414752" },
    divider: "#E0E0E0",
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 1024, lg: 1440, xl: 1920 } },
  shape: { borderRadius: 4 },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.33 },
    h3: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    body2: { fontSize: "0.875rem", lineHeight: 1.43 },
    button: { fontSize: "0.875rem", fontWeight: 600, textTransform: "none" },
    caption: { fontSize: "0.75rem", lineHeight: 1.33, letterSpacing: "0.04em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { minWidth: 320 },
        "*:focus-visible": { outline: "3px solid rgba(25, 118, 210, 0.45)", outlineOffset: 2 },
        "[data-field='id'], .ls-mono": {
          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          fontVariantNumeric: "tabular-nums",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 40,
          borderRadius: 4,
          paddingInline: theme.spacing(2),
          [theme.breakpoints.down("sm")]: { minHeight: 44 },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: { root: ({ theme }) => ({ [theme.breakpoints.down("sm")]: { width: 44, height: 44 } }) },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: "1px solid #E0E0E0", borderRadius: 8 } },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 8 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "8px 16px", borderBottomColor: "#EEEEEE" },
        head: {
          position: "sticky",
          top: 0,
          zIndex: 2,
          backgroundColor: "#F3F3F3",
          color: "#1A1C1C",
          fontSize: "0.8125rem",
          fontWeight: 600,
          lineHeight: 1.4,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": { backgroundColor: "#FAFAFA" },
          "&:hover": { backgroundColor: "#F0F7FF !important" },
        },
      },
    },
    MuiTextField: { defaultProps: { variant: "outlined", size: "small" } },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: { root: { borderRadius: 999, fontWeight: 600 } },
    },
    MuiDialogActions: {
      styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(2), gap: theme.spacing(1) }) },
    },
    MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 4 } } },
    RaLayout: {
      styleOverrides: {
        root: ({ theme }) => ({
          minWidth: 320,
          [`& .RaLayout-appFrame`]: { marginTop: theme.spacing(8) },
          [`& .RaLayout-content`]: {
            minWidth: 0,
            padding: theme.spacing(3),
            [theme.breakpoints.down("md")]: { padding: theme.spacing(2) },
            [theme.breakpoints.down("sm")]: { padding: theme.spacing(2), paddingBottom: theme.spacing(11) },
          },
        }),
      },
    },
    RaAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: theme.spacing(8),
          backgroundColor: "#FFFFFF",
          color: "#1A1C1C",
          borderBottom: "1px solid #E0E0E0",
          boxShadow: "none",
          [`& .RaAppBar-toolbar`]: { minHeight: theme.spacing(8), paddingInline: theme.spacing(2) },
          [theme.breakpoints.down("sm")]: { [`& .RaAppBar-menuButton`]: { display: "none" } },
        }),
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 48,
          margin: theme.spacing(0.5, 1),
          paddingLeft: theme.spacing(2),
          borderLeft: "4px solid transparent",
          borderRadius: 4,
          color: "#414752",
          "&.RaMenuItemLink-active": {
            borderLeftColor: theme.palette.primary.main,
            backgroundColor: "rgba(25, 118, 210, 0.10)",
            color: theme.palette.primary.dark,
          },
        }),
      },
    },
    RaDatagrid: {
      styleOverrides: {
        root: {
          border: "1px solid #E0E0E0",
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          boxShadow: "none",
        },
        tableWrapper: { maxHeight: "calc(100vh - 250px)", overflow: "auto" },
        rowCell: { height: 48 },
      },
    },
    RaSimpleList: { styleOverrides: { root: { backgroundColor: "transparent", padding: 0 } } },
  },
});
