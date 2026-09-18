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
import { useGetList, useNotify, usePermissions, useRefresh } from "react-admin";
import { apiUrl, httpRequest } from "../../http-client";
import { User, WarehouseOrder } from "../../types";

const canBeAssigned = (order: WarehouseOrder) =>
  order.status === "PROCESSING";

export const AssignedWarehouse = ({ order }: { order: WarehouseOrder }) => (
  <Typography component="span" variant="body2" color={order.assignedWarehouseName ? "text.primary" : "text.secondary"}>
    {order.assignedWarehouseName ?? "Non assegnato"}
  </Typography>
);

export const OrderAssignmentActions = ({ order }: { order: WarehouseOrder }) => {
  const { permissions } = usePermissions();
  const notify = useNotify();
  const refresh = useRefresh();
  const isAdmin = permissions === "ADMIN_ROLE";
  const isWarehouse = permissions === "WAREHOUSE_ROLE";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState<number | "">(order.assignedWarehouseId ?? "");
  const { data: warehouses = [] } = useGetList<User>(
    "users",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "username", order: "ASC" },
      filter: { role: "WAREHOUSE_ROLE" },
    },
    { enabled: isAdmin },
  );

  const execute = async (url: string, options: RequestInit, successMessage: string) => {
    try {
      await httpRequest(url, options);
      notify(successMessage, { type: "success" });
      setDialogOpen(false);
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Impossibile aggiornare l'assegnazione", {
        type: "error",
      });
    }
  };

  if (!canBeAssigned(order) && !(isAdmin && order.assignedWarehouseId)) return null;

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
        {isWarehouse && !order.assignedWarehouseId && canBeAssigned(order) && (
          <Button
            size="small"
            variant="contained"
            onClick={() => execute(`${apiUrl}/orders/${order.id}/claim`, { method: "POST" }, "Ordine preso in carico")}
          >
            Prendi in carico
          </Button>
        )}
        {isAdmin && canBeAssigned(order) && (
          <Button size="small" onClick={() => setDialogOpen(true)}>
            {order.assignedWarehouseId ? "Cambia magazziniere" : "Assegna magazziniere"}
          </Button>
        )}
        {isAdmin && order.assignedWarehouseId && (
          <Button
            size="small"
            color="warning"
            onClick={() => execute(`${apiUrl}/orders/${order.id}/assignee`, { method: "DELETE" }, "Assegnazione revocata")}
          >
            Revoca
          </Button>
        )}
      </Stack>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Assegna magazziniere</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id={`warehouse-${order.id}`}>Magazziniere</InputLabel>
            <Select
              labelId={`warehouse-${order.id}`}
              label="Magazziniere"
              value={warehouseId}
              onChange={(event) => setWarehouseId(Number(event.target.value))}
            >
              {warehouses.map((warehouse) => {
                const name = [warehouse.name, warehouse.surname].filter(Boolean).join(" ") || warehouse.username;
                return <MenuItem key={warehouse.id} value={warehouse.id}>{name}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annulla</Button>
          <Button
            variant="contained"
            disabled={warehouseId === ""}
            onClick={() => execute(
              `${apiUrl}/orders/${order.id}/assignee`,
              { method: "PUT", body: JSON.stringify({ warehouseUserId: warehouseId }) },
              order.assignedWarehouseId ? "Magazziniere riassegnato" : "Magazziniere assegnato",
            )}
          >
            Salva
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
