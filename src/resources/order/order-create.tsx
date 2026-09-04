import { Create, SimpleForm, useNotify, useRedirect } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { OrderForm } from "./order-form";
import { sanitizeOrder, validateOrderForm } from "./order-form-utils";

export const OrderCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();

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
        validate={validateOrderForm}
        toolbar={<CustomToolbar disableInvalid />}
        defaultValues={{
          status: "DRAFT",
          priority: "STANDARD",
          details: [{ quantity: 1 }],
        }}
      >
        <OrderForm />
      </SimpleForm>
    </Create>
  );
};
