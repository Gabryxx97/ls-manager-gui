import { RegistryFormLayout } from "../../components/registry-layout";
import { registryFormSx } from "../../components/registry-styles";
import { Create, SimpleForm } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { ArticleForm } from "./article-form";

export const ArticleCreate = () => (
  <Create component="div" title="Nuovo articolo" redirect="list">
    <SimpleForm sx={registryFormSx} toolbar={<CustomToolbar saveLabel="Crea articolo" />}>
      <RegistryFormLayout title="Nuovo articolo" description="Gestisci i dati dell’articolo e le informazioni di magazzino.">
        <ArticleForm />
      </RegistryFormLayout>
    </SimpleForm>
  </Create>
);
