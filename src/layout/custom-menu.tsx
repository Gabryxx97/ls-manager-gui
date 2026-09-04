import {
  Menu,
  MenuItemLink,
  MenuProps,
  usePermissions,
  useSidebarState,
} from "react-admin";
import GroupIcon from "@mui/icons-material/Group";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

export const CustomMenu = ({ dense = false }: MenuProps) => {
  const [open] = useSidebarState();
  const { isLoading, permissions } = usePermissions();

  if (isLoading) return null;
  return (
    <Menu
      sx={{
        width: open ? 240 : 64,
        minHeight: "100%",
        paddingTop: 1,
        backgroundColor: "#F0F2F4",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <MenuItemLink
        to="/articles"
        primaryText="Articoli"
        leftIcon={<Inventory2OutlinedIcon />}
        dense={dense}
      />
      <MenuItemLink
        to="/orders"
        primaryText="Ordini"
        leftIcon={<ReceiptLongOutlinedIcon />}
        dense={dense}
      />
      {permissions === "ADMIN_ROLE" && (
        <MenuItemLink
          to="/users"
          primaryText="Utenti"
          leftIcon={<GroupIcon />}
          dense={dense}
        />
      )}
    </Menu>
  );
};
