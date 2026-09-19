import AddIcon from "@mui/icons-material/Add";
import {
  Card,
  CardActions,
  CardContent,
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
    <TopToolbar sx={{ mt: -3 }}>
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
          <Card component="article" sx={{ overflow: "hidden" }}>
            <CardContent
              sx={{
                p: 1.5,
                "&:last-child": { pb: 1.5 },
              }}
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
              {canManage && <EditButton label="Modifica" />}
              {canManage && (
                <CustomDeleteButton
                  resource="workorders"
                  titleField="name"
                />
              )}
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
        bottom: 80,
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
