import AddIcon from "@mui/icons-material/Add";
import {
  Card,
  CardActions,
  CardContent,
  Chip,
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
  TextField,
  TopToolbar,
  useListContext,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import { CustomDeleteButton } from "../../components/custom-delete-button";
import { CustomEmpty } from "../../components/custom-empty";
import { User } from "../../types";

const roleLabel = (role: string) =>
  role === "ADMIN_ROLE" ? "Amministratore" : "Utente";

const userFilters = [
  <SearchInput
    key="search"
    source="search"
    label="Cerca utenti"
    placeholder="Nome, cognome o username…"
    alwaysOn
  />,
];

const UserActions = () => (
  <TopToolbar>
    <CreateButton
      sx={{ display: { xs: "none", sm: "inline-flex" } }}
      variant="contained"
      label="Nuovo utente"
    />
  </TopToolbar>
);

const UserMobileCards = () => {
  const { data = [] } = useListContext<User>();

  return (
    <Stack spacing={1.5} component="section" aria-label="Elenco utenti">
      {data.map((user) => {
        const fullName = `${user.name ?? ""} ${user.surname ?? ""}`.trim();
        return (
          <RecordContextProvider key={user.id} value={user}>
            <Card component="article">
              <CardContent sx={{ pb: 1 }}>
                <Typography component="h2" variant="h3" sx={{ overflowWrap: "anywhere" }}>
                  {fullName || user.username}
                </Typography>
                {fullName && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {user.username}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: "center" }}>
                  <Chip label={roleLabel(user.role)} color="primary" variant="outlined" />
                  <Typography variant="caption" className="ls-mono" color="text.secondary">
                    ID {user.id}
                  </Typography>
                </Stack>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 1.5 }}>
                <EditButton label="Modifica" />
                <CustomDeleteButton resource="users" titleField="username" />
              </CardActions>
            </Card>
          </RecordContextProvider>
        );
      })}
    </Stack>
  );
};

const MobileCreateFab = () => {
  const navigate = useNavigate();
  return (
    <Fab
      color="primary"
      aria-label="Crea un nuovo utente"
      onClick={() => navigate("/users/create")}
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

export const UserList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <List<User>
        title="Utenti"
        actions={<UserActions />}
        filters={userFilters}
        sort={{ field: "username", order: "ASC" }}
        perPage={25}
        pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
        empty={
          <CustomEmpty
            resourceName="utente"
            resourceGen="m"
            isCreate={!isMobile}
          />
        }
        emptyWhileLoading
      >
        {isMobile ? (
          <UserMobileCards />
        ) : (
          <Datagrid bulkActionButtons={false} rowClick={false}>
            <TextField source="id" label="ID" sortable />
            <TextField source="name" label="Nome" sortable />
            <TextField source="surname" label="Cognome" sortable />
            <TextField source="username" label="Username" sortable />
            <FunctionField<User>
              source="role"
              label="Ruolo"
              sortable
              render={(record) => (
                <Chip label={roleLabel(record.role)} color="primary" variant="outlined" />
              )}
            />
            <EditButton label="Modifica" />
            <CustomDeleteButton resource="users" titleField="username" />
          </Datagrid>
        )}
      </List>
      <MobileCreateFab />
    </>
  );
};
