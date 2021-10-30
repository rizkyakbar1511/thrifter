import React from "react";
import type { GetServerSideProps, NextPage } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import NextLink from "next/link";
import axios from "axios";
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
  List,
  ListItem,
  Card,
  CircularProgress,
} from "@mui/material";
import { Store } from "@utils/Store";
import { getError } from "@utils/helper";
import Layout from "@components/Layout";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSnackbar } from "notistack";

type IOrderUser = {
  name: string;
  quantity: number;
  image: string;
  price: number;
  slug: string;
  _id: number;
};

type IOrderData = {
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  _id: string;
  user: string;
  orderItems: IOrderUser[];
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  deliveredAt: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
};

interface IOrder {
  data: IOrderData;
}

const initialState = { loading: true, order: {}, error: "" };

type ACTIONTYPE =
  | { type: "FETCH_REQUEST" }
  | { type: "FETCH_SUCCESS"; payload: IOrderData }
  | { type: "FETCH_FAILED"; payload: string }
  | { type: "PAYMENT_REQUEST" }
  | { type: "PAYMENT_SUCCESS" }
  | { type: "PAYMENT_FAILED"; payload: any }
  | { type: "PAYMENT_RESET" };

function reducer(state: any, action: ACTIONTYPE) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAILED":
      return { ...state, loading: false, error: action.payload };
    case "PAYMENT_REQUEST":
      return { ...state, loadingPay: true };
    case "PAYMENT_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAYMENT_FAILED":
      return { ...state, loadingPay: false, errorPay: action.payload };
    case "PAYMENT_RESET":
      return { ...state, loadingPay: false, successPay: false, errorPay: "" };
    default:
      state;
  }
}

const Order: NextPage<{ params: { id: string } }> = ({ params: { id } }) => {
  const {
    state: { userInfo },
  } = React.useContext(Store);

  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const [{ loading, error, order, successPay }, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    !userInfo && router.push("/login");
    if (!order._id || successPay || (order._id && order._id !== id)) {
      (async () => {
        try {
          dispatch({ type: "FETCH_REQUEST" });
          const { data }: IOrder = await axios.get(`/api/orders/${id}`, { headers: { authorization: `Bearer ${userInfo.token}` } });
          dispatch({ type: "FETCH_SUCCESS", payload: data });
        } catch (err: unknown) {
          if (err instanceof Error) dispatch({ type: "FETCH_FAILED", payload: getError(err) });
        }
      })();
      if (successPay) {
        dispatch({ type: "PAYMENT_RESET" });
      }
    } else {
      (async () => {
        const { data: clientId }: { data: string } = await axios.get("/api/keys/paypal", {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      })();
    }
  }, [order, successPay]);

  const {
    shippingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isDelivered,
    deliveredAt,
    isPaid,
    paidAt,
  }: IOrderData = order;

  const createOrder = (data: any, actions: any) =>
    actions.order
      .create({
        purchase_units: [
          {
            amount: { value: totalPrice },
          },
        ],
      })
      .then((orderId: string) => orderId);

  const onApprove = (data: any, actions: any) =>
    actions.order.capture().then(async (details: any) => {
      try {
        dispatch({ type: "PAYMENT_REQUEST" });
        const { data } = axios.put(`/api/orders/${order._id}/pay`, details, { headers: { authorization: `Bearer ${userInfo.token}` } });
        dispatch({ type: "PAYMENT_SUCCESS", payload: data });
        enqueueSnackbar("Order is paid", { variant: "success" });
      } catch (err: any) {
        dispatch({ type: "PAYMENT_FAILED", payload: getError(err) });
        enqueueSnackbar(getError(err), { variant: "error" });
      }
    });

  const onError = (err: any) => enqueueSnackbar(getError(err), { variant: "error" });

  return (
    <Layout title={`Order ${id}`}>
      <Typography variant="h1" component="h1">
        Order {id}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography style={{ color: "#f04040" }}>{error}</Typography>
      ) : (
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
                <ListItem>Status: {isDelivered ? `delivered at ${deliveredAt}` : "not delivered"}</ListItem>
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
                <ListItem>Status: {isPaid ? `paid at ${paidAt}` : "not paid"}</ListItem>
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
                        {orderItems.map((item) => (
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
                {!isPaid && (
                  <ListItem>
                    {isPending ? (
                      <CircularProgress />
                    ) : (
                      <Box width="100%">
                        <PayPalButtons createOrder={createOrder} onApprove={onApprove} onError={onError} />
                      </Box>
                    )}
                  </ListItem>
                )}
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  console.log(params);
  return {
    props: { params },
  };
};

export default dynamic(() => Promise.resolve(Order), { ssr: false });
