import { RegistryFormLayout } from "../../components/registry-layout";
import { registryFormSx } from "../../components/registry-styles";
import { Edit, SimpleForm, useRecordContext } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { Article } from "../../types";
import { ArticleForm } from "./article-form";

const ArticleEditTitle = () => {
  const article = useRecordContext<Article>();
  return <>{article ? `Modifica ${article.sku}` : "Modifica articolo"}</>;
};

export const ArticleEdit = () => (
  <Edit component="div" title={<ArticleEditTitle />} mutationMode="pessimistic" redirect="list">
    <SimpleForm sx={registryFormSx} toolbar={<CustomToolbar saveLabel="Salva modifiche" />}>
      <RegistryFormLayout title={<ArticleEditTitle />} description="Gestisci i dati dell’articolo e le informazioni di magazzino.">
        <ArticleForm />
      </RegistryFormLayout>
    </SimpleForm>
  </Edit>
);
