import "./globals.css";
import ThemeProvider from "../components/layout/ThemeProvider";
import { ToastProvider } from "../components/ui/Toast";

export const metadata = {
  title: "Nook",
  description: "Your personal daily dashboard",
  manifest: "/manifest.json",
  themeColor: "#F7F3EE",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="calm">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
        <script src="https://unpkg.com/@phosphor-icons/web" async />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
