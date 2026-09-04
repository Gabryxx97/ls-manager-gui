import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { usePermissions } from "react-admin";
import { useLocation, useNavigate } from "react-router-dom";

export const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions } = usePermissions();

  return (
    <Paper
      component="nav"
      aria-label="Navigazione principale"
      square
      sx={{
        display: { xs: "block", sm: "none" },
        position: "fixed",
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
      }}
    >
      <BottomNavigation
        showLabels
        value={
          location.pathname.startsWith("/articles")
            ? "/articles"
            : location.pathname.startsWith("/orders")
              ? "/orders"
            : location.pathname.startsWith("/users")
              ? "/users"
              : false
        }
        onChange={(_, value: string) => navigate(value)}
      >
        <BottomNavigationAction
          label="Articoli"
          value="/articles"
          icon={<Inventory2OutlinedIcon />}
        />
        <BottomNavigationAction
          label="Ordini"
          value="/orders"
          icon={<ReceiptLongOutlinedIcon />}
        />
        {permissions === "ADMIN_ROLE" && (
          <BottomNavigationAction label="Utenti" value="/users" icon={<GroupIcon />} />
        )}
      </BottomNavigation>
    </Paper>
  );
};
