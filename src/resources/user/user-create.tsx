import {
  Create,
  SimpleForm,
  useCreate,
  useNotify,
  usePermissions,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import { FieldValues } from "react-hook-form";
import { UsersForm } from "./user-form";
import { CustomToolbar } from "../../components/custom-toolbar";

export const UserCreate = () => {
  const [create] = useCreate();
  const notify = useNotify();
  const navigate = useNavigate();
  const { isLoading, permissions } = usePermissions();

  const createUser = (data: FieldValues) => {
    create(
      "user",
      { data: data },
      {
        onSuccess: () => {
          notify("Utente creato correttamente", {
            type: "success",
            autoHideDuration: 3000,
          });
          navigate("/user");
        },
        onError: () => {
          notify("Errore durante la creazione dell'utente", {
            type: "error",
            autoHideDuration: 3000,
          });
        },
      }
    );
  };

  if (isLoading) return null;
  return (
    <Create title="Nuovo utente">
      <SimpleForm
        toolbar={permissions === "ADMIN_ROLE" ? <CustomToolbar /> : false}
        onSubmit={createUser}
      >
        <UsersForm />
      </SimpleForm>
    </Create>
  );
};
