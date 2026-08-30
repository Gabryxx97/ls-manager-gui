import { ChangeEvent, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import LockIcon from "@mui/icons-material/Lock";
import {
  required,
  TextInput,
  useTranslate,
  useLogin,
  useNotify,
  Form,
  RaRecord,
  Identifier,
} from "react-admin";

const CustomLoginPage = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const login = useLogin();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleUsernameOnChange = (
    event: ChangeEvent | RaRecord<Identifier>,
  ) => {
    setUsername(event.target.value);
  };

  const handlePasswordOnChange = (
    event: ChangeEvent | RaRecord<Identifier>,
  ) => {
    setPassword(event.target.value);
  };

  const handleSubmit = () => {
    const auth = {
      username: username,
      password: password,
    };
    setLoading(true);
    login(
      auth,
      location.state &&
        typeof location.state === "object" &&
        "nextPathname" in location.state
        ? (location.state as { nextPathname: string }).nextPathname
        : "/",
    ).catch(() => {
      setLoading(false);
      notify("Credenziali non valide", {
        type: "error",
        autoHideDuration: 3000,
      });
    });
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center", // Modifica per centrare verticalmente
          background: "url('./background-image.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Card sx={{ maxWidth: 350 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid
                sx={{ display: "flex", justifyContent: "center" }}
                size={12}
              >
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  <LockIcon />
                </Avatar>
              </Grid>
              <Grid
                sx={{ display: "flex", justifyContent: "center" }}
                size={12}
              >
                <img
                  style={{
                    width: "50%",
                    height: "auto",
                    maxWidth: "100%",
                    borderRadius: "5px",
                  }}
                  src="./logo.png"
                  alt="Logo"
                />
              </Grid>
              <Grid size={12}>
                <TextInput
                  autoFocus
                  source="username"
                  label="Email"
                  disabled={loading}
                  onChange={handleUsernameOnChange}
                  validate={required()}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextInput
              source="password"
              label={translate("ra.auth.password")}
              type="password"
              disabled={loading}
              onChange={handlePasswordOnChange}
              validate={required()}
              size="small"
              fullWidth
            />
          </CardContent>
          <CardActions sx={{ padding: "0 1em 1em 1em" }}>
            <Button
              variant="contained"
              type="submit"
              color="primary"
              disabled={loading}
              fullWidth
            >
              {loading && <CircularProgress size={25} thickness={2} />}
              {translate("ra.auth.sign_in")}
            </Button>
          </CardActions>
        </Card>
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          fontSize: "0.875rem",
          color: "gray",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "4px 8px",
          borderRadius: "4px",
        }}
      >
        <span className="version">{__APP_VERSION__}</span>
      </Box>
    </Form>
  );
};

export default CustomLoginPage;
