export const registryFormSx = {
  p: 0,
  "& > .MuiStack-root": { width: "100%", p: 0 },
  "& .MuiInputBase-root": { minHeight: { xs: 44, sm: 40 } },
};

export const registryListSx = {
  pb: { xs: 8, sm: 0 },
  "& .RaList-actions": {
    mb: { xs: 1.5, sm: 0 },
    gap: { xs: 1.5, sm: 0 },
    alignItems: { xs: "stretch", sm: "flex-end" },
    flexDirection: { xs: "column", sm: "row" },
    backgroundColor: "transparent",
  },
  "& .RaList-actions > .MuiToolbar-root": {
    width: { xs: "100%", sm: "auto" },
    minHeight: { xs: 44, sm: "auto" },
    order: { xs: -1, sm: 0 },
    mt: 0,
    p: { xs: 0, sm: 0.5 },
    pb: { xs: 0, sm: 1 },
    gap: 1,
  },
  "& .RaList-actions, & .RaList-actions > .MuiToolbar-root": {
    backgroundColor: { xs: "transparent !important", sm: "initial" },
    boxShadow: { xs: "none", sm: "initial" },
  },
  "& .RaList-actions > span": {
    display: { xs: "none", sm: "initial" },
  },
  "& .RaList-actions > form": {
    width: { xs: "100%", sm: "auto" },
    gap: { xs: 1, sm: 0 },
    paddingBottom: { xs: 0, sm: 0.5 },
  },
  "& .RaFilterForm-filterFormInput": {
    width: { xs: "100%", sm: "auto" },
  },
  "& .RaFilterForm-filterFormInput .MuiFormControl-root": {
    width: { xs: "100%", sm: "auto" },
    mt: { xs: 0, sm: 1 },
    mb: { xs: 0, sm: 1 },
  },
  "& .RaFilterForm-filterFormInput .RaFilterFormInput-spacer": {
    width: { xs: 0, sm: 16 },
    display: { xs: "none", sm: "block" },
  },
  "& .RaFilterForm-filterFormInput .RaFilterFormInput-hideButton": {
    mb: { xs: 0, sm: 1 },
  },
  "& .MuiToolbar-root": {
    backgroundColor: "transparent",
  },
};
