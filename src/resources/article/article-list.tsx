import { registryListSx } from "../../components/registry-styles";
import { RegistryCard } from "../../components/registry-layout";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Chip,
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
    <Stack spacing={1} component="section" aria-label="Elenco articoli">
      {data.map((article) => (
        <RecordContextProvider key={article.id} value={article}>
          <RegistryCard
            editPath={canManage ? `/articles/${article.id}` : undefined}
            label={`Modifica articolo ${article.sku}`}
            >
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
                columnGap: 1,
                rowGap: 0.75,
              }}
            >
              <Typography
                variant="caption"
                className="ls-mono"
                color="primary"
                sx={{ overflowWrap: "anywhere" }}
              >
                {article.sku}
              </Typography>
              <Chip variant="outlined" label={article.category || "Senza categoria"} sx={{ maxWidth: "100%", height: "auto", "& .MuiChip-label": { py: 0.5, whiteSpace: "normal", overflowWrap: "anywhere" } }} />
              <Typography variant="caption" color="text.secondary" sx={{ width: "100%", overflowWrap: "anywhere" }}>
                Centro di costo: {article.costCenter || "—"}
              </Typography>
            </Stack>
            <Typography
              component="h2"
              variant="subtitle1"
              sx={{
                mt: 1,
                minWidth: 0,
                fontWeight: 700,
                lineHeight: 1.35,
                overflowWrap: "anywhere",
              }}
            >
              {article.description}
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 1.5, mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
              <Box sx={{ gridColumn: "1 / -1", minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">Ubicazione</Typography>
                <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{article.location || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Giacenza</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
                  {article.stockQuantity == null ? "—" : [article.stockQuantity, article.unitOfMeasure].filter(value => value != null && value !== "").join(" ")}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Prezzo unitario</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {article.unitPrice == null ? "—" : new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(Number(article.unitPrice))}
                </Typography>
              </Box>
            </Box>
          </RegistryCard>
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
        bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
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
        component="div"
        actions={<ArticleActions />}
        filters={articleFilters}
        sort={{ field: "sku", order: "ASC" }}
        perPage={25}
        pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
        sx={registryListSx}
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
            {canManage && (
              <CustomDeleteButton
                resource="articles"
                titleField="description"
              />
            )}
          </Datagrid>
        )}
      </List>
      <MobileCreateFab />
    </>
  );
};
