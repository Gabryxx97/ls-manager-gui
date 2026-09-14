import AddIcon from "@mui/icons-material/Add";
import { Card, CardActions, CardContent, Fab, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CreateButton, Datagrid, EditButton, List, Pagination, RecordContextProvider, SearchInput, TextField, TopToolbar, useListContext } from "react-admin";
import { useNavigate } from "react-router-dom";
import { CustomDeleteButton } from "../../components/custom-delete-button";
import { CustomEmpty } from "../../components/custom-empty";
import { WorkOrder } from "../../types";

const filters = [
  <SearchInput key="search" source="search" placeholder="Cerca commesse…" alwaysOn />,
];

const Actions = () => (
  <TopToolbar>
    <CreateButton sx={{ display: { xs: "none", sm: "inline-flex" } }} variant="contained" label="Nuova commessa" />
  </TopToolbar>
);

const MobileCards = () => {
  const { data = [] } = useListContext<WorkOrder>();
  return (
    <Stack spacing={1.5} component="section" aria-label="Elenco commesse">
      {data.map((workOrder) => (
        <RecordContextProvider key={workOrder.id} value={workOrder}>
          <Card component="article">
            <CardContent sx={{ pb: 1 }}>
              <Typography component="h2" variant="h3" sx={{ overflowWrap: "anywhere" }}>
                {workOrder.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {workOrder.description || "Nessuna descrizione"}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 1.5 }}>
              <EditButton label="Modifica" />
              <CustomDeleteButton resource="workorders" titleField="name" />
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
    <Fab color="primary" aria-label="Crea una nuova commessa" onClick={() => navigate("/workorders/create")}
      sx={{ display: { xs: "inline-flex", sm: "none" }, position: "fixed", right: 16, bottom: 80, zIndex: (theme) => theme.zIndex.speedDial }}>
      <AddIcon />
    </Fab>
  );
};

export const WorkOrderList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <List<WorkOrder> title="Commesse" actions={<Actions />} filters={filters} sort={{ field: "name", order: "ASC" }} perPage={25}
        pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
        empty={<CustomEmpty resourceName="commessa" resourceGen="f" isCreate={!isMobile} />} emptyWhileLoading>
        {isMobile ? <MobileCards /> : (
          <Datagrid bulkActionButtons={false} rowClick={false}>
            <TextField source="name" label="Nome" sortable />
            <TextField source="description" label="Descrizione" sortable />
            <EditButton label="Modifica" />
            <CustomDeleteButton resource="workorders" titleField="name" />
          </Datagrid>
        )}
      </List>
      <MobileCreateFab />
    </>
  );
};
