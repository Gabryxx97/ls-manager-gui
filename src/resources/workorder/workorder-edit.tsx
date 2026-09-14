import { Edit, SimpleForm, useRecordContext } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { WorkOrder } from "../../types";
import { WorkOrderForm } from "./workorder-form";

const WorkOrderEditTitle = () => {
  const workOrder = useRecordContext<WorkOrder>();
  return <>{workOrder ? `Modifica ${workOrder.name}` : "Modifica commessa"}</>;
};

export const WorkOrderEdit = () => (
  <Edit title={<WorkOrderEditTitle />} mutationMode="pessimistic" redirect="list">
    <SimpleForm toolbar={<CustomToolbar />}>
      <WorkOrderForm />
    </SimpleForm>
  </Edit>
);
