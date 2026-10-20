import { RegistryFormLayout } from "../../components/registry-layout";
import { registryFormSx } from "../../components/registry-styles";
import {
  Edit,
  SimpleForm,
  useNotify,
  useRecordContext,
  useRedirect,
} from "react-admin";
import { User } from "../../types";
import { CustomToolbar } from "../../components/custom-toolbar";
import { UsersForm } from "./user-form";
import { sanitizeUser, validateUserForm } from "./user-form-utils";

const UserEditTitle = () => {
  const record = useRecordContext<User>();
  return <>{record ? `Modifica ${record.username}` : "Modifica utente"}</>;
};

export const UserEdit = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <Edit
      component="div"
      title={<UserEditTitle />}
      mutationMode="pessimistic"
      transform={sanitizeUser}
      mutationOptions={{
        onSuccess: () => {
          notify("Utente modificato correttamente", { type: "success" });
          redirect("list", "users");
        },
        onError: (error) => {
          notify(error instanceof Error ? error.message : "Impossibile modificare l'utente", {
            type: "error",
          });
        },
      }}
    >
      <SimpleForm sx={registryFormSx} toolbar={<CustomToolbar saveLabel="Salva modifiche" />} validate={validateUserForm(true)}>
        <RegistryFormLayout title={<UserEditTitle />} description="Gestisci il profilo, il ruolo e le credenziali di accesso.">
          <UsersForm isEdit />
        </RegistryFormLayout>
      </SimpleForm>
    </Edit>
  );
};
