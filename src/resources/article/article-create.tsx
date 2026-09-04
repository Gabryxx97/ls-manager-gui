import { Create, SimpleForm } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { ArticleForm } from "./article-form";

export const ArticleCreate = () => (
  <Create title="Nuovo articolo" redirect="list">
    <SimpleForm toolbar={<CustomToolbar />}>
      <ArticleForm />
    </SimpleForm>
  </Create>
);
