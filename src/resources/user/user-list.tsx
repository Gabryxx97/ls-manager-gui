import { registryListSx } from "../../components/registry-styles";
import { RegistryCard } from "../../components/registry-layout";
import AddIcon from "@mui/icons-material/Add";
import {
  Avatar,
  Box,
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
  ({
    ADMIN_ROLE: "Amministratore",
    OPERATOR_ROLE: "Operatore",
    WAREHOUSE_ROLE: "Magazziniere",
  })[role] ?? role;

const userFilters = [
  <SearchInput
    key="search"
    source="search"
    placeholder="Nome, cognome o username…"
    alwaysOn
  />,
];

const UserActions = () => (
  <TopToolbar sx={{ display: { xs: "none", sm: "flex" } }}>
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
            <RegistryCard
              editPath={`/users/${user.id}`}
              label={`Modifica utente ${user.username}`}
            >
              <Stack
                direction="row"
                spacing={1.25}
                sx={{ alignItems: "center" }}
              >
                <Avatar
                  aria-hidden="true"
                  sx={{
                    bgcolor: "primary.light",
                    color: "primary.dark",
                    width: 40,
                    height: 40,
                    fontSize: 16,
                  }}
                >
                  {(fullName || user.username)
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
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
                    {fullName || user.username}
                  </Typography>
                  <Chip
                    label={roleLabel(user.role)}
                    color="primary"
                    variant="outlined"
                    sx={{
                      mt: 0.75,
                      maxWidth: "100%",
                      height: "auto",
                      "& .MuiChip-label": {
                        py: 0.5,
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                      },
                    }}
                  />
                </Box>
              </Stack>
            </RegistryCard>
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
        bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
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
        sx={registryListSx}
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
            <TextField source="username" label="Username" sortable />
            <TextField source="name" label="Nome" sortable />
            <TextField source="surname" label="Cognome" sortable />
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
