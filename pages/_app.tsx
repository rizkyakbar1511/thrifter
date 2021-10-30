import React from "react";
import type { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";

import { createEmotionCache } from "@utils/helper";
import StoreProvider from "@utils/Store";
import { SnackbarProvider } from "notistack";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();
interface Props extends AppProps {
  emotionCache?: EmotionCache;
}

const initialOptions = {
  "client-id": "test",
  currency: "USD",
  "data-client-token": process.env.PAYPAL_CLIENT_ID,
};

function App({ Component, pageProps, emotionCache = clientSideEmotionCache }: Props) {
  return (
    <CacheProvider value={emotionCache}>
      <SnackbarProvider anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <StoreProvider>
          <PayPalScriptProvider deferLoading={true} options={initialOptions}>
            <Component {...pageProps} />
          </PayPalScriptProvider>
        </StoreProvider>
      </SnackbarProvider>
    </CacheProvider>
  );
}
export default App;
