import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  SaveButton,
  Toolbar,
  useRedirect,
  useResourceContext,
  useGetMany,
} from "react-admin";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { Typography } from "@mui/material";
import { Article } from "../types";

export const CustomToolbar = ({ disableInvalid = false }: { disableInvalid?: boolean }) => {
  const redirect = useRedirect();
  const resource = useResourceContext();
  const { isValid } = useFormState();
  const { control } = useFormContext();
  const details = useWatch({ control, name: "details" }) ?? [];
  const ids = details.map((detail: { articleId?: number }) => detail.articleId).filter((id: number | undefined): id is number => id != null);
  const { data: articles = [] } = useGetMany<Article>("articles", { ids }, { enabled: resource === "orders" && ids.length > 0 });
  const byId = new Map(articles.map((article) => [article.id, article]));
  const total = details.every((detail: { articleId?: number; quantity?: number; unitPrice?: number | string | null }) => (detail.unitPrice ?? byId.get(detail.articleId ?? -1)?.unitPrice) != null)
    ? details.reduce((sum: number, detail: { articleId?: number; quantity?: number; unitPrice?: number | string | null }) => sum + Number(detail.unitPrice ?? byId.get(detail.articleId ?? -1)?.unitPrice ?? 0) * Number(detail.quantity ?? 0), 0)
    : undefined;

  return (
    <Toolbar sx={{ gap: 1, "@media (max-width: 599px)": { position: "fixed", left: 0, right: 0, bottom: "calc(64px + env(safe-area-inset-bottom, 0px))", zIndex: 1300, px: 2, py: 1, bgcolor: "background.paper", boxShadow: "0 -4px 16px rgba(0,0,0,.08)", flexDirection: "column" } }}>
      {resource === "orders" && <Typography sx={{ display: { xs: "block", sm: "none" }, width: "100%", fontSize: 13 }}><strong>{details.length}</strong> {details.length === 1 ? "Articolo" : "Articoli"} · <strong>{details.reduce((sum: number, detail: { quantity?: number }) => sum + Number(detail.quantity ?? 0), 0)}</strong> Pezzi <span style={{ float: "right" }}>Totale: <strong>{total == null ? "—" : `€ ${total.toFixed(2)}`}</strong></span></Typography>}
      <SaveButton label="Salva ordine" disabled={disableInvalid && !isValid} sx={{ "@media (max-width: 599px)": { width: "100%" } }} />
      <Button
        label="Annulla"
        startIcon={<CloseIcon />}
        onClick={() => redirect("list", resource)}
        variant="outlined"
        sx={{ "@media (max-width: 599px)": { display: "none" } }}
      />
    </Toolbar>
  );
};
