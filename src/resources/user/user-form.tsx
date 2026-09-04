import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { maxLength, required, SelectInput, TextInput } from "react-admin";
import { roles } from "../../constant";

type UserFormProps = {
  isEdit?: boolean;
};

export const UsersForm = ({ isEdit = false }: UserFormProps) => (
  <Box sx={{ width: "100%", maxWidth: 960 }}>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextInput
          source="name"
          label="Nome"
          validate={maxLength(128, "Il nome non può superare 128 caratteri")}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextInput
          source="surname"
          label="Cognome"
          validate={maxLength(128, "Il cognome non può superare 128 caratteri")}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 8 }}>
        <TextInput
          source="username"
          label="Username"
          autoComplete="username"
          validate={[
            required("Lo username è obbligatorio"),
            maxLength(128, "Lo username non può superare 128 caratteri"),
          ]}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <SelectInput
          source="role"
          optionText="name"
          optionValue="id"
          label="Ruolo"
          choices={roles}
          validate={required("Il ruolo è obbligatorio")}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextInput
          source="password"
          label={isEdit ? "Nuova password" : "Password"}
          type="password"
          autoComplete="new-password"
          helperText={isEdit ? "Lascia vuoto per mantenere la password attuale" : undefined}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextInput
          source="confirmPassword"
          label={isEdit ? "Conferma nuova password" : "Conferma password"}
          type="password"
          autoComplete="new-password"
          fullWidth
        />
      </Grid>
    </Grid>
  </Box>
);
