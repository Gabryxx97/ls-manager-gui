import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import {
  Create,
  SaveButton,
  SimpleForm,
  useNotify,
  usePermissions,
  useRedirect,
} from "react-admin";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import {
  OrderDetailsSection,
  OrderInformationFields,
  OrderReview,
} from "./order-form";
import {
  OrderFormData,
  dateWithOffset,
  formatMoney,
  sanitizeOrder,
  validateOrderForm,
} from "./order-form-utils";

const steps = ["Informazioni", "Articoli", "Riepilogo"];

const WizardProgress = ({ activeStep }: { activeStep: number }) => (
  <Paper
    component="nav"
    aria-label="Avanzamento creazione ordine"
    variant="outlined"
    sx={{ px: { xs: 1, sm: 3 }, py: 2, borderRadius: 3 }}
  >
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel
            slotProps={{
              label: { sx: { fontSize: { xs: 12, sm: 14 }, mt: 0.5 } },
            }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  </Paper>
);

const WizardActions = ({
  activeStep,
  onBack,
  onNext,
  onCancel,
}: {
  activeStep: number;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
}) => {
  const { control } = useFormContext<OrderFormData>();
  const { isSubmitting } = useFormState();
  const details = useWatch({ control, name: "details" }) ?? [];
  const totalPieces = details.reduce(
    (sum, detail) => sum + Number(detail?.quantity ?? 0),
    0,
  );
  const total = details.every((detail) => detail?.unitPrice != null)
    ? details.reduce(
        (sum, detail) =>
          sum + Number(detail?.unitPrice) * Number(detail?.quantity ?? 0),
        0,
      )
    : undefined;

  return (
    <Paper
      component="footer"
      square
      sx={{
        position: { xs: "fixed", sm: "sticky" },
        left: 0,
        right: 0,
        bottom: { xs: "calc(56px + env(safe-area-inset-bottom, 0px))", sm: 0 },
        zIndex: 1200,
        mt: 2,
        mx: { xs: 0, sm: "auto" },
        px: { xs: 2, sm: 3 },
        py: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
        boxShadow: "0 -6px 24px rgba(26, 28, 28, 0.09)",
      }}
    >
      {activeStep > 0 && (
        <Stack
          direction="row"
          sx={{
            display: { xs: "flex", sm: "none" },
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {details.length} {details.length === 1 ? "articolo" : "articoli"} ·{" "}
            {totalPieces} pezzi
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Totale {formatMoney(total)}
          </Typography>
        </Stack>
      )}
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Button
          type="button"
          color="error"
          startIcon={<CloseIcon />}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annulla
        </Button>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Tooltip title="Indietro">
            <span>
              <IconButton
                type="button"
                aria-label="Torna al passaggio precedente"
                onClick={onBack}
                disabled={activeStep === 0 || isSubmitting}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </span>
          </Tooltip>
          {activeStep < steps.length - 1 ? (
            <Tooltip title="Avanti">
              <IconButton
                type="button"
                aria-label="Vai al passaggio successivo"
                onClick={onNext}
                sx={{
                  color: "primary.contrastText",
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <SaveButton
              label="Crea ordine"
              icon={<CheckIcon />}
              disabled={isSubmitting}
              sx={{ minWidth: { sm: 180 } }}
            />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

const OrderCreateWizard = ({ minimumDate }: { minimumDate: string }) => {
  const redirect = useRedirect();
  const { trigger } = useFormContext<OrderFormData>();
  const { isDirty } = useFormState();
  const [activeStep, setActiveStep] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const stepContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stepContentRef.current?.focus();
  }, [activeStep]);

  const requestExit = () => {
    if (isDirty) setConfirmExit(true);
    else redirect("list", "orders");
  };
  const next = async () => {
    const fields: (keyof OrderFormData)[] =
      activeStep === 0
        ? ["workOrderId", "category", "date", "priority", "notes"]
        : ["details"];
    if (await trigger(fields)) setActiveStep((step) => Math.min(step + 1, 2));
  };

  return (
    <Box
      sx={{ width: "100%", maxWidth: 960, mx: "auto", pb: { xs: 18, sm: 2 } }}
    >
      <Stack
        component="header"
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", minWidth: 0 }}
        >
          <IconButton
            aria-label="Torna all'elenco ordini"
            onClick={requestExit}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", flexWrap: "wrap" }}
            >
              <Typography component="h1" variant="h2">
                Nuovo ordine
              </Typography>
              <Chip label="Bozza" variant="outlined" />
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Compila i dati, aggiungi gli articoli e controlla il riepilogo.
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack spacing={2.5}>
        <WizardProgress activeStep={activeStep} />
        <Box
          ref={stepContentRef}
          role="region"
          tabIndex={-1}
          aria-live="polite"
          aria-label={`Passo ${activeStep + 1}: ${steps[activeStep]}`}
          sx={{ outline: "none" }}
        >
          {activeStep === 0 && (
            <OrderInformationFields minimumDate={minimumDate} />
          )}
          {activeStep === 1 && <OrderDetailsSection />}
          {activeStep === 2 && (
            <Stack spacing={2}>
              <Box>
                <Typography component="h2" variant="h2">
                  Controlla e conferma
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Verifica i dati prima di creare l'ordine.
                </Typography>
              </Box>
              <OrderReview onEdit={setActiveStep} />
            </Stack>
          )}
        </Box>
      </Stack>

      <WizardActions
        activeStep={activeStep}
        onBack={() => setActiveStep((step) => Math.max(step - 1, 0))}
        onNext={next}
        onCancel={requestExit}
      />

      <Dialog
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Abbandonare il nuovo ordine?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            I dati e gli articoli inseriti non verranno salvati.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setConfirmExit(false)}>
            Continua a modificare
          </Button>
          <Button
            type="button"
            color="error"
            variant="contained"
            onClick={() => redirect("list", "orders")}
          >
            Abbandona
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export const OrderCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const { permissions } = usePermissions();
  const minimumDate = dateWithOffset(permissions === "ADMIN_ROLE" ? 1 : 2);

  return (
    <Create
      component="div"
      title="Nuovo ordine"
      transform={sanitizeOrder}
      mutationOptions={{
        onSuccess: () => {
          notify("Ordine creato correttamente", { type: "success" });
          redirect("list", "orders");
        },
        onError: (error) => {
          notify(
            error instanceof Error
              ? error.message
              : "Impossibile creare l'ordine",
            {
              type: "error",
            },
          );
        },
      }}
    >
      <SimpleForm
        mode="onChange"
        reValidateMode="onChange"
        validate={(values) => validateOrderForm(values, minimumDate)}
        toolbar={false}
        defaultValues={{
          priority: "STANDARD",
          date: minimumDate,
          details: [],
        }}
        sx={{ maxWidth: "none", p: 0 }}
      >
        <OrderCreateWizard minimumDate={minimumDate} />
      </SimpleForm>
    </Create>
  );
};
