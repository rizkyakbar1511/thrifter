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

const Register: NextPage = () => {
  const {
    state: { userInfo },
    dispatch,
  } = React.useContext(Store);
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  React.useEffect(() => {
    userInfo && router.push("/");
  }, []);

  const onSubmit = handleSubmit(async ({ name, email, password, confirmPassword }) => {
    closeSnackbar();
    if (password !== confirmPassword) return enqueueSnackbar("Password does not match", { variant: "error" });
    try {
      const { data }: IData = await axios.post("/api/users/register", { name, email, password });
      dispatch({ type: "USER_LOGIN", payload: data });
      Cookies.set("userInfo", JSON.stringify(data));
      router.push((router.query.redirect as string) || "/");
      enqueueSnackbar("Login Success !", { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  });

  return (
    <Layout title="Register">
      <Box onSubmit={onSubmit} component="form" maxWidth={800} mx="auto">
        <Typography component="h1" variant="h1">
          Register
        </Typography>
        <List>
          <ListItem>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  variant="outlined"
                  fullWidth
                  id="name"
                  label="Name"
                  type="text"
                  error={Boolean(errors.name)}
                  helperText={errors.name ? (errors.name.type === "minLength" ? "Name length is more than 1" : "Name is required") : ""}
                />
              )}
            />
          </ListItem>
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
            <Controller
              name="confirmPassword"
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
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  error={Boolean(errors.confirmPassword)}
                  helperText={
                    errors.confirmPassword
                      ? errors.confirmPassword.type === "minLength"
                        ? "Confirm Password length is more than 5"
                        : "Confirm Password is required"
                      : ""
                  }
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Button variant="contained" type="submit" color="primary" fullWidth>
              REGISTER
            </Button>
          </ListItem>
          <ListItem>
            Already have an account ? &nbsp;
            <NextLink href={`/login?redirect=${router.query.redirect ?? "/"}`} passHref>
              <Link>Login</Link>
            </NextLink>
          </ListItem>
        </List>
      </Box>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Register), { ssr: false });
