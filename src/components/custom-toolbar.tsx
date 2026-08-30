import { SaveButton, Toolbar } from "react-admin";

export const CustomToolbar = () => {
  return (
    <Toolbar>
      <div style={{ flexGrow: 1 }} />
      <SaveButton />
    </Toolbar>
  );
};
