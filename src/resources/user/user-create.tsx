import { RegistryFormLayout } from "../../components/registry-layout";
import { registryFormSx } from "../../components/registry-styles";
import { Create, SimpleForm, useNotify, useRedirect } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { UsersForm } from "./user-form";
import { sanitizeUser, validateUserForm } from "./user-form-utils";

export const UserCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <Create
      component="div"
      title="Nuovo utente"
      transform={sanitizeUser}
      mutationOptions={{
        onSuccess: () => {
          notify("Utente creato correttamente", { type: "success" });
          redirect("list", "users");
        },
        onError: (error) => {
          notify(error instanceof Error ? error.message : "Impossibile creare l'utente", {
            type: "error",
          });
        },
      }}
    >
      <SimpleForm sx={registryFormSx} toolbar={<CustomToolbar saveLabel="Crea utente" />} validate={validateUserForm(false)}>
        <RegistryFormLayout title="Nuovo utente" description="Gestisci il profilo, il ruolo e le credenziali di accesso.">
          <UsersForm />
        </RegistryFormLayout>
      </SimpleForm>
    </Create>
  );
};
