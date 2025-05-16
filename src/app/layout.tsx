import "./globals.css";

import { ReactNode } from "react";
import StytchProvider from "@/src/components/StytchProvider";
import { Metadata } from "next";
import dynamic from "next/dynamic";


export const metadata: Metadata = {
  title: 'Stytch Vercel MCP Server',
  description: 'An example MCP Server using Stytch and Vercel',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <StytchProvider>
      <html lang="en">
      <body>
      <main>
        <h1>TODO App MCP Demo</h1>
        <div className="container">{children}</div>
      </main>
      </body>
      </html>
    </StytchProvider>
  );
}
