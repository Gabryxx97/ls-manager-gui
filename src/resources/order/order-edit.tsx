import { Edit, SimpleForm, useNotify, usePermissions, useRecordContext, useRedirect } from "react-admin";
import { WarehouseOrder } from "../../types";
import { CustomToolbar } from "../../components/custom-toolbar";
import { OrderForm } from "./order-form";
import { sanitizeOrder, validateOrderForm } from "./order-form-utils";
import { OrderWorkflow } from "./order-workflow";
import { OrderExportButton } from "./order-export";

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
      <OrderEditContent />
    </Edit>
  );
};

const OrderEditContent = () => {
  const record = useRecordContext<WarehouseOrder>();
  const { permissions } = usePermissions();
  if (!record) return null;

  const structurallyEditable = record.status === "PROCESSING"
    && !record.takenInChargeAt
    && permissions !== "WAREHOUSE_ROLE";

  if (!structurallyEditable) return <OrderWorkflow order={record} />;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <OrderExportButton order={record} />
      </div>
      <SimpleForm
        mode="onChange"
        reValidateMode="onChange"
        validate={validateOrderForm}
        toolbar={<CustomToolbar disableInvalid />}
      >
        <OrderForm />
      </SimpleForm>
    </>
  );
};
