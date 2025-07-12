import Navbar from "./components/Navbar/navbar";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Star Picker",
  description: "Let us pick the star for ya!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Toaster 
          toastOptions={{
            className: " text-lg",
          }}
        />
      </body>
    </html>
  );
}
