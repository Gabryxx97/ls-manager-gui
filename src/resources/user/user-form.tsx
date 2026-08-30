import { SelectInput, TextInput } from "react-admin";
import Grid from "@mui/material/Grid";
import { roles } from "../../constant";
import { Box } from "@mui/material";

export const UsersForm = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2}>
        <Grid size={2}>
          <TextInput source="name" label="Nome" />
        </Grid>
        <Grid size={2}>
          <TextInput source="surname" label="Cognome" />
        </Grid>
        <Grid size={4}>
          <TextInput source="username" label="Email" type="email" required />
        </Grid>
        <Grid size={2}>
          <SelectInput
            sx={{ marginTop: 0 }}
            source="role"
            optionText="name"
            optionValue="id"
            label="Ruolo"
            choices={roles}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
};
