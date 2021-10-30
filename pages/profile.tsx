import React from "react";
import { NextPage } from "next";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Grid,
  Typography,
  Button,
  List,
  ListItem,
  Card,
  CircularProgress,
  ListItemText,
  ListItemButton,
  TextField,
  Box,
} from "@mui/material";
import Cookies from "js-cookie";
import { useSnackbar } from "notistack";

import Layout from "@components/Layout";
import { Store } from "@utils/Store";
import { getError } from "@utils/helper";
import { Controller, useForm } from "react-hook-form";
import { IUser } from "@utils/types";

const Profile: NextPage = () => {
  const {
    state: { userInfo },
    dispatch,
  } = React.useContext(Store);
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  React.useEffect(() => {
    !userInfo && router.push("/login");
    setValue("name", userInfo.name);
    setValue("email", userInfo.email);
  }, []);

  const onSubmit = handleSubmit(async ({ name, email, password, confirmPassword }) => {
    closeSnackbar();
    if (password !== confirmPassword) return enqueueSnackbar("Password does not match", { variant: "error" });
    try {
      const { data }: { data: IUser } = await axios.put(
        "/api/users/profile",
        { name, email, password },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: "USER_LOGIN", payload: data });
      Cookies.set("userInfo", JSON.stringify(data));
      enqueueSnackbar("Profile updated successfully", { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  });

  return (
    <Layout title="Profile">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <NextLink href="/profile" passHref>
                <ListItemButton selected component="a">
                  <ListItemText primary="User Profile" />
                </ListItemButton>
              </NextLink>
              <NextLink href="/order-history" passHref>
                <ListItemButton component="a">
                  <ListItemText primary="Order History" />
                </ListItemButton>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Profile
                </Typography>
              </ListItem>
              <ListItem>
                <Box onSubmit={onSubmit} component="form" width="100%" mx="auto">
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
                            helperText={
                              errors.name ? (errors.name.type === "minLength" ? "Name length is more than 1" : "Name is required") : ""
                            }
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
                            helperText={
                              errors.email ? (errors.email.type === "pattern" ? "E-mail is not valid" : "E-mail is required") : ""
                            }
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
                          validate: (value) => value === "" || value.length > 5 || "Password length is more than 5",
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
                            helperText={errors.password ? "Password length is more than 5" : ""}
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
                          validate: (value) => value === "" || value.length > 5 || "Password length is more than 5",
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
                            helperText={errors.password ? "Confirm password length is more than 5" : ""}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Button variant="contained" type="submit" color="primary" fullWidth>
                        Update
                      </Button>
                    </ListItem>
                  </List>
                </Box>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Profile), { ssr: false });
