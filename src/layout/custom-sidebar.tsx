import { Sidebar, SidebarProps } from "react-admin";

export const CustomSidebar = (props: SidebarProps) => (
  <Sidebar {...props} size={240} closedSize={64} />
);
