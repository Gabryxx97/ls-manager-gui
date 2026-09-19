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
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import EditIcon from "@mui/icons-material/Edit";
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
import { OrderFormData, OrderFormDetail } from "./order-form-utils";

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

type CustomArticleDraft = {
  description: string;
  sku: string;
  unitOfMeasure: string;
  unitPrice: string;
  quantity: string;
};

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
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customEditIndex, setCustomEditIndex] = useState<number | null>(null);
  const [customDraft, setCustomDraft] = useState<CustomArticleDraft>({
    description: "",
    sku: "",
    unitOfMeasure: "",
    unitPrice: "",
    quantity: "1",
  });
  const { data: searchResults = [], isPending: searching, error: searchError } =
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
          (a.article?.sku ?? a.detail?.articleSku ?? "").localeCompare(
            b.article?.sku ?? b.detail?.articleSku ?? "",
          ),
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
  const openCustomCreate = () => {
    setCustomEditIndex(null);
    setCustomDraft({
      description: query.trim(),
      sku: "",
      unitOfMeasure: "",
      unitPrice: "",
      quantity: "1",
    });
    setCustomDialogOpen(true);
  };
  const openCustomEdit = (index: number) => {
    const detail = details[index];
    setCustomEditIndex(index);
    setCustomDraft({
      description: detail?.articleDescription ?? "",
      sku: detail?.articleSku === "NON CENSITO" ? "" : detail?.articleSku ?? "",
      unitOfMeasure: detail?.unitOfMeasure ?? "",
      unitPrice: detail?.unitPrice == null ? "" : String(detail.unitPrice),
      quantity: String(detail?.quantity ?? 1),
    });
    setCustomDialogOpen(true);
  };
  const customPrice = Number(customDraft.unitPrice);
  const customQuantity = Number(customDraft.quantity);
  const customDraftValid = customDraft.description.trim().length > 0
    && customDraft.description.trim().length <= 2000
    && customDraft.sku.trim().length <= 64
    && customDraft.unitOfMeasure.trim().length <= 16
    && /^\d+(?:\.\d{1,2})?$/.test(customDraft.unitPrice)
    && Number.isFinite(customPrice)
    && customPrice >= 0
    && customPrice <= 9999999999.99
    && Number.isInteger(customQuantity)
    && customQuantity > 0;
  const saveCustomArticle = () => {
    if (!customDraftValid) return;
    const detail: OrderFormDetail = {
      custom: true,
      articleDescription: customDraft.description.trim(),
      articleSku: customDraft.sku.trim() || null,
      unitOfMeasure: customDraft.unitOfMeasure.trim() || null,
      unitPrice: customPrice,
      quantity: customQuantity,
    };
    if (customEditIndex == null) append(detail);
    else update(customEditIndex, detail);
    setCustomDialogOpen(false);
    setQuery("");
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
      {!searching && searchError && (
        <Typography sx={{ p: 1.5 }} color="error">
          Ricerca non disponibile. Riprova tra poco.
        </Typography>
      )}
      {!searching && !searchError && searchResults.length === 0 && (
        <Stack spacing={1} sx={{ p: 1.5, alignItems: "flex-start" }}>
          <Typography color="text.secondary">Nessun articolo trovato</Typography>
          <Button type="button" variant="outlined" size="small" onClick={openCustomCreate}>
            Aggiungi “{query.trim()}” come articolo non censito
          </Button>
        </Stack>
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
    const custom = row.detail?.articleId == null;
    const displaySku = article?.sku || row.detail?.articleSku || (custom ? "NON CENSITO" : "—");
    const displayDescription = article?.description || row.detail?.articleDescription || "Articolo non disponibile";
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
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap" }}>
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
                {displaySku}
              </Typography>
              {custom && <Chip size="small" label="Non censito" variant="outlined" />}
            </Stack>
            <Typography
              component="h3"
              variant="body2"
              sx={{ mt: 0.75, overflowWrap: "anywhere", fontWeight: 600 }}
            >
              {displayDescription}
            </Typography>
            <Typography
              variant="caption"
              className="ls-mono"
              color="text.secondary"
            >
              Prezzo unitario: <strong>{money(unitPrice)}</strong>
              {row.detail?.unitOfMeasure && ` · ${row.detail.unitOfMeasure}`}
            </Typography>
          </Box>
          <Stack direction="row">
            {custom && (
              <IconButton
                aria-label={`Modifica ${displayDescription}`}
                onClick={() => openCustomEdit(row.index)}
                size="small"
              >
                <EditIcon />
              </IconButton>
            )}
            <IconButton
              aria-label={`Rimuovi ${displayDescription}`}
              onClick={() => remove(row.index)}
              color="inherit"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
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
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <span>{displaySku}</span>
            {custom && <Chip size="small" label="Non censito" variant="outlined" />}
          </Stack>
        </TableCell>
        <TableCell>
          {displayDescription}
          {row.detail?.unitOfMeasure && (
            <Typography sx={{ display: "block" }} variant="caption" color="text.secondary">
              U.M. {row.detail.unitOfMeasure}
            </Typography>
          )}
        </TableCell>
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
          {custom && (
            <IconButton
              aria-label={`Modifica ${displayDescription}`}
              onClick={() => openCustomEdit(row.index)}
            >
              <EditIcon />
            </IconButton>
          )}
          <IconButton
            aria-label={`Rimuovi ${displayDescription}`}
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
      <Dialog
        open={customDialogOpen}
        onClose={() => setCustomDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {customEditIndex == null ? "Aggiungi articolo non censito" : "Modifica articolo non censito"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              required
              label="Descrizione"
              value={customDraft.description}
              onChange={(event) => setCustomDraft((value) => ({ ...value, description: event.target.value }))}
              error={customDraft.description.length > 2000}
              helperText={`${customDraft.description.length}/2000`}
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Codice (facoltativo)"
                value={customDraft.sku}
                onChange={(event) => setCustomDraft((value) => ({ ...value, sku: event.target.value }))}
                error={customDraft.sku.length > 64}
                slotProps={{ htmlInput: { maxLength: 65 } }}
                fullWidth
              />
              <TextField
                label="Unità di misura (facoltativa)"
                value={customDraft.unitOfMeasure}
                onChange={(event) => setCustomDraft((value) => ({ ...value, unitOfMeasure: event.target.value }))}
                error={customDraft.unitOfMeasure.length > 16}
                slotProps={{ htmlInput: { maxLength: 17 } }}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                label="Prezzo unitario"
                type="number"
                value={customDraft.unitPrice}
                onChange={(event) => setCustomDraft((value) => ({ ...value, unitPrice: event.target.value }))}
                slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                error={customDraft.unitPrice.length > 0 && (!/^\d+(?:\.\d{1,2})?$/.test(customDraft.unitPrice) || customPrice < 0 || customPrice > 9999999999.99)}
                helperText="Importo in euro, massimo due decimali"
                fullWidth
              />
              <TextField
                required
                label="Quantità"
                type="number"
                value={customDraft.quantity}
                onChange={(event) => setCustomDraft((value) => ({ ...value, quantity: event.target.value }))}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                error={customDraft.quantity.length > 0 && (!Number.isInteger(customQuantity) || customQuantity <= 0)}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomDialogOpen(false)}>Annulla</Button>
          <Button variant="contained" disabled={!customDraftValid} onClick={saveCustomArticle}>
            {customEditIndex == null ? "Aggiungi" : "Salva"}
          </Button>
        </DialogActions>
      </Dialog>
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
