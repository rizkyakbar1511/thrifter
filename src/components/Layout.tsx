import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import { AppBar, Container, Link, Toolbar, Typography, Box, Switch, Badge, Button, Menu, MenuItem, Avatar } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

import useStyles from "@utils/styles";
import { Store } from "@utils/Store";

interface IProps {
  title?: string;
  description?: string;
}

const Layout: React.FC<IProps> = ({ title, description, children }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const classes = useStyles();
  const {
    state: { darkMode, cart, userInfo },
    dispatch,
  } = React.useContext(Store);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = (e?: any, redirect?: string) => {
    setAnchorEl(null);
    if (redirect) router.push(redirect);
  };
  const logoutClickHandler = () => {
    setAnchorEl(null);
    dispatch({ type: "USER_LOGOUT" });
    Cookies.remove("userInfo");
    Cookies.remove("cartItems");
    router.push("/");
  };

  const theme = createTheme({
    typography: {
      h1: {
        fontSize: "1.6rem",
        fontWeight: 400,
        margin: "1rem 0",
      },
      h2: {
        fontSize: "1.4rem",
        fontWeight: 400,
        margin: "1rem 0",
      },
      body1: {
        fontWeight: "normal",
      },
    },
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#f0c000",
      },
      secondary: {
        main: "#208080",
      },
    },
  });

  return (
    <>
      <Head>
        <title>{title ? `${title} - Thrifter` : "Thrifter"}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        {description && <meta name="description" content={description} />}
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar className={classes.navbar} position="static">
          <Toolbar>
            <NextLink passHref href="/">
              <Link>
                <Typography variant="h5" component="h6">
                  Thrifter
                </Typography>
              </Link>
            </NextLink>
            <Box flexGrow={1}></Box>
            <Box display="flex" alignItems="center">
              <Switch checked={Boolean(darkMode)} onChange={() => dispatch({ type: darkMode ? "DARK_MODE_OFF" : "DARK_MODE_ON" })} />
              <NextLink href="/cart" passHref>
                <Link style={{ display: "flex", marginRight: "0.5rem" }}>
                  {cart.cartItems.length > 0 ? (
                    <Badge color="secondary" badgeContent={cart.cartItems.length}>
                      <ShoppingCartOutlinedIcon />
                    </Badge>
                  ) : (
                    <ShoppingCartOutlinedIcon />
                  )}
                </Link>
              </NextLink>
              {userInfo ? (
                <>
                  <Button aria-controls="basic-menu" aria-haspopup="true" aria-expanded={open ? "true" : undefined} onClick={handleClick}>
                    <Avatar alt={userInfo.name} src="https://i.pravatar.cc/" />
                  </Button>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
                    }}
                  >
                    <MenuItem onClick={(e) => handleClose(e, "/profile")}>Profile</MenuItem>
                    <MenuItem onClick={(e) => handleClose(e, "/order-history")}>Order History</MenuItem>
                    <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <NextLink href="/login" passHref>
                  <Link>Login</Link>
                </NextLink>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        <Container className={classes.main}>{children}</Container>
        <Box component="footer" textAlign="center" my={2}>
          <Typography variant="h6" component="footer">
            All rights reserved. Thrifter
          </Typography>
        </Box>
      </ThemeProvider>
    </>
  );
};

export default Layout;
