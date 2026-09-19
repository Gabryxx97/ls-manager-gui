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

const roleLabel = (role: string) => ({
  ADMIN_ROLE: "Amministratore",
  OPERATOR_ROLE: "Operatore",
  WAREHOUSE_ROLE: "Magazziniere",
}[role] ?? role);

const userFilters = [
  <SearchInput
    key="search"
    source="search"
    placeholder="Nome, cognome o username…"
    alwaysOn
  />,
];

const UserActions = () => (
  <TopToolbar sx={{ mt: -3 }}>
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
    <Stack spacing={1} component="section" aria-label="Elenco utenti">
      {data.map((user) => {
        const fullName = `${user.name ?? ""} ${user.surname ?? ""}`.trim();
        return (
          <RecordContextProvider key={user.id} value={user}>
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
                  <Typography
                    variant="caption"
                    className="ls-mono"
                    color="text.secondary"
                    sx={{ overflowWrap: "anywhere" }}
                  >
                    {user.username}
                  </Typography>
                  <Chip
                    label={roleLabel(user.role)}
                    color="primary"
                    variant="outlined"
                    sx={{ ml: "auto", flexShrink: 0 }}
                  />
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
                  {fullName || user.username}
                </Typography>
                <Typography
                  variant="caption"
                  className="ls-mono"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.75 }}
                >
                  ID {user.id}
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
        component="div"
        actions={<UserActions />}
        filters={userFilters}
        sort={{ field: "username", order: "ASC" }}
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
                <Chip
                  label={roleLabel(record.role)}
                  color="primary"
                  variant="outlined"
                />
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
