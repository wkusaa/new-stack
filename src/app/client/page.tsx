"use client";

import { api } from "~/trpc/react";

export default function ClientPage() {
  const { data: user } = api.user.getCurrentUser.useQuery();

  if (!user) return <p>Loading</p>;

  return <div>{user.email} time to mew</div>;
}
