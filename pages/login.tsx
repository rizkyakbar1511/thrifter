import React from "react";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Layout from "@components/Layout";
import { Box, Button, Link, List, ListItem, TextField, Typography } from "@mui/material";
import { NextPage } from "next";
import axios from "axios";
import Cookies from "js-cookie";
import { Controller, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";

import { Store } from "@utils/Store";
import { IUser } from "@utils/types";
import { getError } from "@utils/helper";

interface IData {
  data: IUser;
}

const Login: NextPage = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const {
    state: { userInfo },
    dispatch,
  } = React.useContext(Store);
  const router = useRouter();

  React.useEffect(() => {
    userInfo && router.push("/");
  }, []);

  const onSubmit = handleSubmit(async ({ email, password }) => {
    closeSnackbar();
    try {
      const { data }: IData = await axios.post("/api/users/login", { email, password });
      dispatch({ type: "USER_LOGIN", payload: data });
      Cookies.set("userInfo", JSON.stringify(data));
      router.push((router.query.redirect as string) || "/");
      enqueueSnackbar("Login Success !", { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  });

  return (
    <Layout title="Login">
      <Box onSubmit={onSubmit} component="form" maxWidth={800} mx="auto">
        <Typography component="h1" variant="h1">
          Login
        </Typography>
        <List>
          <ListItem>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  variant="outlined"
                  fullWidth
                  id="email"
                  label="E-mail"
                  type="email"
                  error={Boolean(errors.email)}
                  helperText={errors.email ? (errors.email.type === "pattern" ? "E-mail is not valid" : "E-mail is required") : ""}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="password"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 6,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  variant="outlined"
                  fullWidth
                  id="password"
                  label="Password"
                  type="password"
                  error={Boolean(errors.password)}
                  helperText={
                    errors.password
                      ? errors.password.type === "minLength"
                        ? "Password length is more than 5"
                        : "Password is required"
                      : ""
                  }
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Button variant="contained" type="submit" color="primary" fullWidth>
              LOGIN
            </Button>
          </ListItem>
          <ListItem>
            Don't have an account ? &nbsp;
            <NextLink href={`/register?redirect=${router.query.redirect ?? "/"}`} passHref>
              <Link>Register</Link>
            </NextLink>
          </ListItem>
        </List>
      </Box>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Login), { ssr: false });
