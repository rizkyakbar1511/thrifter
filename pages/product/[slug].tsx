import React from "react";
import type { GetServerSideProps, NextPage } from "next";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Link, Grid, List, ListItem, Typography, Card, Button, Box } from "@mui/material";
import axios from "axios";

import Layout from "@components/Layout";
import db from "@utils/dbConnection";
import ProductModel from "@models/Product";
import { IProduct } from "@utils/types";
import { Params } from "next/dist/server/router";
import { Store } from "@utils/Store";

interface IDetailProduct extends IProduct {
  _id: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }: Params) => {
  const { slug } = params;
  await db.connect();
  const product = await ProductModel.findOne({ slug }).lean();
  await db.disconnect();
  return {
    props: {
      product: db.convertDocToObj(product),
    },
  };
};

const Product: NextPage<{ product: IDetailProduct }> = ({ product }) => {
  const {
    state: {
      cart: { cartItems },
    },
    dispatch,
  } = React.useContext(Store);
  const router = useRouter();

  if (!product) return <div>Product not found</div>;

  const addToCartHandler = async () => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data }: { data: IDetailProduct } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) return window.alert("Sorry. Product is out of stock");

    dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    router.push("/cart");
  };

  return (
    <Layout title={product.name} description={product.description}>
      <Box my={2}>
        <NextLink href="/" passHref>
          <Link>
            <Typography>back to products</Typography>
          </Link>
        </NextLink>
      </Box>
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <Image src={product.image} width={640} height={640} layout="responsive" />
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography variant="h1" component="h1">
                {product.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Category: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Brand: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Rating: {product.rating} stars ({product.numReviews} reviews)
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Description: {product.description}</Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Price</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>${product.price}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Status</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{product.countInStock > 0 ? "In stock" : "Unavailable"}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button onClick={addToCartHandler} type="button" variant="contained" color="primary" fullWidth>
                  Add to cart
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Product;
