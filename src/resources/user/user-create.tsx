import { Create, SimpleForm, useNotify, useRedirect } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { UsersForm } from "./user-form";
import { sanitizeUser, validateUserForm } from "./user-form-utils";

export const UserCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <Create
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
      <SimpleForm toolbar={<CustomToolbar />} validate={validateUserForm(false)}>
        <UsersForm />
      </SimpleForm>
    </Create>
  );
};
