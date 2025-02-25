import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App";
 
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
 
root.render(
  <GoogleOAuthProvider clientId="560386638216-5oelp14c7nsi5o1306f16kq5q4k5jtag.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);