import { Edit, SimpleForm, useNotify, useRecordContext, useRedirect } from "react-admin";
import { WarehouseOrder } from "../../types";
import { CustomToolbar } from "../../components/custom-toolbar";
import { OrderForm } from "./order-form";
import { sanitizeOrder, validateOrderForm } from "./order-form-utils";

const OrderEditTitle = () => {
  const record = useRecordContext<WarehouseOrder>();
  return <>{record ? `Modifica ${record.name}` : "Modifica ordine"}</>;
};

export const OrderEdit = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <Edit
      title={<OrderEditTitle />}
      mutationMode="pessimistic"
      transform={sanitizeOrder}
      mutationOptions={{
        onSuccess: () => {
          notify("Ordine modificato correttamente", { type: "success" });
          redirect("list", "orders");
        },
        onError: (error) => {
          notify(error instanceof Error ? error.message : "Impossibile modificare l'ordine", {
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
      >
        <OrderForm />
      </SimpleForm>
    </Edit>
  );
};
