import AddIcon from "@mui/icons-material/Add";
import {
  Card,
  CardActions,
  CardContent,
  Chip,
  ChipProps,
  Fab,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  CreateButton,
  Datagrid,
  EditButton,
  FunctionField,
  List,
  Pagination,
  RecordContextProvider,
  SearchInput,
  SelectInput,
  TextField,
  TopToolbar,
  useListContext,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import { CustomDeleteButton } from "../../components/custom-delete-button";
import { CustomEmpty } from "../../components/custom-empty";
import {
  OrderPriority,
  OrderStatus,
  WarehouseOrder,
} from "../../types";

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

const statusPresentation: Record<
  OrderStatus,
  { label: string; color: ChipProps["color"] }
> = {
  DRAFT: { label: "Bozza", color: "default" },
  PROCESSING: { label: "In lavorazione", color: "info" },
  COMPLETED: { label: "Completato", color: "success" },
  SHIPPED: { label: "Spedito", color: "primary" },
};

const priorityPresentation: Record<
  OrderPriority,
  { label: string; color: ChipProps["color"] }
> = {
  LOW: { label: "Bassa", color: "default" },
  STANDARD: { label: "Standard", color: "info" },
  HIGH: { label: "Alta", color: "warning" },
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const StatusChip = ({ status }: { status: OrderStatus }) => {
  const presentation = statusPresentation[status];
  return <Chip label={presentation.label} color={presentation.color} />;
};

const PriorityChip = ({ priority }: { priority: OrderPriority }) => {
  const presentation = priorityPresentation[priority];
  return (
    <Chip
      label={`Priorità ${presentation.label.toLowerCase()}`}
      color={presentation.color}
      variant="outlined"
    />
  );
};

const orderFilters = [
  <SearchInput
    key="search"
    source="search"
    placeholder="Cerca ordini…"
    alwaysOn
  />,
  <SelectInput
    key="status"
    source="status"
    label="Stato"
    choices={statusChoices}
    alwaysOn
  />,
  <SelectInput
    key="priority"
    source="priority"
    label="Priorità"
    choices={priorityChoices}
    alwaysOn
  />,
];

const OrderActions = () => (
  <TopToolbar>
    <CreateButton
      sx={{ display: { xs: "none", sm: "inline-flex" } }}
      variant="contained"
      label="Nuovo ordine"
    />
  </TopToolbar>
);

const OrderMobileCards = () => {
  const { data = [] } = useListContext<WarehouseOrder>();

  return (
    <Stack spacing={1.5} component="section" aria-label="Elenco ordini">
      {data.map((order) => (
        <RecordContextProvider key={order.id} value={order}>
          <Card component="article">
            <CardContent sx={{ pb: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <Typography
                  component="h2"
                  variant="h3"
                  sx={{ minWidth: 0, overflowWrap: "anywhere" }}
                >
                  {order.name}
                </Typography>
                <StatusChip status={order.status} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Data: {formatDate(order.date)}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1.5, alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
              >
                <PriorityChip priority={order.priority} />
                <Typography variant="caption" className="ls-mono" color="text.secondary">
                  ID {order.id}
                </Typography>
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 1.5 }}>
              <EditButton label="Modifica" />
              <CustomDeleteButton resource="orders" titleField="name" />
            </CardActions>
          </Card>
        </RecordContextProvider>
      ))}
    </Stack>
  );
};

const MobileCreateFab = () => {
  const navigate = useNavigate();
  return (
    <Fab
      color="primary"
      aria-label="Crea un nuovo ordine"
      onClick={() => navigate("/orders/create")}
      sx={{
        display: { xs: "inline-flex", sm: "none" },
        position: "fixed",
        right: 16,
        bottom: 80,
        zIndex: (theme) => theme.zIndex.speedDial,
      }}
    >
      <AddIcon />
    </Fab>
  );
};

export const OrderList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <List<WarehouseOrder>
        title="Ordini"
        actions={<OrderActions />}
        filters={orderFilters}
        sort={{ field: "date", order: "DESC" }}
        perPage={25}
        pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
        empty={
          <CustomEmpty
            resourceName="ordine"
            resourceGen="m"
            isCreate={!isMobile}
          />
        }
        emptyWhileLoading
      >
        {isMobile ? (
          <OrderMobileCards />
        ) : (
          <Datagrid bulkActionButtons={false} rowClick={false}>
            <TextField source="name" label="Nome" sortable />
            <FunctionField<WarehouseOrder>
              source="date"
              label="Data"
              sortable
              render={(record) => formatDate(record.date)}
            />
            <FunctionField<WarehouseOrder>
              source="priority"
              label="Priorità"
              sortable
              render={(record) => <PriorityChip priority={record.priority} />}
            />
            <FunctionField<WarehouseOrder>
              source="status"
              label="Stato"
              sortable
              render={(record) => <StatusChip status={record.status} />}
            />
            <EditButton label="Modifica" />
            <CustomDeleteButton resource="orders" titleField="name" />
          </Datagrid>
        )}
      </List>
      <MobileCreateFab />
    </>
  );
};
