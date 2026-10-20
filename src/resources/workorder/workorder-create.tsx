import { RegistryFormLayout } from "../../components/registry-layout";
import { registryFormSx } from "../../components/registry-styles";
import { Create, SimpleForm } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { WorkOrderForm } from "./workorder-form";

export const WorkOrderCreate = () => (
  <Create component="div" title="Nuova commessa" redirect="list">
    <SimpleForm sx={registryFormSx} toolbar={<CustomToolbar saveLabel="Crea commessa" />}>
      <RegistryFormLayout title="Nuova commessa" description="Inserisci le informazioni che identificano la commessa.">
        <WorkOrderForm />
      </RegistryFormLayout>
    </SimpleForm>
  </Create>
);
