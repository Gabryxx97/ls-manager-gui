import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import { CreateButton } from "react-admin";

interface CustomEmptyProps {
  resourceName: string;
  resourceGen: string;
  isCreate?: boolean;
}

export const CustomEmpty = ({
  resourceName,
  resourceGen,
  isCreate,
}: CustomEmptyProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: 280,
        px: 2,
        py: 4,
        textAlign: "center",
        bgcolor: "background.paper",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <InboxIcon sx={{ fontSize: 64, mb: 2 }} color="action" aria-hidden="true" />
      <Typography component="p" variant="h2" sx={{ mb: 1 }}>
        {resourceGen === "m"
          ? `Nessun ${resourceName}`
          : `Nessuna ${resourceName}`}
      </Typography>
      {isCreate && (
        <>
          <Typography component="p" variant="body1" sx={{ mb: 2 }}>
            {resourceGen === "m"
              ? "Vuoi aggiungerne uno?"
              : "Vuoi aggiungerne una?"}
          </Typography>
          <CreateButton variant="contained" label="Crea" />
        </>
      )}
    </Box>
  );
};
