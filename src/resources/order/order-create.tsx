import { Create, SimpleForm, useNotify, usePermissions, useRedirect } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { OrderForm } from "./order-form";
import { dateWithOffset, sanitizeOrder, validateOrderForm } from "./order-form-utils";

export const OrderCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const { permissions } = usePermissions();
  const minimumDate = dateWithOffset(permissions === "ADMIN_ROLE" ? 1 : 2);

  return (
    <Create
      title="Nuovo ordine"
      transform={sanitizeOrder}
      mutationOptions={{
        onSuccess: () => {
          notify("Ordine creato correttamente", { type: "success" });
          redirect("list", "orders");
        },
        onError: (error) => {
          notify(error instanceof Error ? error.message : "Impossibile creare l'ordine", {
            type: "error",
          });
        },
      }}
    >
      <SimpleForm
        mode="onChange"
        reValidateMode="onChange"
        validate={(values) => validateOrderForm(values, minimumDate)}
        toolbar={<CustomToolbar disableInvalid />}
        defaultValues={{
          priority: "STANDARD",
          date: minimumDate,
          details: [],
        }}
      >
        <OrderForm mobileHeader minimumDate={minimumDate} />
      </SimpleForm>
    </Create>
  );
};
