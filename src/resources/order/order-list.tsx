import AddIcon from "@mui/icons-material/Add";
import {
  Box,
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
  FilterButton,
  FunctionField,
  List,
  Pagination,
  RecordContextProvider,
  SearchInput,
  SelectInput,
  TextField,
  TopToolbar,
  useListContext,
  usePermissions,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import { CustomDeleteButton } from "../../components/custom-delete-button";
import { CustomEmpty } from "../../components/custom-empty";
import {
  OrderCategory,
  OrderPriority,
  OrderStatus,
  WarehouseOrder,
} from "../../types";
import {
  AssignedWarehouse,
  OrderAssignmentActions,
} from "./order-assignment-actions";

const statusChoices = [
  { id: "PROCESSING", name: "In lavorazione" },
  { id: "COMPLETED", name: "Completato" },
  { id: "CANCELED", name: "Annullato" },
];

const categoryPresentation: Record<OrderCategory, string> = {
  HYDRAULIC: "Idrico",
  ELECTRICAL: "Elettrico",
  CONSTRUCTION_CARPENTRY: "Edile - carpenteria",
  HARDWARE_MISC: "Ferramenta e varie",
  CLOTHING: "Vestiario",
};

const statusPresentation: Record<
  OrderStatus,
  { label: string; color: ChipProps["color"] }
> = {
  PROCESSING: { label: "In lavorazione", color: "info" },
  COMPLETED: { label: "Completato", color: "success" },
  CANCELED: { label: "Annullato", color: "error" },
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

const createOrderFilters = (secondaryFiltersAlwaysOn: boolean) => [
  <SearchInput key="search" source="search" alwaysOn />,
  <SelectInput
    key="status"
    source="status"
    label="Stato"
    choices={statusChoices}
    alwaysOn={secondaryFiltersAlwaysOn}
  />,
];

const mobileOrderFilters = createOrderFilters(false);
const desktopOrderFilters = createOrderFilters(true);

const OrderActions = () => {
  const { permissions } = usePermissions();
  return (
    <TopToolbar sx={{ mt: -3 }}>
      <FilterButton disableSaveQuery />
      {permissions !== "WAREHOUSE_ROLE" && (
        <CreateButton
          sx={{ display: { xs: "none", sm: "inline-flex" } }}
          variant="contained"
          label="Nuovo ordine"
        />
      )}
    </TopToolbar>
  );
};

const OrderRowActions = ({ order }: { order: WarehouseOrder }) => {
  const { permissions } = usePermissions();
  const canDelete =
    permissions !== "WAREHOUSE_ROLE" &&
    !order.takenInChargeAt &&
    order.status === "PROCESSING";
  return (
    <>
      <EditButton label="Apri" />
      {canDelete && <CustomDeleteButton resource="orders" titleField="name" />}
    </>
  );
};

const OrderMobileCards = () => {
  const { data = [] } = useListContext<WarehouseOrder>();

  return (
    <Stack spacing={1} component="section" aria-label="Elenco ordini">
      {data.map((order) => (
        <RecordContextProvider key={order.id} value={order}>
          <Card component="article" sx={{ overflow: "hidden" }}>
            <CardContent
              sx={{
                p: 1.5,
                "&:last-child": { pb: 1.5 },
              }}
            >
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  flexWrap: "wrap",
                  columnGap: 1,
                  rowGap: 0.75,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {formatDate(order.date)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.category
                    ? categoryPresentation[order.category]
                    : "Senza categoria"}
                </Typography>
                <Box sx={{ ml: "auto", flexShrink: 0 }}>
                  <StatusChip status={order.status} />
                </Box>
              </Stack>
              <Typography
                component="h2"
                variant="subtitle1"
                sx={{
                  mt: 1,
                  minWidth: 0,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  overflowWrap: "anywhere",
                }}
              >
                {order.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75 }}
              >
                Magazziniere: <AssignedWarehouse order={order} />
              </Typography>
            </CardContent>
            <CardActions
              sx={{
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: 0.5,
                px: 1.5,
                py: 1,
                borderTop: "1px solid",
                borderColor: "divider",
                backgroundColor: "grey.50",
                "& > *": { m: "0 !important" },
              }}
            >
              <OrderAssignmentActions order={order} />
              <OrderRowActions order={order} />
            </CardActions>
          </Card>
        </RecordContextProvider>
      ))}
    </Stack>
  );
};

const MobileCreateFab = () => {
  const navigate = useNavigate();
  const { permissions } = usePermissions();
  if (permissions === "WAREHOUSE_ROLE") return null;
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
        component="div"
        actions={<OrderActions />}
        filters={isMobile ? mobileOrderFilters : desktopOrderFilters}
        sort={{ field: "date", order: "DESC" }}
        perPage={25}
        pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
        sx={{
          "& .RaList-actions": {
            mb: { xs: 1.5, sm: 0 },
            gap: { xs: 1, sm: 0 },
            alignItems: { xs: "stretch", sm: "flex-end" },
            backgroundColor: "transparent",
          },
          "& .RaTopToolbar-root": {
            width: { xs: "100%", sm: "auto" },
            minHeight: { xs: 40, sm: "auto" },
            mt: { xs: -1, sm: 0 },
          },
          "& .RaListToolbar-root, & .RaTopToolbar-root": {
            backgroundColor: { xs: "transparent !important", sm: "initial" },
            boxShadow: { xs: "none", sm: "initial" },
          },
          "& .RaFilterButton-root .MuiIconButton-root": {
            backgroundColor: "transparent",
          },
          "& .RaFilterForm-root": {
            gap: { xs: 1, sm: 0 },
            paddingBottom: { xs: 0, sm: 0.5 },
          },
          "& .RaFilterForm-filterFormInput .MuiFormControl-root": {
            width: { xs: "100%", sm: "auto" },
            mt: { xs: 0, sm: 1 },
          },
          "& .RaFilterForm-filterFormInput .RaFilterFormInput-spacer": {
            width: { xs: 0, sm: 16 },
          },
          "& .MuiToolbar-root": {
            backgroundColor: "transparent",
          },
        }}
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
            <FunctionField<WarehouseOrder>
              label="Magazziniere"
              render={(record) => <AssignedWarehouse order={record} />}
            />
            <FunctionField<WarehouseOrder>
              label="Presa in carico"
              render={(record) => <OrderAssignmentActions order={record} />}
            />
            <FunctionField<WarehouseOrder>
              label="Azioni"
              render={(record) => <OrderRowActions order={record} />}
            />
          </Datagrid>
        )}
      </List>
      <MobileCreateFab />
    </>
  );
};
