import {
  ArrayInput,
  AutocompleteInput,
  DateInput,
  FormDataConsumer,
  maxLength,
  minValue,
  NumberInput,
  ReferenceInput,
  required,
  SelectInput,
  SimpleFormIterator,
  TextInput,
} from "react-admin";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { OrderFormData } from "./order-form-utils";

const statusChoices = [
  { id: "DRAFT", name: "Bozza" },
  { id: "PROCESSING", name: "In lavorazione" },
  { id: "COMPLETED", name: "Completato" },
  { id: "SHIPPED", name: "Spedito" },
];

const priorityChoices = [
  { id: "LOW", name: "Bassa" },
  { id: "STANDARD", name: "Standard" },
  { id: "HIGH", name: "Alta" },
];

export const OrderForm = () => (
  <Stack spacing={3} sx={{ width: "100%", maxWidth: 960 }}>
    <Paper component="section" aria-labelledby="order-header-title" sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography id="order-header-title" component="h2" variant="h3" sx={{ mb: 2 }}>
        Dati ordine
      </Typography>
      <Stack spacing={2}>
        <TextInput
          source="name"
          label="Nome"
          validate={[
            required("Il nome è obbligatorio"),
            maxLength(255, "Il nome non può superare 255 caratteri"),
          ]}
          fullWidth
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <DateInput
            source="date"
            label="Data"
            validate={required("La data è obbligatoria")}
            fullWidth
          />
          <SelectInput
            source="priority"
            label="Priorità"
            choices={priorityChoices}
            validate={required("La priorità è obbligatoria")}
            fullWidth
          />
          <SelectInput
            source="status"
            label="Stato"
            choices={statusChoices}
            validate={required("Lo stato è obbligatorio")}
            fullWidth
          />
        </Stack>
      </Stack>
    </Paper>

    <Paper component="section" aria-labelledby="order-details-title" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mb: 2, justifyContent: "space-between" }}
      >
        <Box>
          <Typography id="order-details-title" component="h2" variant="h3">
            Dettaglio ordine
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Cerca un articolo digitando almeno due caratteri, poi indica la quantità.
          </Typography>
        </Box>
        <FormDataConsumer<OrderFormData>>
          {({ formData }) => {
            const details = formData.details ?? [];
            const selected = details.filter((detail) => detail?.articleId != null).length;
            const total = details.reduce(
              (sum, detail) => sum + (Number(detail?.quantity) > 0 ? Number(detail.quantity) : 0),
              0,
            );
            return (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
                <Typography variant="body2">
                  <strong>{selected}</strong> {selected === 1 ? "articolo" : "articoli"}
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2">
                  Quantità totale: <strong>{total}</strong>
                </Typography>
              </Stack>
            );
          }}
        </FormDataConsumer>
      </Stack>
      <ArrayInput
        source="details"
        label="Righe ordine"
        validate={required("L'ordine deve contenere almeno una riga")}
        fullWidth
      >
        <SimpleFormIterator
          inline
          disableReordering
          fullWidth
          getItemLabel={(index) => `Riga ${index + 1}`}
          sx={{
            "& .RaSimpleFormIterator-inline": {
              width: "100%",
              alignItems: "flex-start",
              "& > .ra-input": { flex: 1 },
            },
            "& .RaSimpleFormIterator-action": { flexShrink: 0 },
            "@media (max-width: 599px)": {
              "& .RaSimpleFormIterator-inline": { flexDirection: "column" },
              "& .RaSimpleFormIterator-inline > .ra-input": { width: "100%" },
              "& .RaSimpleFormIterator-action": { alignSelf: "flex-end" },
            },
          }}
        >
          <ReferenceInput
            source="articleId"
            reference="articles"
            perPage={10}
            sort={{ field: "name", order: "ASC" }}
            enableGetChoices={(filters) =>
              typeof filters.search === "string" && filters.search.trim().length >= 2
            }
          >
            <AutocompleteInput
              label="Articolo"
              optionText="name"
              validate={required("L'articolo è obbligatorio")}
              filterToQuery={(searchText) => ({ search: searchText })}
              helperText="Digita almeno due caratteri"
              noOptionsText="Nessun articolo trovato"
            />
          </ReferenceInput>
          <NumberInput
            source="quantity"
            label="Quantità"
            min={1}
            step={1}
            validate={[
              required("La quantità è obbligatoria"),
              minValue(1, "La quantità deve essere maggiore di zero"),
            ]}
          />
        </SimpleFormIterator>
      </ArrayInput>
    </Paper>
  </Stack>
);
