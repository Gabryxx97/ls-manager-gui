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
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        width: "100%",
      }}
    >
      <InboxIcon style={{ fontSize: 200 }} color="action" />
      <Typography variant="h4" paragraph>
        {resourceGen === "m"
          ? `Nessun ${resourceName}`
          : `Nessuna ${resourceName}`}
      </Typography>
      {isCreate && (
        <>
          <Typography variant="body1" paragraph>
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
