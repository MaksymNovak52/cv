"use client";
import { UserProvider } from "@/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </UserProvider>
  );
}
