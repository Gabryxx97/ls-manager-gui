import {
  AutocompleteInput,
  DateInput,
  maxLength,
  ReferenceInput,
  required,
  SelectInput,
  TextInput,
  useGetList,
  useGetMany,
  useRecordContext,
} from "react-admin";
import {
  Box,
  Card,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMemo, useState } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { Article } from "../../types";
import { WarehouseOrder } from "../../types";
import { useRedirect } from "react-admin";
import { OrderFormData } from "./order-form-utils";

const categoryChoices = [
  { id: "HYDRAULIC", name: "Idrico" },
  { id: "ELECTRICAL", name: "Elettrico" },
  { id: "CONSTRUCTION_CARPENTRY", name: "Edile - carpenteria" },
  { id: "HARDWARE_MISC", name: "Ferramenta e varie" },
  { id: "CLOTHING", name: "Vestiario" },
];
const priorityChoices = [
  { id: "LOW", name: "Bassa" },
  { id: "STANDARD", name: "Standard" },
  { id: "HIGH", name: "Alta" },
];

const money = (value: number | string | null | undefined) =>
  value == null ? "—" : `€ ${Number(value).toFixed(2)}`;
const priceOf = (article?: Article) =>
  article?.unitPrice == null ? undefined : Number(article.unitPrice);

const OrderDetailsEditor = () => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { control, setValue } = useFormContext<OrderFormData>();
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "details",
  });
  const watchedDetails = useWatch({ control, name: "details" });
  const details = useMemo(() => watchedDetails ?? [], [watchedDetails]);
  const selectedIds = details
    .map((detail) => detail?.articleId)
    .filter((id): id is number => id != null);
  const { data: selectedArticles = [] } = useGetMany<Article>(
    "articles",
    { ids: selectedIds },
    { enabled: selectedIds.length > 0 },
  );
  const articleById = useMemo(
    () => new Map(selectedArticles.map((article) => [article.id, article])),
    [selectedArticles],
  );
  const rowPrice = (detail: {
    articleId?: number;
    unitPrice?: number | string | null;
  }) =>
    detail.unitPrice == null
      ? priceOf(articleById.get(detail.articleId ?? -1))
      : Number(detail.unitPrice);
  const [query, setQuery] = useState("");
  const { data: searchResults = [], isPending: searching } =
    useGetList<Article>(
      "articles",
      {
        pagination: { page: 1, perPage: 10 },
        sort: { field: "sku", order: "ASC" },
        filter: { search: query },
      },
      { enabled: query.trim().length >= 2 },
    );
  const [sorted, setSorted] = useState(false);
  const rows = useMemo(() => {
    const source = fields.map((field, index) => ({
      field,
      index,
      detail: details[index],
      article: articleById.get(details[index]?.articleId ?? -1),
    }));
    return sorted
      ? [...source].sort((a, b) =>
          (a.article?.sku ?? "").localeCompare(b.article?.sku ?? ""),
        )
      : source;
  }, [articleById, details, fields, sorted]);
  const totalPieces = details.reduce(
    (sum, detail) =>
      sum + (Number(detail?.quantity) > 0 ? Number(detail.quantity) : 0),
    0,
  );
  const total = details.every((detail) => rowPrice(detail) != null)
    ? details.reduce(
        (sum, detail) =>
          sum + (rowPrice(detail) ?? 0) * Number(detail?.quantity ?? 0),
        0,
      )
    : undefined;

  const addArticle = (article: Article) => {
    if (priceOf(article) == null) return;
    const existing = details.findIndex(
      (detail) => detail?.articleId === article.id,
    );
    if (existing >= 0)
      update(existing, {
        ...details[existing],
        quantity: Number(details[existing]?.quantity ?? 0) + 1,
      });
    else
      append({
        articleId: article.id,
        quantity: 1,
        unitPrice: priceOf(article),
      });
    setQuery("");
  };
  const changeQuantity = (index: number, delta: number) => {
    const quantity = Math.max(1, Number(details[index]?.quantity ?? 1) + delta);
    setValue(`details.${index}.quantity`, quantity, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  const searchField = (
    <TextField
      fullWidth
      size="small"
      value={query}
      label="Cerca articolo"
      placeholder="Cerca SKU, raccordo, valvola…"
      onChange={(event) => setQuery(event.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        },
      }}
      helperText={
        query.length > 0 && query.length < 2
          ? "Digita almeno due caratteri"
          : undefined
      }
    />
  );
  const suggestions = query.trim().length >= 2 && (
    <Paper
      variant="outlined"
      sx={{
        position: "absolute",
        zIndex: 3,
        width: "100%",
        mt: 0.5,
        maxHeight: 280,
        overflow: "auto",
      }}
    >
      {searching && (
        <Typography sx={{ p: 1.5 }} color="text.secondary">
          Ricerca…
        </Typography>
      )}
      {!searching && searchResults.length === 0 && (
        <Typography sx={{ p: 1.5 }} color="text.secondary">
          Nessun articolo trovato
        </Typography>
      )}
      {searchResults.map((article) => (
        <Box
          key={article.id}
          component="button"
          type="button"
          disabled={priceOf(article) == null}
          onClick={() => addArticle(article)}
          sx={{
            display: "block",
            width: "100%",
            textAlign: "left",
            border: 0,
            background: "transparent",
            p: 1.5,
            cursor: priceOf(article) == null ? "not-allowed" : "pointer",
            opacity: priceOf(article) == null ? 0.55 : 1,
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <Typography component="span" className="ls-mono" color="primary">
            {article.sku || "SKU legacy"}
          </Typography>
          <Typography component="span" sx={{ display: "block" }}>
            {article.description}
          </Typography>
          <Typography component="span" variant="caption" color="text.secondary">
            {priceOf(article) == null
              ? "Prezzo non disponibile"
              : money(article.unitPrice)} · Giacenza: {article.stockQuantity ?? "—"} {article.unitOfMeasure || ""}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
  const rowContent = (row: (typeof rows)[number]) => {
    const article = row.article;
    const quantity = Number(row.detail?.quantity ?? 1);
    const unitPrice = rowPrice(row.detail ?? {});
    const subtotal = unitPrice == null ? undefined : unitPrice * quantity;
    return mobile ? (
      <Card
        component="article"
        variant="outlined"
        sx={{ p: 2, borderRadius: 2 }}
        key={row.field.id}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="span"
              className="ls-mono"
              variant="caption"
              sx={{
                bgcolor: "primary.light",
                color: "primary.dark",
                px: 0.75,
                py: 0.25,
              }}
            >
              {article?.sku || "—"}
            </Typography>
            <Typography
              component="h3"
              variant="body2"
              sx={{ mt: 0.75, overflowWrap: "anywhere", fontWeight: 600 }}
            >
              {article?.description || row.detail?.articleDescription || "Articolo non disponibile"}
            </Typography>
            <Typography
              variant="caption"
              className="ls-mono"
              color="text.secondary"
            >
              Prezzo unitario: <strong>{money(unitPrice)}</strong>
            </Typography>
          </Box>
          <IconButton
            aria-label={`Rimuovi ${article?.description ?? "articolo"}`}
            onClick={() => remove(row.index)}
            color="inherit"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1.5,
          }}
        >
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              bgcolor: "action.hover",
              borderRadius: 1,
              p: 0.5,
            }}
          >
            <IconButton
              aria-label="Diminuisci quantità"
              onClick={() => changeQuantity(row.index, -1)}
              size="small"
            >
              <RemoveIcon />
            </IconButton>
            <Typography
              className="ls-mono"
              sx={{ width: 40, textAlign: "center" }}
            >
              {quantity}
            </Typography>
            <IconButton
              aria-label="Aumenta quantità"
              onClick={() => changeQuantity(row.index, 1)}
              size="small"
            >
              <AddIcon />
            </IconButton>
          </Stack>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary">
              Subtotale
            </Typography>
            <Typography color="primary" sx={{ fontWeight: 700 }}>
              {money(subtotal)}
            </Typography>
          </Box>
        </Stack>
      </Card>
    ) : (
      <TableRow key={row.field.id}>
        <TableCell className="ls-mono">
          {article?.sku || row.detail?.articleSku || "—"}
        </TableCell>
        <TableCell>{article?.description || row.detail?.articleDescription || "Articolo non disponibile"}</TableCell>
        <TableCell align="right">{money(unitPrice)}</TableCell>
        <TableCell align="right">
          <Controller
            name={`details.${row.index}.quantity`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                size="small"
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                sx={{ width: 92 }}
                onChange={(event) =>
                  field.onChange(Math.max(1, Number(event.target.value)))
                }
              />
            )}
          />
        </TableCell>
        <TableCell align="right">{money(subtotal)}</TableCell>
        <TableCell align="right">
          <IconButton
            aria-label={`Rimuovi ${article?.description ?? "articolo"}`}
            onClick={() => remove(row.index)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };
  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography component="h2" variant="h3">
          {mobile ? "Aggiungi articoli" : "Articoli in ordine"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {details.length} {details.length === 1 ? "articolo" : "articoli"} ·{" "}
          {totalPieces} pezzi
        </Typography>
      </Stack>
      <Box sx={{ position: "relative" }}>
        {searchField}
        {suggestions}
      </Box>
      {mobile ? (
        <Stack spacing={1.5}>
          {rows.length ? (
            rows.map(rowContent)
          ) : (
            <Typography color="text.secondary">
              Cerca e seleziona un articolo per iniziare.
            </Typography>
          )}
        </Stack>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ maxHeight: 480 }}
        >
          <Table stickyHeader size="small" aria-label="Articoli dell'ordine">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Articolo</TableCell>
                <TableCell align="right">Prezzo unitario</TableCell>
                <TableCell align="right">Quantità</TableCell>
                <TableCell align="right">Subtotale</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length ? (
                rows.map(rowContent)
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">
                      Cerca e seleziona un articolo per iniziare.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Stack
        direction="row"
        sx={{ justifyContent: "flex-end", alignItems: "center", gap: 1 }}
      >
        <IconButton
          aria-label="Ordina per SKU"
          onClick={() => setSorted((value) => !value)}
          size="small"
        >
          <SwapVertIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Totale netto: <strong>{money(total)}</strong>
        </Typography>
      </Stack>
    </Stack>
  );
};

export const OrderForm = ({
  mobileHeader = false,
  minimumDate,
}: {
  mobileHeader?: boolean;
  minimumDate?: string;
}) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const redirect = useRedirect();
  const record = useRecordContext<WarehouseOrder>();
  return (
    <Stack spacing={3} sx={{ width: "100%", pb: { xs: 8, sm: 0 } }}>
      {mobileHeader && (
        <Stack
          direction="row"
          sx={{
            display: { xs: "flex", sm: "none" },
            alignItems: "center",
            justifyContent: "space-between",
            py: 0.5,
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <IconButton
              aria-label="Torna indietro"
              onClick={() => redirect("list", "orders")}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography component="h1" variant="h2">
              Nuovo ordine
            </Typography>
            <Typography
              variant="caption"
              sx={{ bgcolor: "action.hover", px: 1, py: 0.5, borderRadius: 2 }}
            >
              In lavorazione
            </Typography>
          </Stack>
          <IconButton
            aria-label="Annulla"
            color="error"
            onClick={() => redirect("list", "orders")}
          >
            <Typography variant="button">Annulla</Typography>
          </IconButton>
        </Stack>
      )}
      <Paper
        component="section"
        aria-labelledby="order-header-title"
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        <Typography
          id="order-header-title"
          component="h2"
          variant="h3"
          sx={{ mb: 2 }}
        >
          Informazioni ordine
        </Typography>
        {record && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Magazziniere assegnato: {record.assignedWarehouseName ?? "Non assegnato"}
          </Typography>
        )}
        <Stack spacing={2}>
          <ReferenceInput
            source="workOrderId"
            reference="workorders"
            perPage={10}
            sort={{ field: "name", order: "ASC" }}
          >
            <AutocompleteInput
              label="Commessa"
              optionText="name"
              validate={required("La commessa è obbligatoria")}
              filterToQuery={(searchText) => ({ search: searchText })}
              noOptionsText="Nessuna commessa trovata"
              fullWidth
            />
          </ReferenceInput>
          <SelectInput
            source="category"
            label="Categoria ordine"
            choices={categoryChoices}
            validate={required("La categoria è obbligatoria")}
            fullWidth
          />
          <TextInput
            source="notes"
            label="Note"
            multiline
            minRows={mobile ? 2 : 3}
            validate={maxLength(
              2000,
              "Le note non possono superare 2.000 caratteri",
            )}
            fullWidth
          />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            <DateInput
              source="date"
              label="Data"
              validate={required("La data è obbligatoria")}
              slotProps={{ htmlInput: minimumDate ? { min: minimumDate } : undefined }}
              fullWidth
            />
            <SelectInput
              source="priority"
              label="Priorità"
              choices={priorityChoices}
              validate={required("La priorità è obbligatoria")}
              fullWidth
            />
          </Stack>
        </Stack>
      </Paper>
      <Paper
        component="section"
        aria-labelledby="order-details-title"
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        <OrderDetailsEditor />
      </Paper>
    </Stack>
  );
};
