import AddIcon from "@mui/icons-material/Add";
import {
  Card,
  CardActions,
  CardContent,
  Fab,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  CreateButton,
  Datagrid,
  EditButton,
  FunctionField,
  List,
  Pagination,
  RecordContextProvider,
  SearchInput,
  TextField,
  TopToolbar,
  useListContext,
  usePermissions,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import { CustomDeleteButton } from "../../components/custom-delete-button";
import { CustomEmpty } from "../../components/custom-empty";
import { Article } from "../../types";
import { ArticleImportButton } from "./article-import";

const articleFilters = [
  <SearchInput
    key="search"
    source="search"
    placeholder="Cerca articoli…"
    alwaysOn
  />,
];

const ArticleActions = () => {
  const { permissions } = usePermissions();
  if (permissions !== "ADMIN_ROLE") return null;
  return (
    <TopToolbar>
      <ArticleImportButton />
      <CreateButton
        sx={{ display: { xs: "none", sm: "inline-flex" } }}
        variant="contained"
        label="Nuovo articolo"
      />
    </TopToolbar>
  );
};

const ArticleMobileCards = () => {
  const { data = [] } = useListContext<Article>();
  const { permissions } = usePermissions();
  const canManage = permissions === "ADMIN_ROLE";

  return (
    <Stack spacing={1.5} component="section" aria-label="Elenco articoli">
      {data.map((article) => (
        <RecordContextProvider key={article.id} value={article}>
          <Card component="article">
            <CardContent sx={{ pb: 1 }}>
              <Typography
                component="h2"
                variant="h3"
                sx={{ overflowWrap: "anywhere" }}
              >
                {article.description}
              </Typography>
              <Typography variant="caption" className="ls-mono" color="primary" sx={{ mt: 0.5 }}>
                {article.sku}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {article.category || "Senza categoria"} · {article.costCenter || "Senza centro di costo"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1.5,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                Ubicazione: {article.location || "—"} · Giacenza: {article.stockQuantity == null ? "—" : `${article.stockQuantity} ${article.unitOfMeasure || ""}`.trim()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Prezzo: {article.unitPrice == null ? "—" : `€ ${Number(article.unitPrice).toFixed(2)}`}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 1.5 }}>
              {canManage && <EditButton label="Modifica" />}
              {canManage && <CustomDeleteButton resource="articles" titleField="description" />}
            </CardActions>
          </Card>
        </RecordContextProvider>
      ))}
    </Stack>
  );
};

const MobileCreateFab = () => {
  const navigate = useNavigate();
  const { permissions } = usePermissions();
  if (permissions !== "ADMIN_ROLE") return null;

  return (
    <Fab
      color="primary"
      aria-label="Crea un nuovo articolo"
      onClick={() => navigate("/articles/create")}
      sx={{
        display: { xs: "inline-flex", sm: "none" },
        position: "fixed",
        right: 16,
        bottom: 80,
        zIndex: (theme) => theme.zIndex.speedDial,
      }}
    >
      <AddIcon />
    </Fab>
  );
};

export const ArticleList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { permissions } = usePermissions();
  const canManage = permissions === "ADMIN_ROLE";

  return (
    <>
      <List<Article>
        title="Articoli"
        actions={<ArticleActions />}
        filters={articleFilters}
        sort={{ field: "sku", order: "ASC" }}
        perPage={25}
        pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
        empty={
          <CustomEmpty
            resourceName="articolo"
            resourceGen="m"
            isCreate={!isMobile && canManage}
          />
        }
        emptyWhileLoading
      >
        {isMobile ? (
          <ArticleMobileCards />
        ) : (
          <Datagrid bulkActionButtons={false} rowClick={false}>
            <TextField source="sku" label="SKU" sortable />
            <TextField source="description" label="Descrizione" sortable />
            <TextField source="category" label="Categoria" sortable />
            <TextField source="costCenter" label="Centro di costo" sortable />
            <TextField source="unitOfMeasure" label="U.M." sortable />
            <TextField source="location" label="Ubicazione" sortable />
            <TextField source="stockQuantity" label="Giacenza" sortable />
            <FunctionField<Article>
              source="unitPrice"
              label="Prezzo"
              sortable
              render={(record) => record.unitPrice == null ? "—" : `€ ${Number(record.unitPrice).toFixed(2)}`}
            />
            {canManage && <EditButton label="Modifica" />}
            {canManage && <CustomDeleteButton resource="articles" titleField="description" />}
          </Datagrid>
        )}
      </List>
      <MobileCreateFab />
    </>
  );
};
