import React from "react";
import Cookies from "js-cookie";
import { IUser } from "./types";

type IShippingAddress = {
  fullName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

interface AppContextInterface {
  darkMode: Boolean;
  cart: {
    cartItems: any[];
    shippingAddress?: IShippingAddress;
    paymentMethod?: string;
  };
  userInfo: IUser;
}

const initialState: AppContextInterface = {
  darkMode: false,
  cart: {
    cartItems: Cookies.get("cartItems") ? JSON.parse(Cookies.get("cartItems") as string) : [],
    shippingAddress: Cookies.get("shippingAddress") ? JSON.parse(Cookies.get("shippingAddress") as string) : {},
    paymentMethod: Cookies.get("paymentMethod") ? (Cookies.get("paymentMethod") as string) : "",
  },
  userInfo: Cookies.get("userInfo") ? JSON.parse(Cookies.get("userInfo") as string) : null,
};

export const Store = React.createContext<{ state: AppContextInterface; dispatch: React.Dispatch<any> }>({
  state: initialState,
  dispatch: () => null,
});

type ACTIONTYPE =
  | { type: "DARK_MODE_ON"; darkMode: Boolean }
  | { type: "DARK_MODE_OFF"; darkMode: Boolean }
  | { type: "CART_ADD_ITEM"; payload: { _id: string } }
  | { type: "CART_REMOVE_ITEM"; payload: { _id: string } }
  | { type: "CART_CLEAR"; payload: any }
  | { type: "SAVE_SHIPPING_ADDRESS"; payload: IShippingAddress }
  | { type: "SAVE_PAYMENT_METHOD"; payload: string }
  | { type: "USER_LOGIN"; payload: any }
  | { type: "USER_LOGOUT"; payload: any };

function reducer(state: AppContextInterface, action: ACTIONTYPE) {
  switch (action.type) {
    case "DARK_MODE_ON":
      return { ...state, darkMode: true };
    case "DARK_MODE_OFF":
      return { ...state, darkMode: false };
    case "CART_ADD_ITEM": {
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find((item) => item._id === newItem._id);
      const cartItems = existItem
        ? state.cart.cartItems.map((item) => (item.name === existItem.name ? newItem : item))
        : [...state.cart.cartItems, newItem];
      Cookies.set("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "CART_REMOVE_ITEM": {
      const cartItems = state.cart.cartItems.filter((item) => item._id !== action.payload._id);
      Cookies.set("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "CART_CLEAR":
      return { ...state, cart: { ...state.cart, cart: { cartItems: [] } } };
    case "SAVE_SHIPPING_ADDRESS":
      return { ...state, cart: { ...state.cart, shippingAddress: action.payload } };
    case "SAVE_PAYMENT_METHOD":
      return { ...state, cart: { ...state.cart, paymentMethod: action.payload } };
    case "USER_LOGIN":
      return { ...state, userInfo: action.payload };
    case "USER_LOGOUT":
      return { ...state, userInfo: null, cart: { cartItems: [], shippingAddress: {}, paymentMethod: "" } };
    default:
      return state;
  }
}

export default function StoreProvider({ children }: { children: JSX.Element }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return <Store.Provider value={{ state, dispatch }}>{children}</Store.Provider>;
}

export const useDarkMode = () => React.useContext(Store);
