import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { maxLength, minValue, number, required, NumberInput, TextInput } from "react-admin";

export const ArticleForm = () => (
  <Box sx={{ width: "100%", maxWidth: 960 }}>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextInput
          source="sku"
          label="SKU"
          validate={[required("Lo SKU è obbligatorio"), maxLength(64)]}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <NumberInput
          source="unitPrice"
          label="Prezzo unitario (€)"
          validate={[number(), minValue(0, "Il prezzo non può essere negativo")]}
          min={0}
          step={0.01}
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <TextInput
          source="description"
          label="Descrizione"
          validate={required("La descrizione è obbligatoria")}
          multiline
          minRows={3}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextInput
          source="category"
          label="Categoria"
          validate={maxLength(64)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextInput
          source="costCenter"
          label="Centro di costo"
          validate={maxLength(128)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextInput
          source="unitOfMeasure"
          label="Unità di misura"
          validate={maxLength(16)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextInput
          source="location"
          label="Ubicazione"
          validate={maxLength(255)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <NumberInput
          source="stockQuantity"
          label="Giacenza"
          validate={number()}
          step={0.01}
          fullWidth
        />
      </Grid>
    </Grid>
  </Box>
);
