import React, { SyntheticEvent } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { Store } from "@utils/Store";
import Cookies from "js-cookie";
import Layout from "@components/Layout";
import CheckoutWizard from "@components/CheckoutWizard";
import { Button, FormControl, FormControlLabel, List, ListItem, Radio, RadioGroup, Typography } from "@mui/material";
import { useSnackbar } from "notistack";

const Payment: NextPage = () => {
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const {
    state: {
      cart: { shippingAddress },
    },
    dispatch,
  } = React.useContext(Store);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const router = useRouter();
  React.useEffect(() => {
    !shippingAddress?.address ? router.push("/shipping") : setPaymentMethod(Cookies.get("paymentMethod") || "");
  }, []);

  const submitHandler = (e: SyntheticEvent) => {
    closeSnackbar();
    e.preventDefault();
    if (!paymentMethod) {
      enqueueSnackbar("Payment method is required", { variant: "error" });
    } else {
      dispatch({ type: "SAVE_PAYMENT_METHOD", payload: paymentMethod });
      Cookies.set("paymentMethod", paymentMethod);
      router.push("/placeorder");
    }
  };

  return (
    <Layout title="Payment Method">
      <CheckoutWizard activeStep={2} />
      <form onSubmit={submitHandler}>
        <Typography variant="h1" component="h1">
          Payment Method
        </Typography>
        <List>
          <ListItem>
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="Payment Method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel label="Paypal" value="Paypal" control={<Radio />} />
                <FormControlLabel label="Stripe" value="Stripe" control={<Radio />} />
                <FormControlLabel label="Cash" value="Cash" control={<Radio />} />
              </RadioGroup>
            </FormControl>
          </ListItem>
          <ListItem>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Continue
            </Button>
          </ListItem>
          <ListItem>
            <Button type="button" variant="contained" color="inherit" fullWidth onClick={() => router.push("/shipping")}>
              Back
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
};

export default Payment;
