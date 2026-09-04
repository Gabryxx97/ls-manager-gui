import { AppBar, RefreshIconButton, UserMenu, Logout } from "react-admin";
import { Box, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

const ToolbarAppBar = () => (
  <>
    <RefreshIconButton />
  </>
);

const UserMenuAppBar = () => (
  <UserMenu>
    <Logout />
  </UserMenu>
);

export const CustomAppBar = () => (
  <AppBar toolbar={<ToolbarAppBar />} userMenu={<UserMenuAppBar />}>
    <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, gap: 1 }}>
      <Inventory2OutlinedIcon color="primary" aria-hidden="true" />
      <Typography
        component="span"
        sx={{ color: "primary.dark", fontSize: { xs: 20, sm: 24 }, fontWeight: 700 }}
        noWrap
      >
        LS Manager
      </Typography>
    </Box>
  </AppBar>
);
