import { NextRequest, NextResponse } from "next/server";
import { getActivityLogs } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || undefined;
    const eventType = searchParams.get("eventType") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    const logs = await getActivityLogs({
      userId,
      eventType,
      startDate: startDateStr ? new Date(startDateStr) : undefined,
      endDate: endDateStr ? new Date(endDateStr) : undefined,
      limit: Math.min(limit, 100),
      offset,
    });

    return NextResponse.json({
      logs,
      count: logs.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Get activities error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
