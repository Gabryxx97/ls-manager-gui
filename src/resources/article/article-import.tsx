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
  name: string;
  description?: string;
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
  failed: number;
  createdItems: ImportItem[];
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
  if (header.length !== 2 || header[0] !== "name" || header[1] !== "description") {
    throw new Error("Le intestazioni richieste sono name,description (in questo ordine)");
  }

  const dataRows = nonEmptyRows.slice(1);
  if (dataRows.length > MAX_ROWS) throw new Error("Il file contiene più di 5.000 righe dati");

  const items: ImportItem[] = [];
  const errors: ImportError[] = [];
  for (const row of dataRows) {
    if (row.cells.length !== 2) {
      errors.push({
        rowNumber: row.rowNumber,
        field: null,
        message: "La riga deve contenere esattamente due colonne",
        source: "client",
      });
      continue;
    }
    const name = row.cells[0].trim().replace(/\s+/g, " ");
    const description = row.cells[1].trim();
    if (!name) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "name",
        message: "Il nome è obbligatorio",
        source: "client",
      });
      continue;
    }
    if (name.length > 255) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "name",
        message: "Il nome non può superare 255 caratteri",
        source: "client",
      });
      continue;
    }
    items.push({ rowNumber: row.rowNumber, name, description: description || undefined });
  }

  return { fileName: file.name, totalRows: dataRows.length, items, errors };
};

const resultText = (result: ImportResult) => {
  const lines = [
    `Importazione articoli: ${result.fileName}`,
    `Righe elaborate: ${result.totalRows}`,
    `Articoli creati: ${result.created}`,
    `Righe scartate: ${result.failed}`,
  ];
  if (result.createdItems.length) {
    lines.push("", "Righe create:");
    result.createdItems.forEach((item) => lines.push(`- Riga ${item.rowNumber}: ${item.name}`));
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
        failed: parsed.errors.length + json.failed,
        createdItems: parsed.items.filter((item) => !failedServerRows.has(item.rowNumber)),
        errors,
      });
      refresh();
      notify(`${json.created} articoli creati`, { type: json.failed ? "warning" : "success" });
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
                File UTF-8 fino a 5 MB e 5.000 righe, con intestazioni <code>name,description</code>.
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
                        <TableHead><TableRow><TableCell>Riga</TableCell><TableCell>Nome</TableCell><TableCell>Descrizione</TableCell></TableRow></TableHead>
                        <TableBody>
                          {parsed.items.slice(0, PREVIEW_ROWS).map((item) => (
                            <TableRow key={item.rowNumber}>
                              <TableCell className="ls-mono">{item.rowNumber}</TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.description || "—"}</TableCell>
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
                Importazione conclusa: {result.created} articoli creati e {result.failed} righe scartate.
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
