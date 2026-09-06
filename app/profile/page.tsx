"use client";

import { ProfileEditor } from "@/components/profile/profile-editor";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto py-8">
      <ProfileEditor userId={session.user?.id || ""} />
    </div>
  );
}
