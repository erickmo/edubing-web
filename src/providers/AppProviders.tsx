import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

/**
 * Root layout component that wraps the entire app with global providers.
 * Used as the root element in the react-router route tree so that all
 * pages have access to QueryClient and other providers.
 */
export default function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
