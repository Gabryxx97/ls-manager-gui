import {
  ChipField,
  CreateButton,
  Datagrid,
  EditButton,
  EmailField,
  FilterButton,
  List,
  SearchInput,
  TextField,
  TopToolbar,
  usePermissions,
} from "react-admin";
import { CustomEmpty } from "../../components/custom-empty";
import { CustomDeleteButton } from "../../components/custom-delete-button";

const UserActions = () => {
  const { isLoading, permissions } = usePermissions();

  if (isLoading) return null;
  return (
    <TopToolbar>
      <FilterButton />
      {permissions === "ADMIN_ROLE" && (
        <CreateButton variant="contained" label="Nuovo utente" />
      )}
    </TopToolbar>
  );
};

const userFilters = [
  <SearchInput variant="outlined" source="search" alwaysOn />,
];

export const UserList = () => {
  const { isLoading, permissions } = usePermissions();

  if (isLoading) return null;
  return (
    <List
      title="Utenti"
      actions={<UserActions />}
      filters={userFilters}
      empty={<CustomEmpty resourceName="utente" resourceGen="m" isCreate />}
    >
      <Datagrid bulkActionButtons={false} rowClick={false}>
        <TextField source="id" />
        <TextField source="name" label="Nome" />
        <TextField source="surname" label="Cognome" />
        <EmailField source="username" label="Email" />
        <ChipField source="role" label="Ruolo" />
        {permissions === "ADMIN_ROLE" && <EditButton />}
        {permissions === "ADMIN_ROLE" && (
          <CustomDeleteButton resource="user" titleField="username" />
        )}
      </Datagrid>
    </List>
  );
};
