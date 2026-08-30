import { Layout, LayoutProps, useSidebarState } from "react-admin";
import { CustomAppBar } from "./custom-app-bar";
import { CustomMenu } from "./custom-menu";

export const CustomLayout = (props: LayoutProps) => {
  const [open] = useSidebarState();
  return (
    <Layout
      {...props}
      appBar={CustomAppBar}
      menu={CustomMenu}
      className={open ? "opened" : "closed"}
    />
  );
};
