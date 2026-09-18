import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  useGetIdentity,
  useNotify,
  usePermissions,
  useRedirect,
  useRefresh,
} from "react-admin";
import { apiUrl, httpRequest } from "../../http-client";
import {
  OrderDetailStatus,
  WarehouseOrder,
  WarehouseOrderDetail,
} from "../../types";

const detailPresentation: Record<
  OrderDetailStatus,
  { label: string; color: "default" | "info" | "success" | "warning" | "error" }
> = {
  TO_PICK: { label: "Da prelevare", color: "info" },
  COMPLETED: { label: "Completato", color: "success" },
  TO_PURCHASE: { label: "Da ordinare/acquistare", color: "warning" },
  CANCELED: { label: "Annullato", color: "error" },
  REPLACED: { label: "Sostituito", color: "default" },
};

const money = (value: number | string | null | undefined) =>
  value == null ? "—" : `€ ${Number(value).toFixed(2)}`;

const WorkflowLine = ({
  order,
  detail,
  canOperate,
}: {
  order: WarehouseOrder;
  detail: WarehouseOrderDetail;
  canOperate: boolean;
}) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const [pickedQuantity, setPickedQuantity] = useState(detail.pickedQuantity);
  const [pending, setPending] = useState(false);

  useEffect(() => setPickedQuantity(detail.pickedQuantity), [detail.pickedQuantity]);

  const execute = async (
    suffix: string,
    options: RequestInit,
    successMessage: string,
  ) => {
    setPending(true);
    try {
      await httpRequest(`${apiUrl}/orders/${order.id}/details/${detail.id}/${suffix}`, options);
      notify(successMessage, { type: "success" });
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Impossibile aggiornare la riga", {
        type: "error",
      });
    } finally {
      setPending(false);
    }
  };

  const presentation = detailPresentation[detail.status];
  const validQuantity = Number.isInteger(pickedQuantity)
    && pickedQuantity >= 0
    && pickedQuantity <= detail.quantity;
  const canEditQuantity = canOperate
    && (detail.status === "TO_PICK" || detail.status === "COMPLETED");

  return (
    <Paper component="article" variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography className="ls-mono" color="primary" variant="caption">
              {detail.articleSku}
            </Typography>
            <Chip size="small" label={presentation.label} color={presentation.color} />
          </Stack>
          <Typography sx={{ mt: 0.75, fontWeight: 600 }}>
            {detail.articleDescription}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Prelevati <strong>{detail.pickedQuantity}</strong> di <strong>{detail.quantity}</strong>
            {detail.remainingQuantity > 0 && ` · Residui ${detail.remainingQuantity}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {money(detail.unitPrice)} cad. · Subtotale {money(detail.subtotal)}
          </Typography>
        </Box>

        {canOperate && (
          <Stack spacing={1} sx={{ minWidth: { sm: 300 } }}>
            {canEditQuantity && (
              <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                <TextField
                  label="Quantità prelevata"
                  type="number"
                  size="small"
                  value={pickedQuantity}
                  disabled={pending}
                  error={!validQuantity}
                  helperText={!validQuantity ? `Da 0 a ${detail.quantity}` : undefined}
                  onChange={(event) => setPickedQuantity(Number(event.target.value))}
                  slotProps={{ htmlInput: { min: 0, max: detail.quantity, step: 1 } }}
                  sx={{ width: 150 }}
                />
                <Button
                  variant="contained"
                  disabled={pending || !validQuantity || pickedQuantity === detail.pickedQuantity}
                  onClick={() => execute(
                    "picked-quantity",
                    { method: "PUT", body: JSON.stringify({ pickedQuantity }) },
                    "Quantità prelevata aggiornata",
                  )}
                >
                  Conferma
                </Button>
              </Stack>
            )}
            {detail.status === "TO_PICK" && pickedQuantity < detail.quantity && (
              <Button
                color="warning"
                variant="outlined"
                disabled={pending || !validQuantity}
                onClick={() => execute(
                  "to-purchase",
                  { method: "POST", body: JSON.stringify({ pickedQuantity }) },
                  "Riga contrassegnata da ordinare",
                )}
              >
                Da ordinare/acquistare
              </Button>
            )}
            {detail.status === "TO_PURCHASE" && (
              <Button
                variant="outlined"
                disabled={pending}
                onClick={() => execute(
                  "resume-picking",
                  { method: "POST" },
                  "Prelievo ripreso",
                )}
              >
                Riprendi prelievo
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export const OrderWorkflow = ({ order }: { order: WarehouseOrder }) => {
  const { permissions } = usePermissions();
  const { identity } = useGetIdentity();
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const details = order.details ?? [];
  const canOperate = order.status === "PROCESSING"
    && (permissions === "ADMIN_ROLE"
      || (permissions === "WAREHOUSE_ROLE"
        && order.assignedWarehouseId != null
        && String(order.assignedWarehouseId) === String(identity?.id)));
  const canComplete = canOperate
    && details.length > 0
    && details.every((detail) => detail.status === "COMPLETED");

  const complete = async () => {
    setPending(true);
    try {
      await httpRequest(`${apiUrl}/orders/${order.id}/complete`, { method: "POST" });
      notify("Ordine completato", { type: "success" });
      setConfirmOpen(false);
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Impossibile completare l'ordine", {
        type: "error",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ width: "100%", pb: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between" }}
        >
          <Box>
            <Typography component="h2" variant="h3">Informazioni ordine</Typography>
            <Typography sx={{ mt: 1 }}><strong>Commessa:</strong> {order.name}</Typography>
            <Typography><strong>Data:</strong> {new Intl.DateTimeFormat("it-IT").format(new Date(`${order.date}T00:00:00`))}</Typography>
            <Typography><strong>Magazziniere:</strong> {order.assignedWarehouseName ?? "Non assegnato"}</Typography>
            {order.notes && <Typography><strong>Note:</strong> {order.notes}</Typography>}
          </Box>
          <Stack spacing={1} sx={{ alignItems: { sm: "flex-end" } }}>
            <Chip
              label={order.status === "PROCESSING" ? "In lavorazione" : order.status === "COMPLETED" ? "Completato" : "Annullato"}
              color={order.status === "PROCESSING" ? "info" : order.status === "COMPLETED" ? "success" : "error"}
            />
            <Typography variant="body2">Totale netto: <strong>{money(order.netTotal)}</strong></Typography>
          </Stack>
        </Stack>
      </Paper>

      <Stack spacing={1.5} component="section" aria-label="Lavorazione articoli">
        <Typography component="h2" variant="h3">Articoli</Typography>
        {!canOperate && order.status === "PROCESSING" && (
          <Typography color="text.secondary">
            {order.assignedWarehouseId
              ? "Solo il magazziniere assegnato o un amministratore può lavorare questo ordine."
              : "L'ordine deve essere preso in carico prima di poter lavorare le righe."}
          </Typography>
        )}
        {details.map((detail) => (
          <WorkflowLine
            key={detail.id}
            order={order}
            detail={detail}
            canOperate={canOperate}
          />
        ))}
      </Stack>

      <Divider />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={() => redirect("list", "orders")}>Torna agli ordini</Button>
        {canOperate && (
          <Button variant="contained" disabled={!canComplete} onClick={() => setConfirmOpen(true)}>
            Completa ordine
          </Button>
        )}
      </Stack>

      <Dialog open={confirmOpen} onClose={() => !pending && setConfirmOpen(false)}>
        <DialogTitle>Completare l’ordine?</DialogTitle>
        <DialogContent>
          Dopo la conferma non sarà più possibile correggere le quantità prelevate.
        </DialogContent>
        <DialogActions>
          <Button disabled={pending} onClick={() => setConfirmOpen(false)}>Annulla</Button>
          <Button disabled={pending} variant="contained" onClick={complete}>Conferma completamento</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
