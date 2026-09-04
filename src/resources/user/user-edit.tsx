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
      <SimpleForm toolbar={<CustomToolbar />} validate={validateUserForm(true)}>
        <UsersForm isEdit />
      </SimpleForm>
    </Edit>
  );
};
