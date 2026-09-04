import { Edit, SimpleForm, useRecordContext } from "react-admin";
import { CustomToolbar } from "../../components/custom-toolbar";
import { Article } from "../../types";
import { ArticleForm } from "./article-form";

const ArticleEditTitle = () => {
  const article = useRecordContext<Article>();
  return <>{article ? `Modifica ${article.name}` : "Modifica articolo"}</>;
};

export const ArticleEdit = () => (
  <Edit title={<ArticleEditTitle />} mutationMode="pessimistic" redirect="list">
    <SimpleForm toolbar={<CustomToolbar />}>
      <ArticleForm />
    </SimpleForm>
  </Edit>
);
