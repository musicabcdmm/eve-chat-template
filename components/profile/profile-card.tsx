"use client";

import { User } from "@/lib/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileCardProps {
  user: Partial<User>;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          {user.role && (
            <Badge className={`mt-2 ${getRoleBadgeColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          )}
        </div>
      </div>

      {user.bio && (
        <p className="mt-4 text-sm text-gray-700">{user.bio}</p>
      )}

      {user.createdAt && (
        <p className="mt-4 text-xs text-gray-500">
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
