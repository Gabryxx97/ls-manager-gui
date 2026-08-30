import {
  Menu,
  MenuItemLink,
  MenuProps,
  usePermissions,
  useSidebarState,
} from "react-admin";
import GroupIcon from "@mui/icons-material/Group";

export const CustomMenu = ({ dense = false }: MenuProps) => {
  const [open] = useSidebarState();
  const { isLoading, permissions } = usePermissions();

  if (isLoading) return null;
  return (
    <Menu
      sx={{
        width: open ? 230 : 40,
        marginTop: 1,
        marginBottom: 1,
      }}
    >
      {permissions === "ADMIN_ROLE" && (
        <MenuItemLink
          to="/user"
          primaryText="Utenti"
          leftIcon={<GroupIcon />}
          dense={dense}
        />
      )}
    </Menu>
  );
};
