import DownloadIcon from "@mui/icons-material/Download";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useGetIdentity, useNotify, usePermissions } from "react-admin";
import { apiUrl, downloadRequest } from "../../http-client";
import { WarehouseOrder } from "../../types";

type Scope = "purchase" | "full";
type Format = "csv" | "pdf";

const filenameFrom = (disposition: string | null, fallback: string) =>
  disposition?.match(/filename="?([^";]+)"?/)?.[1] ?? fallback;

export const OrderExportButton = ({ order }: { order: WarehouseOrder }) => {
  const { permissions } = usePermissions();
  const { identity } = useGetIdentity();
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<Scope>("full");
  const [format, setFormat] = useState<Format>("csv");
  const [pending, setPending] = useState(false);
  const purchaseCount = (order.details ?? []).filter((detail) => detail.status === "TO_PURCHASE").length;
  const isAssignedWarehouse = permissions === "WAREHOUSE_ROLE"
    && order.assignedWarehouseId != null
    && String(order.assignedWarehouseId) === String(identity?.id);
  if (permissions !== "ADMIN_ROLE" && !isAssignedWarehouse) return null;

  const download = async () => {
    setPending(true);
    try {
      const result = await downloadRequest(`${apiUrl}/orders/${order.id}/export?scope=${scope}&format=${format}`);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(result.blob);
      link.download = filenameFrom(result.headers.get("Content-Disposition"), `ordine-${order.id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      setOpen(false);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Impossibile esportare l'ordine", { type: "error" });
    } finally {
      setPending(false);
    }
  };

  return <>
    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => setOpen(true)}>Esporta</Button>
    <Dialog open={open} onClose={() => !pending && setOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>Esporta ordine</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="export-scope-label">Contenuto</InputLabel>
            <Select labelId="export-scope-label" label="Contenuto" value={scope} onChange={(event) => setScope(event.target.value as Scope)}>
              <MenuItem value="full">Ordine completo</MenuItem>
              <MenuItem value="purchase" disabled={purchaseCount === 0}>Righe da ordinare ({purchaseCount})</MenuItem>
            </Select>
          </FormControl>
          {purchaseCount === 0 && <Typography variant="body2" color="text.secondary">Non ci sono righe da ordinare in questo ordine.</Typography>}
          <FormControl fullWidth>
            <InputLabel id="export-format-label">Formato</InputLabel>
            <Select labelId="export-format-label" label="Formato" value={format} onChange={(event) => setFormat(event.target.value as Format)}>
              <MenuItem value="csv">CSV (Excel)</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={pending} onClick={() => setOpen(false)}>Annulla</Button>
        <Button variant="contained" disabled={pending || (scope === "purchase" && purchaseCount === 0)} onClick={download}>Scarica</Button>
      </DialogActions>
    </Dialog>
  </>;
};
