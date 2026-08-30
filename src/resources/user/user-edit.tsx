import {
  Edit,
  SimpleForm,
  useCreate,
  useNotify,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import { FieldValues } from "react-hook-form";
import { UsersForm } from "./user-form";
import { User } from "../../types";
import { CustomToolbar } from "../../components/custom-toolbar";

const UserEditTitle = () => {
  const record = useRecordContext<User>();
  return <>{record?.username}</>;
};

export const UserEdit = () => {
  const [create] = useCreate();
  const notify = useNotify();
  const navigate = useNavigate();
  const { isLoading, permissions } = usePermissions();

  const updateUser = (data: FieldValues) => {
    create(
      "user",
      { data: data },
      {
        onSuccess: () => {
          notify("Utente modificato correttamente", {
            type: "success",
            autoHideDuration: 3000,
          });
          navigate("/user");
        },
        onError: () => {
          notify("Errore durante la modifica dell'utente", {
            type: "error",
            autoHideDuration: 3000,
          });
        },
      }
    );
  };

  if (isLoading) return null;
  return (
    <Edit title={<UserEditTitle />}>
      <SimpleForm
        toolbar={permissions === "ADMIN_ROLE" ? <CustomToolbar /> : false}
        onSubmit={updateUser}
      >
        <UsersForm />
      </SimpleForm>
    </Edit>
  );
};
