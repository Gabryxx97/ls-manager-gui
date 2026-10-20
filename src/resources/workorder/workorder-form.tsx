import { Stack } from "@mui/material";
import { RegistryFormSection } from "../../components/registry-layout";
import Grid from "@mui/material/Grid";
import { maxLength, required, TextInput } from "react-admin";

export const WorkOrderForm = () => (
  <Stack spacing={2.5} sx={{ width: "100%" }}>
    <RegistryFormSection title="Dati della commessa">
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextInput
            source="name"
            label="Nome"
            validate={[
              required("Il nome è obbligatorio"),
              maxLength(255, "Il nome non può superare 255 caratteri"),
            ]}
            fullWidth
          />
        </Grid>
      </Grid>
    </RegistryFormSection>
    <RegistryFormSection title="Descrizione">
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextInput source="description" label="Descrizione" multiline minRows={5} fullWidth />
        </Grid>
      </Grid>
    </RegistryFormSection>
  </Stack>
);
