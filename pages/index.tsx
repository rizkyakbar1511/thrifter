import React from "react";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import NextLink from "next/link";
import Layout from "@components/Layout";
import axios from "axios";
import { Grid, Box, Card, CardActionArea, CardMedia, CardContent, Typography, CardActions, Button } from "@mui/material";

import db from "@utils/dbConnection";
import Product from "models/Product";
import { IData } from "@utils/types";
import { Store } from "@utils/Store";
import { IProduct } from "@utils/types";

interface IDetailProduct extends IProduct {
  _id?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  await db.connect();
  const products = await Product.find({}).lean();
  await db.disconnect();
  return {
    props: {
      products: products.map(db.convertDocToObj),
    },
  };
};

const Home: NextPage<IData> = ({ products }) => {
  const router = useRouter();
  const {
    state: {
      cart: { cartItems },
    },
    dispatch,
  } = React.useContext(Store);

  const addToCartHandler = async (product: IDetailProduct) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data }: { data: IDetailProduct } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock <= quantity) return window.alert("Sorry. Product is out of stock");

    dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    router.push("/cart");
  };

  return (
    <Layout>
      <Typography variant="h4" component="h4" gutterBottom>
        Products
      </Typography>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid key={product.name} item md={4}>
            <Card>
              <NextLink href={`/product/${product.slug}`} passHref>
                <CardActionArea>
                  <CardMedia component="img" image={product.image} title={product.name} />
                  <CardContent>
                    <Typography variant="body1" component="h6">
                      {product.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </NextLink>
              <CardActions>
                <Typography variant="body2" component="p">
                  ${product.price}
                </Typography>
                <Button size="small" color="primary" onClick={() => addToCartHandler(product)}>
                  Add to cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export default Home;
