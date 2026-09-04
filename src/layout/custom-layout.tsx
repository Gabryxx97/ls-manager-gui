import { useEffect } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { Layout, LayoutProps, useSidebarState } from "react-admin";
import { CustomAppBar } from "./custom-app-bar";
import { CustomMenu } from "./custom-menu";
import { CustomSidebar } from "./custom-sidebar";
import { MobileNavigation } from "./mobile-navigation";

export const CustomLayout = (props: LayoutProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useSidebarState();

  useEffect(() => {
    setOpen(isDesktop);
  }, [isDesktop, setOpen]);

  return (
    <>
      <Layout
        {...props}
        appBar={CustomAppBar}
        appBarAlwaysOn
        menu={CustomMenu}
        sidebar={CustomSidebar}
        className={open ? "opened" : "closed"}
      />
      <MobileNavigation />
    </>
  );
};
