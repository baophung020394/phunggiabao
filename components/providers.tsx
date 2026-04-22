"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { makeStore } from "@/lib/store/redux-store";

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  const [store] = useState(() => makeStore());

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}
