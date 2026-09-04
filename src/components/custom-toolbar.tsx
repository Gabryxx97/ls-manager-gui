import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  SaveButton,
  Toolbar,
  useRedirect,
  useResourceContext,
} from "react-admin";
import { useFormState } from "react-hook-form";

export const CustomToolbar = ({ disableInvalid = false }: { disableInvalid?: boolean }) => {
  const redirect = useRedirect();
  const resource = useResourceContext();
  const { isValid } = useFormState();

  return (
    <Toolbar sx={{ gap: 1 }}>
      <SaveButton label="Salva" disabled={disableInvalid && !isValid} />
      <Button
        label="Annulla"
        startIcon={<CloseIcon />}
        onClick={() => redirect("list", resource)}
        variant="outlined"
      />
    </Toolbar>
  );
};
