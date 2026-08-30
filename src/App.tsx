import { Admin, Resource } from "react-admin";
import { dataProvider } from "./data-provider";
import { CustomLayout } from "./layout/custom-layout";
import CustomLoginPage from "./layout/custom-login-page";
import authProvider from "./auth-provider";
import { i18nProvider } from "./i18n/i18n-provider";
import { UserList } from "./resources/user/user-list";
import { UserEdit } from "./resources/user/user-edit";
import { UserCreate } from "./resources/user/user-create";

const App = () => (
  <Admin
    layout={CustomLayout}
    loginPage={CustomLoginPage}
    dataProvider={dataProvider}
    authProvider={authProvider}
    i18nProvider={i18nProvider}
  >
    <Resource name="user" list={UserList} edit={UserEdit} create={UserCreate} />
  </Admin>
);

export default App;
