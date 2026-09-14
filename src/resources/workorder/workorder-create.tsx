import { Create, SimpleForm } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { WorkOrderForm } from "./workorder-form";

export const WorkOrderCreate = () => (
  <Create title="Nuova commessa" redirect="list">
    <SimpleForm toolbar={<CustomToolbar />}>
      <WorkOrderForm />
    </SimpleForm>
  </Create>
);
