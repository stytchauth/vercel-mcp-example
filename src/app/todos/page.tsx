"use client";

import Todos from "@/src/components/Todos";
import { Logout } from "@/src/components/Auth";

export default function TodoPage() {
  return (
    <>
      <Todos />
      <Logout />
    </>
  );
}
