import React from "react";
import { NextPage } from "next";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Grid,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  List,
  ListItem,
  Card,
  CircularProgress,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import Layout from "@components/Layout";
import { Store } from "@utils/Store";
import { getError } from "@utils/helper";

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

const initialState = { loading: true, orders: [], error: "" };

type ACTIONTYPE = { type: "FETCH_REQUEST" } | { type: "FETCH_SUCCESS"; payload: any } | { type: "FETCH_FAILED"; payload: any };

function reducer(state: any, action: ACTIONTYPE) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, orders: action.payload, error: "" };
    case "FETCH_FAILED":
      return { ...state, loading: false, error: action.payload };
    default:
      state;
  }
}

const OrderHistory: NextPage = () => {
  const {
    state: { userInfo },
  } = React.useContext(Store);
  const router = useRouter();
  const [{ loading, error, orders }, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    !userInfo && router.push("/login");
    (async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data }: IOrder = await axios.get(`/api/orders/history`, { headers: { authorization: `Bearer ${userInfo.token}` } });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err: unknown) {
        if (err instanceof Error) dispatch({ type: "FETCH_FAILED", payload: getError(err) });
      }
    })();
  }, []);

  return (
    <Layout title="Order History">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <NextLink href="/profile" passHref>
                <ListItemButton component="a">
                  <ListItemText primary="User Profile" />
                </ListItemButton>
              </NextLink>
              <NextLink href="/order-history" passHref>
                <ListItemButton selected component="a">
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
                  Order History
                </Typography>
              </ListItem>
              <ListItem>
                {loading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography style={{ color: "#f04040" }}>{error}</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>DATE</TableCell>
                          <TableCell>TOTAL</TableCell>
                          <TableCell>PAID</TableCell>
                          <TableCell>DELIVERED</TableCell>
                          <TableCell>ACTION</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order: IOrderData) => (
                          <TableRow key={order._id}>
                            <TableCell>{order._id.substring(20, 14)}</TableCell>
                            <TableCell>{order.createdAt}</TableCell>
                            <TableCell>${order.totalPrice}</TableCell>
                            <TableCell>{order.isPaid ? `paid at ${order.paidAt}` : "not paid"}</TableCell>
                            <TableCell>{order.isDelivered ? `delivered at ${order.paidAt}` : "not delivered"}</TableCell>
                            <TableCell>
                              <NextLink href={`/order/${order._id}`} passHref>
                                <Button variant="contained">Details</Button>
                              </NextLink>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(OrderHistory), { ssr: false });
