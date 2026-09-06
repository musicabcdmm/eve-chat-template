import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserById, updateUser } from "@/lib/db/queries";
import { logActivity } from "@/lib/db/queries";

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const user = await getUserById(params.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      image: user.image,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const user = await getUserById(params.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await updateUser(params.userId, data);

    if (updated) {
      const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
      await logActivity(
        params.userId,
        "user.updated",
        "User profile updated",
        { changes: data },
        { ipAddress },
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updated?.id,
        name: updated?.name,
        bio: updated?.bio,
        image: updated?.image,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }

    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
