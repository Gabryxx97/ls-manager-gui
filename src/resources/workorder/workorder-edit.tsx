import { RegistryFormLayout } from "../../components/registry-layout";
import { registryFormSx } from "../../components/registry-styles";
import { Edit, SimpleForm, useRecordContext } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { WorkOrder } from "../../types";
import { WorkOrderForm } from "./workorder-form";

const WorkOrderEditTitle = () => {
  const workOrder = useRecordContext<WorkOrder>();
  return <>{workOrder ? `Modifica ${workOrder.name}` : "Modifica commessa"}</>;
};

export const WorkOrderEdit = () => (
  <Edit component="div" title={<WorkOrderEditTitle />} mutationMode="pessimistic" redirect="list">
    <SimpleForm sx={registryFormSx} toolbar={<CustomToolbar saveLabel="Salva modifiche" />}>
      <RegistryFormLayout title={<WorkOrderEditTitle />} description="Inserisci le informazioni che identificano la commessa.">
        <WorkOrderForm />
      </RegistryFormLayout>
    </SimpleForm>
  </Edit>
);
