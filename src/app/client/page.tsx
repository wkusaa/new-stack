"use client";

import { useAuth } from "~/provider/AuthProvider";

export default function ClientPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p>Loading</p>;

  return <div>{user?.email} time to mew</div>;
}
