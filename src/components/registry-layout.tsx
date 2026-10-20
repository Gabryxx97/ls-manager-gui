import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Card, CardActionArea, CardContent, IconButton, Paper, Stack, Typography } from "@mui/material";
import { ReactNode, useId } from "react";
import { useRedirect, useResourceContext } from "react-admin";
import { Link } from "react-router-dom";

export const RegistryCard = ({ children, editPath, label }: {
  children: ReactNode;
  editPath?: string;
  label: string;
}) => (
  <Card component="article" sx={{ overflow: "hidden" }}>
    {editPath ? (
      <CardActionArea component={Link} to={editPath} aria-label={label}>
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>{children}</CardContent>
      </CardActionArea>
    ) : (
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>{children}</CardContent>
    )}
  </Card>
);

export const RegistryFormLayout = ({ title, description, children }: {
  title: ReactNode;
  description: string;
  children: ReactNode;
}) => {
  const redirect = useRedirect();
  const resource = useResourceContext();
  return (
    <Box sx={{ width: "100%", maxWidth: 960, mx: "auto", pb: { xs: 10, sm: 2 } }}>
      <Stack component="header" direction="row" spacing={1} sx={{ alignItems: "flex-start", mb: 2.5 }}>
        <IconButton aria-label="Annulla e torna all’elenco" onClick={() => redirect("list", resource)}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ minWidth: 0, pt: 0.5 }}>
          <Typography component="h1" variant="h2" sx={{ overflowWrap: "anywhere" }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography>
        </Box>
      </Stack>
      <Stack spacing={2.5}>{children}</Stack>
    </Box>
  );
};

export const RegistryFormSection = ({ title, children }: { title: string; children: ReactNode }) => {
  const id = useId();
  return (
    <Paper component="section" variant="outlined" aria-labelledby={id} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Typography id={id} component="h2" variant="h3" sx={{ mb: 2 }}>{title}</Typography>
      {children}
    </Paper>
  );
};
