import { AppBar, RefreshIconButton, UserMenu, Logout } from "react-admin";

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
  <AppBar toolbar={<ToolbarAppBar />} userMenu={<UserMenuAppBar />} />
);
