import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ChangeEvent, useRef, useState } from "react";
import { useNotify, useRefresh } from "react-admin";
import { apiUrl, httpRequest } from "../../http-client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 5000;
const PREVIEW_ROWS = 100;

type ImportItem = {
  rowNumber: number;
  sku: string;
  description: string;
  category?: string;
  costCenter?: string;
  unitOfMeasure?: string;
  location?: string;
  stockQuantity?: number;
};

type ImportError = {
  rowNumber: number | null;
  field: string | null;
  message: string;
  source: "client" | "server";
};

type ImportResponse = {
  received: number;
  created: number;
  updated: number;
  failed: number;
  errors: Array<Omit<ImportError, "source">>;
};

type ParsedFile = {
  fileName: string;
  totalRows: number;
  items: ImportItem[];
  errors: ImportError[];
};

type ImportResult = {
  fileName: string;
  totalRows: number;
  created: number;
  updated: number;
  failed: number;
  importedItems: ImportItem[];
  errors: ImportError[];
};

type CsvRow = { rowNumber: number; cells: string[] };

const parseCsv = (text: string): CsvRow[] => {
  const rows: CsvRow[] = [];
  let cells: string[] = [];
  let cell = "";
  let quoted = false;
  let rowNumber = 1;
  let rowStart = 1;

  const finishRow = () => {
    cells.push(cell);
    rows.push({ rowNumber: rowStart, cells });
    cells = [];
    cell = "";
  };

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
        if (character === "\n") rowNumber += 1;
      }
      continue;
    }

    if (character === '"') {
      if (cell.length > 0) throw new Error(`Virgolette non valide alla riga ${rowNumber}`);
      quoted = true;
    } else if (character === ",") {
      cells.push(cell);
      cell = "";
    } else if (character === "\n") {
      finishRow();
      rowNumber += 1;
      rowStart = rowNumber;
    } else if (character !== "\r") {
      cell += character;
    }
  }

  if (quoted) throw new Error(`Campo tra virgolette non chiuso alla riga ${rowStart}`);
  if (cell.length > 0 || cells.length > 0) finishRow();
  return rows;
};

const readCsv = async (file: File): Promise<ParsedFile> => {
  if (!file.name.toLocaleLowerCase().endsWith(".csv")) {
    throw new Error("Seleziona un file con estensione .csv");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Il file supera il limite di 5 MB");
  }

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
  } catch {
    throw new Error("Il file non contiene testo UTF-8 leggibile");
  }

  const rows = parseCsv(text.replace(/^\uFEFF/, ""));
  const nonEmptyRows = rows.filter((row) => row.cells.some((cell) => cell.trim() !== ""));
  if (nonEmptyRows.length === 0) throw new Error("Il file CSV è vuoto");

  const header = nonEmptyRows[0].cells.map((cell) => cell.trim().toLocaleLowerCase());
  const expectedHeader = ["sku", "description", "category", "costcenter", "unitofmeasure", "location", "stockquantity"];
  if (header.length !== expectedHeader.length || header.some((cell, index) => cell !== expectedHeader[index])) {
    throw new Error("Le intestazioni richieste sono sku,description,category,costCenter,unitOfMeasure,location,stockQuantity (in questo ordine)");
  }

  const dataRows = nonEmptyRows.slice(1);
  if (dataRows.length > MAX_ROWS) throw new Error("Il file contiene più di 5.000 righe dati");

  const items: ImportItem[] = [];
  const errors: ImportError[] = [];
  for (const row of dataRows) {
    if (row.cells.length !== 7) {
      errors.push({
        rowNumber: row.rowNumber,
        field: null,
        message: "La riga deve contenere esattamente sette colonne",
        source: "client",
      });
      continue;
    }
    const sku = row.cells[0].trim().replace(/\s+/g, "-").toUpperCase();
    const description = row.cells[1].trim().replace(/\s+/g, " ");
    const category = row.cells[2].trim().replace(/\s+/g, " ");
    const costCenter = row.cells[3].trim().replace(/\s+/g, " ");
    const unitOfMeasure = row.cells[4].trim().replace(/\s+/g, " ");
    const location = row.cells[5].trim().replace(/\s+/g, " ");
    const quantityRaw = row.cells[6].trim();
    const quantityText = quantityRaw.replace(",", ".");
    const stockQuantity = quantityText === "" ? undefined : Number(quantityText);
    if (!sku || sku.length > 64) {
      errors.push({ rowNumber: row.rowNumber, field: "sku", message: "Lo SKU è obbligatorio e non può superare 64 caratteri", source: "client" });
      continue;
    }
    if (!description) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "description",
        message: "La descrizione è obbligatoria",
        source: "client",
      });
      continue;
    }
    const oversized = [
      ["category", category, 64],
      ["costCenter", costCenter, 128],
      ["unitOfMeasure", unitOfMeasure, 16],
      ["location", location, 255],
    ] as const;
    const invalidText = oversized.find(([, value, max]) => value.length > max);
    if (invalidText) {
      errors.push({ rowNumber: row.rowNumber, field: invalidText[0], message: `Il campo non può superare ${invalidText[2]} caratteri`, source: "client" });
      continue;
    }
    if (quantityRaw && !/^-?\d{1,12}(?:[.,]\d{1,2})?$/.test(quantityRaw)) {
      errors.push({ rowNumber: row.rowNumber, field: "stockQuantity", message: "La giacenza deve essere un numero con massimo 12 cifre intere e due decimali", source: "client" });
      continue;
    }
    items.push({
      rowNumber: row.rowNumber,
      sku,
      description,
      category: category || undefined,
      costCenter: costCenter || undefined,
      unitOfMeasure: unitOfMeasure || undefined,
      location: location || undefined,
      stockQuantity,
    });
  }

  return { fileName: file.name, totalRows: dataRows.length, items, errors };
};

const resultText = (result: ImportResult) => {
  const lines = [
    `Importazione articoli: ${result.fileName}`,
    `Righe elaborate: ${result.totalRows}`,
    `Articoli creati: ${result.created}`,
    `Articoli aggiornati: ${result.updated}`,
    `Righe scartate: ${result.failed}`,
  ];
  if (result.importedItems.length) {
    lines.push("", "Righe importate:");
    result.importedItems.forEach((item) => lines.push(`- Riga ${item.rowNumber}: ${item.sku} — ${item.description}`));
  }
  if (result.errors.length) {
    lines.push("", "Errori:");
    result.errors.forEach((error) => {
      const row = error.rowNumber == null ? "Riga sconosciuta" : `Riga ${error.rowNumber}`;
      const field = error.field ? `, campo ${error.field}` : "";
      lines.push(`- ${row}${field}: ${error.message}`);
    });
  }
  return lines.join("\n");
};

export const ArticleImportButton = () => {
  const fileInput = useRef<HTMLInputElement>(null);
  const notify = useNotify();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);
  const [parsed, setParsed] = useState<ParsedFile>();
  const [result, setResult] = useState<ImportResult>();
  const [fileError, setFileError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setParsed(undefined);
    setResult(undefined);
    setFileError(undefined);
    setLoading(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  const close = () => {
    if (loading) return;
    setOpen(false);
    reset();
  };

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    reset();
    if (!file) return;
    try {
      setParsed(await readCsv(file));
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Impossibile leggere il file");
    }
  };

  const importArticles = async () => {
    if (!parsed || parsed.items.length === 0) return;
    setLoading(true);
    try {
      const { json } = await httpRequest<ImportResponse>(`${apiUrl}/articles/import`, {
        method: "POST",
        body: JSON.stringify({ items: parsed.items }),
      });
      const serverErrors = json.errors.map((error) => ({ ...error, source: "server" as const }));
      const errors = [...parsed.errors, ...serverErrors];
      const failedServerRows = new Set(serverErrors.map((error) => error.rowNumber));
      setResult({
        fileName: parsed.fileName,
        totalRows: parsed.totalRows,
        created: json.created,
        updated: json.updated,
        failed: parsed.errors.length + json.failed,
        importedItems: parsed.items.filter((item) => !failedServerRows.has(item.rowNumber)),
        errors,
      });
      refresh();
      notify(`${json.created} articoli creati, ${json.updated} aggiornati`, { type: json.failed ? "warning" : "success" });
    } catch (error) {
      notify(error instanceof Error ? error.message : "Importazione non riuscita", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(resultText(result));
      notify("Riepilogo copiato", { type: "success" });
    } catch {
      notify("Impossibile copiare il riepilogo", { type: "error" });
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const url = URL.createObjectURL(new Blob([resultText(result)], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `import-articoli-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button startIcon={<UploadFileIcon />} variant="outlined" onClick={() => setOpen(true)}>
        Importa CSV
      </Button>
      <Dialog open={open} onClose={close} fullWidth maxWidth="md" aria-labelledby="article-import-title">
        <DialogTitle id="article-import-title">Importa articoli da CSV</DialogTitle>
        <DialogContent>
          {!result && (
            <Stack spacing={2}>
              <Typography color="text.secondary">
                File UTF-8 fino a 5 MB e 5.000 righe, con intestazioni <code>sku,description,category,costCenter,unitOfMeasure,location,stockQuantity</code>.
              </Typography>
              <Box>
                <input
                  ref={fileInput}
                  hidden
                  type="file"
                  accept=".csv,text/csv"
                  onChange={selectFile}
                />
                <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => fileInput.current?.click()}>
                  Seleziona file CSV
                </Button>
              </Box>
              {fileError && <Alert severity="error">{fileError}</Alert>}
              {parsed && (
                <>
                  <Divider />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Typography><strong>{parsed.fileName}</strong></Typography>
                    <Typography color="text.secondary">
                      {parsed.totalRows} righe · {parsed.items.length} valide · {parsed.errors.length} scartate
                    </Typography>
                  </Stack>
                  {parsed.items.length === 0 && (
                    <Alert severity="warning">Non ci sono righe valide da importare.</Alert>
                  )}
                  {parsed.errors.length > 0 && (
                    <Alert severity="warning">
                      Le righe non valide saranno escluse. Controlla il riepilogo sotto l’anteprima.
                    </Alert>
                  )}
                  {parsed.items.length > 0 && (
                    <TableContainer component={Paper} sx={{ maxHeight: 360 }}>
                      <Table stickyHeader size="small" aria-label="Anteprima articoli da importare">
                        <TableHead><TableRow><TableCell>Riga</TableCell><TableCell>SKU</TableCell><TableCell>Descrizione</TableCell><TableCell>Categoria</TableCell><TableCell>Centro di costo</TableCell><TableCell>U.M.</TableCell><TableCell>Ubicazione</TableCell><TableCell>Giacenza</TableCell></TableRow></TableHead>
                        <TableBody>
                          {parsed.items.slice(0, PREVIEW_ROWS).map((item) => (
                            <TableRow key={item.rowNumber}>
                              <TableCell className="ls-mono">{item.rowNumber}</TableCell>
                              <TableCell className="ls-mono">{item.sku}</TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.category || "—"}</TableCell>
                              <TableCell>{item.costCenter || "—"}</TableCell>
                              <TableCell>{item.unitOfMeasure || "—"}</TableCell>
                              <TableCell>{item.location || "—"}</TableCell>
                              <TableCell>{item.stockQuantity ?? "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  {parsed.items.length > PREVIEW_ROWS && (
                    <Typography variant="caption" color="text.secondary">
                      Anteprima limitata alle prime {PREVIEW_ROWS} righe valide.
                    </Typography>
                  )}
                  {parsed.errors.length > 0 && (
                    <Box component="section" aria-label="Errori rilevati nel file">
                      <Typography variant="h3" sx={{ mb: 1 }}>Righe scartate</Typography>
                      {parsed.errors.slice(0, PREVIEW_ROWS).map((error) => (
                        <Typography key={`${error.rowNumber}-${error.field}`} variant="body2" color="error">
                          Riga {error.rowNumber}: {error.message}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Stack>
          )}
          {result && (
            <Stack spacing={2}>
              <Alert severity={result.failed ? "warning" : "success"}>
                Importazione conclusa: {result.created} articoli creati, {result.updated} aggiornati e {result.failed} righe scartate.
              </Alert>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography component="pre" sx={{ m: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {resultText(result)}
                </Typography>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {result ? (
            <>
              <Button startIcon={<ContentCopyIcon />} onClick={copyResult}>Copia</Button>
              <Button startIcon={<DownloadIcon />} onClick={downloadResult}>Scarica</Button>
              <Button variant="contained" onClick={close}>Chiudi</Button>
            </>
          ) : (
            <>
              <Button onClick={close} disabled={loading}>Annulla</Button>
              <Button
                variant="contained"
                onClick={importArticles}
                disabled={!parsed?.items.length || loading}
                startIcon={loading ? <CircularProgress color="inherit" size={18} /> : undefined}
              >
                {loading ? "Importazione…" : "Conferma importazione"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
