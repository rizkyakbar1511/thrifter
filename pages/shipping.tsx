import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Layout from "@components/Layout";
import { Box, Button, List, ListItem, TextField, Typography } from "@mui/material";
import { NextPage } from "next";
import Cookies from "js-cookie";
import { Controller, useForm } from "react-hook-form";

import { Store } from "@utils/Store";
import { IUser } from "@utils/types";
import CheckoutWizard from "@components/CheckoutWizard";

interface IData {
  data: IUser;
}

const Shipping: NextPage = () => {
  const {
    state: {
      userInfo,
      cart: { shippingAddress },
    },
    dispatch,
  } = React.useContext(Store);
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const onSubmit = handleSubmit(({ fullName, address, city, postalCode, country }) => {
    dispatch({ type: "SAVE_SHIPPING_ADDRESS", payload: { fullName, address, city, postalCode, country } });
    Cookies.set("shippingAddress", JSON.stringify({ fullName, address, city, postalCode, country }));
    router.push("/payment");
  });

  React.useEffect(() => {
    !userInfo && router.push("/login?redirect=/shipping");
    setValue("fullName", shippingAddress?.fullName);
    setValue("address", shippingAddress?.address);
    setValue("city", shippingAddress?.city);
    setValue("postalCode", shippingAddress?.postalCode);
    setValue("country", shippingAddress?.country);
  }, []);

  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={1} />
      <Box onSubmit={onSubmit} component="form" maxWidth={800} mx="auto">
        <Typography component="h1" variant="h1">
          Shipping Address
        </Typography>
        <List>
          <ListItem>
            <Controller
              name="fullName"
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
                  id="fullName"
                  label="Full Name"
                  type="text"
                  error={Boolean(errors.fullName)}
                  helperText={
                    errors.fullName
                      ? errors.fullName.type === "minLength"
                        ? "Full name length is more than 1"
                        : "Full name is required"
                      : ""
                  }
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="address"
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
                  id="address"
                  label="Address"
                  type="text"
                  error={Boolean(errors.address)}
                  helperText={
                    errors.address ? (errors.address.type === "minLength" ? "Address length is more than 1" : "Address is required") : ""
                  }
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="city"
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
                  id="city"
                  label="City"
                  type="text"
                  error={Boolean(errors.city)}
                  helperText={errors.city ? (errors.city.type === "minLength" ? "City length is more than 1" : "City is required") : ""}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="postalCode"
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
                  id="postalCode"
                  label="Postal Code"
                  type="text"
                  error={Boolean(errors.postalCode)}
                  helperText={
                    errors.postalCode
                      ? errors.postalCode.type === "minLength"
                        ? "Postal code length is more than 1"
                        : "Postal code is required"
                      : ""
                  }
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="country"
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
                  id="country"
                  label="Country"
                  type="text"
                  error={Boolean(errors.country)}
                  helperText={
                    errors.country ? (errors.country.type === "minLength" ? "Country length is more than 1" : "Country is required") : ""
                  }
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Button variant="contained" type="submit" color="primary" fullWidth>
              Continue
            </Button>
          </ListItem>
        </List>
      </Box>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Shipping), { ssr: false });
