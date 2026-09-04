import {
  Button,
  Confirm,
  useDelete,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { Typography } from "@mui/material";

interface CustomDeleteButtonProps {
  resource: string;
  titleField: string;
}

export const CustomDeleteButton = ({
  resource,
  titleField,
}: CustomDeleteButtonProps) => {
  const record = useRecordContext();
  const [deleteOne] = useDelete();
  const notify = useNotify();
  const refresh = useRefresh();

  const [deletePopup, setDeletePopup] = useState(false);

  const handleOpenDeletePopup = () => {
    setDeletePopup(true);
  };

  const handleCloseDeletePopup = () => {
    setDeletePopup(false);
  };

  const deleteRecord = () => {
    deleteOne(
      resource,
      { id: record?.id, previousData: record },
      {
        onSuccess: () => {
          notify("Elemento cancellato correttamente", {
            type: "success",
            autoHideDuration: 3000,
          });
          handleCloseDeletePopup();
          refresh();
        },
        onError: (error) => {
          notify(
            error instanceof Error
              ? error.message
              : "Errore durante la cancellazione dell'elemento",
            {
            type: "error",
            autoHideDuration: 3000,
            },
          );
        },
      }
    );
  };

  if (!record) return null;

  return (
    <>
      <Button
        startIcon={<DeleteIcon />}
        color="error"
        label="Cancella"
        onClick={handleOpenDeletePopup}
      />
      <Confirm
        title={
          record[titleField]
            ? `Cancellare ${record[titleField]}`
            : "Cancellare elemento"
        }
        isOpen={deletePopup}
        onClose={handleCloseDeletePopup}
        onConfirm={deleteRecord}
        content={
          <Typography>
            Questa operazione non può essere annullata. Vuoi continuare?
          </Typography>
        }
      />
    </>
  );
};
