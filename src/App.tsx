import { Admin, Resource } from "react-admin";
import { dataProvider } from "./data-provider";
import { CustomLayout } from "./layout/custom-layout";
import CustomLoginPage from "./layout/custom-login-page";
import authProvider from "./auth-provider";
import { i18nProvider } from "./i18n/i18n-provider";
import { UserList } from "./resources/user/user-list";
import { UserEdit } from "./resources/user/user-edit";
import { UserCreate } from "./resources/user/user-create";
import { lsManagerTheme } from "./theme";
import { ArticleList } from "./resources/article/article-list";
import { ArticleEdit } from "./resources/article/article-edit";
import { ArticleCreate } from "./resources/article/article-create";
import { OrderList } from "./resources/order/order-list";
import { OrderCreate } from "./resources/order/order-create";
import { OrderEdit } from "./resources/order/order-edit";
import { WorkOrderList } from "./resources/workorder/workorder-list";
import { WorkOrderCreate } from "./resources/workorder/workorder-create";
import { WorkOrderEdit } from "./resources/workorder/workorder-edit";

const App = () => (
  <Admin
    layout={CustomLayout}
    loginPage={CustomLoginPage}
    dataProvider={dataProvider}
    authProvider={authProvider}
    i18nProvider={i18nProvider}
    theme={lsManagerTheme}
  >
    {(permissions) => (
      <>
        <Resource
          name="articles"
          list={ArticleList}
          edit={permissions === "ADMIN_ROLE" ? ArticleEdit : undefined}
          create={permissions === "ADMIN_ROLE" ? ArticleCreate : undefined}
          recordRepresentation="name"
        />
        <Resource
          name="workorders"
          list={WorkOrderList}
          edit={permissions === "ADMIN_ROLE" ? WorkOrderEdit : undefined}
          create={permissions === "ADMIN_ROLE" ? WorkOrderCreate : undefined}
          recordRepresentation="name"
        />
        <Resource
          name="orders"
          list={OrderList}
          edit={OrderEdit}
          create={permissions === "WAREHOUSE_ROLE" ? undefined : OrderCreate}
          recordRepresentation="name"
        />
        {permissions === "ADMIN_ROLE" && (
          <Resource
            name="users"
            list={UserList}
            edit={UserEdit}
            create={UserCreate}
            recordRepresentation="username"
          />
        )}
      </>
    )}
  </Admin>
);

export default App;
