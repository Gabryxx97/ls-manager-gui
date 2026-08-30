import { Button, SaveButton, Toolbar } from "react-admin";
import CloseIcon from "@mui/icons-material/Close";

interface PopupToolbarProps {
  onClose: () => void;
}

export const PopupToolbar = ({ onClose }: PopupToolbarProps) => {
  return (
    <Toolbar>
      <Button
        startIcon={<CloseIcon />}
        label="Chiudi"
        onClick={onClose}
        variant="outlined"
        size="medium"
      />
      <div style={{ flexGrow: 1 }} />
      <SaveButton label="Conferma" alwaysEnable />
    </Toolbar>
  );
};
