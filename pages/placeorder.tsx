import React from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import NextLink from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Box,
  Grid,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link,
  Button,
  List,
  ListItem,
  Card,
  CircularProgress,
} from "@mui/material";
import { Store } from "@utils/Store";
import { useSnackbar } from "notistack";
import { fixed2Number, getError } from "@utils/helper";
import CheckoutWizard from "@components/CheckoutWizard";
import Layout from "@components/Layout";

const PlaceOrder: NextPage = () => {
  const [loading, setLoading] = React.useState(false);
  const {
    state: {
      userInfo: { token },
      cart: { cartItems, shippingAddress, paymentMethod },
    },
    dispatch,
  } = React.useContext(Store);

  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const itemsPrice: number = fixed2Number(cartItems.reduce((a, c) => a + c.price * c.quantity, 0));
  const shippingPrice: number = itemsPrice > 200 ? 0 : 15;
  const taxPrice: number = fixed2Number(itemsPrice * 0.15);
  const totalPrice: number = fixed2Number(itemsPrice + shippingPrice + taxPrice);

  const placeOrderHandler = async (): Promise<any> => {
    closeSnackbar();
    try {
      setLoading(true);
      const { data }: { data: { _id: string } } = await axios.post(
        "/api/orders",
        {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch({ type: "CART_CLEAR" });
      Cookies.remove("cartItems");
      router.push(`/order/${data._id}`);
    } catch (err: any) {
      enqueueSnackbar(getError(err), { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    !paymentMethod && router.push("/payment");
    !cartItems.length && router.push("/cart");
  }, []);

  return (
    <Layout title="Place Order">
      <CheckoutWizard activeStep={3} />
      <Typography variant="h1" component="h1">
        Place Order
      </Typography>
      <Grid container spacing={1}>
        <Grid item md={9} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Shipping Address
                </Typography>
              </ListItem>
              <ListItem>
                {shippingAddress?.fullName}, {shippingAddress?.address}, {shippingAddress?.city}, {shippingAddress?.postalCode},{" "}
                {shippingAddress?.country}
              </ListItem>
            </List>
          </Card>
          <Card>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Payment Method
                </Typography>
              </ListItem>
              <ListItem>{paymentMethod}</ListItem>
            </List>
          </Card>
          <Card>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Order Items
                </Typography>
              </ListItem>
              <ListItem>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <NextLink href={`/product/${item.slug}`} passHref>
                              <Link>
                                <Image src={item.image} alt={item.name} width={50} height={50} />
                              </Link>
                            </NextLink>
                          </TableCell>
                          <TableCell>
                            <NextLink href={`/product/${item.slug}`} passHref>
                              <Link>
                                <Typography>{item.name}</Typography>
                              </Link>
                            </NextLink>
                          </TableCell>
                          <TableCell align="right">
                            <Typography>{item.quantity}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography>${item.price}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ListItem>
            </List>
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Typography variant="h2">Order Summary</Typography>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Items:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">${itemsPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Tax:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">${taxPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Shipping:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">${shippingPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>
                      <Box component="strong">Total:</Box>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">
                      <Box component="strong">${totalPrice}</Box>
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button onClick={placeOrderHandler} variant="contained" color="primary" fullWidth>
                  {loading ? <CircularProgress /> : "Place Order"}
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(PlaceOrder), { ssr: false });
