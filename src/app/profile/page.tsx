"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStytchUser } from "@stytch/nextjs";
import Profile from "@/src/components/Profile";

export default function ProfilePage() {
  return <Profile />;
}
