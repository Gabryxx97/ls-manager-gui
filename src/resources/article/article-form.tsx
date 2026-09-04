import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { maxLength, required, TextInput } from "react-admin";

export const ArticleForm = () => (
  <Box sx={{ width: "100%", maxWidth: 960 }}>
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextInput
          source="name"
          label="Nome"
          validate={[required("Il nome è obbligatorio"), maxLength(255)]}
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <TextInput
          source="description"
          label="Descrizione"
          multiline
          minRows={5}
          fullWidth
        />
      </Grid>
    </Grid>
  </Box>
);
