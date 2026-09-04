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
  List,
  Pagination,
  RecordContextProvider,
  SearchInput,
  TextField,
  TopToolbar,
  useListContext,
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

const ArticleActions = () => (
  <TopToolbar>
    <ArticleImportButton />
    <CreateButton
      sx={{ display: { xs: "none", sm: "inline-flex" } }}
      variant="contained"
      label="Nuovo articolo"
    />
  </TopToolbar>
);

const ArticleMobileCards = () => {
  const { data = [] } = useListContext<Article>();

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
                {article.name}
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
                {article.description || "Nessuna descrizione"}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 1.5 }}>
              <EditButton label="Modifica" />
              <CustomDeleteButton resource="articles" titleField="name" />
            </CardActions>
          </Card>
        </RecordContextProvider>
      ))}
    </Stack>
  );
};

const MobileCreateFab = () => {
  const navigate = useNavigate();

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

  return (
    <>
      <List<Article>
        title="Articoli"
        actions={<ArticleActions />}
        filters={articleFilters}
        sort={{ field: "name", order: "ASC" }}
        perPage={25}
        pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
        empty={
          <CustomEmpty
            resourceName="articolo"
            resourceGen="m"
            isCreate={!isMobile}
          />
        }
        emptyWhileLoading
      >
        {isMobile ? (
          <ArticleMobileCards />
        ) : (
          <Datagrid bulkActionButtons={false} rowClick={false}>
            <TextField source="name" label="Nome" sortable />
            <TextField source="description" label="Descrizione" sortable />
            <EditButton label="Modifica" />
            <CustomDeleteButton resource="articles" titleField="name" />
          </Datagrid>
        )}
      </List>
      <MobileCreateFab />
    </>
  );
};
