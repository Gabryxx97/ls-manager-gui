import { registryListSx } from "../../components/registry-styles";
import { RegistryCard } from "../../components/registry-layout";
import AddIcon from "@mui/icons-material/Add";
import {
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
  List,
  Pagination,
  RecordContextProvider,
  SearchInput,
  TextField,
  TopToolbar,
  useListContext,
  usePermissions,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import { CustomDeleteButton } from "../../components/custom-delete-button";
import { CustomEmpty } from "../../components/custom-empty";
import { WorkOrder } from "../../types";

const filters = [
  <SearchInput
    key="search"
    source="search"
    placeholder="Cerca commesse…"
    alwaysOn
  />,
];

const Actions = () => {
  const { permissions } = usePermissions();
  if (permissions !== "ADMIN_ROLE") return null;
  return (
    <TopToolbar sx={{ display: { xs: "none", sm: "flex" } }}>
      <CreateButton
        sx={{ display: { xs: "none", sm: "inline-flex" } }}
        variant="contained"
        label="Nuova commessa"
      />
    </TopToolbar>
  );
};

const MobileCards = () => {
  const { data = [] } = useListContext<WorkOrder>();
  const { permissions } = usePermissions();
  const canManage = permissions === "ADMIN_ROLE";
  return (
    <Stack spacing={1} component="section" aria-label="Elenco commesse">
      {data.map((workOrder) => (
        <RecordContextProvider key={workOrder.id} value={workOrder}>
          <RegistryCard
            editPath={canManage ? `/workorders/${workOrder.id}` : undefined}
            label={`Modifica commessa ${workOrder.name}`}
            >
            <Typography
              component="h2"
              variant="subtitle1"
              sx={{
                minWidth: 0,
                fontWeight: 700,
                lineHeight: 1.35,
                overflowWrap: "anywhere",
              }}
            >
              {workOrder.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.75,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {workOrder.description || "Nessuna descrizione"}
            </Typography>
          </RegistryCard>
        </RecordContextProvider>
      ))}
    </Stack>
  );
};

const MobileCreateFab = () => {
  const navigate = useNavigate();
  const { permissions } = usePermissions();
  if (permissions !== "ADMIN_ROLE") return null;
  return (
    <Fab
      color="primary"
      aria-label="Crea una nuova commessa"
      onClick={() => navigate("/workorders/create")}
      sx={{
        display: { xs: "inline-flex", sm: "none" },
        position: "fixed",
        right: 16,
        bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
        zIndex: (theme) => theme.zIndex.speedDial,
      }}
    >
      <AddIcon />
    </Fab>
  );
};

export const WorkOrderList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { permissions } = usePermissions();
  const canManage = permissions === "ADMIN_ROLE";
  return (
    <>
      <List<WorkOrder>
        title="Commesse"
        component="div"
        actions={<Actions />}
        filters={filters}
        sort={{ field: "name", order: "ASC" }}
        perPage={25}
        pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
        sx={registryListSx}
        empty={
          <CustomEmpty
            resourceName="commessa"
            resourceGen="f"
            isCreate={!isMobile && canManage}
          />
        }
        emptyWhileLoading
      >
        {isMobile ? (
          <MobileCards />
        ) : (
          <Datagrid bulkActionButtons={false} rowClick={false}>
            <TextField source="name" label="Nome" sortable />
            <TextField source="description" label="Descrizione" sortable />
            {canManage && <EditButton label="Modifica" />}
            {canManage && <CustomDeleteButton resource="workorders" titleField="name" />}
          </Datagrid>
        )}
      </List>
      <MobileCreateFab />
    </>
  );
};
