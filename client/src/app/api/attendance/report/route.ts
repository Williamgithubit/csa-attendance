import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { handleApiResponse } from "@/lib/sequelize";

interface QueryParams {
  page?: string;
  limit?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    // Add all query parameters
    if (searchParams.get("page"))
      queryParams.set("page", searchParams.get("page")!);
    if (searchParams.get("limit"))
      queryParams.set("limit", searchParams.get("limit")!);
    if (searchParams.get("status"))
      queryParams.set("status", searchParams.get("status")!);
    if (searchParams.get("startDate"))
      queryParams.set("startDate", searchParams.get("startDate")!);
    if (searchParams.get("endDate"))
      queryParams.set("endDate", searchParams.get("endDate")!);
    if (searchParams.get("department"))
      queryParams.set("department", searchParams.get("department")!);

    // Ensure the backend URL is configured
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) {
      console.error(
        "NEXT_PUBLIC_API_URL is not set — cannot proxy attendance report requests"
      );
      return NextResponse.json(
        { error: "Server misconfiguration: missing NEXT_PUBLIC_API_URL" },
        { status: 500 }
      );
    }

    // Construct the full API endpoint URL
    const endpoint = `${apiBase.replace(/\/$/, "")}/attendance/report${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    // Forward credentials if available
    const cookieHeader = request.headers.get("cookie");
    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (cookieHeader) headers["cookie"] = cookieHeader;
    if (authHeader) headers["authorization"] = authHeader;

    // Development-only logging to help debug auth forwarding
    if (process.env.NODE_ENV === "development") {
      try {
        console.log("[proxy] endpoint:", endpoint);
        console.log(
          "[proxy] incoming headers:",
          Object.fromEntries(request.headers.entries())
        );
        // Avoid dumping extremely long secrets, but show presence and a small prefix
        console.log(
          "[proxy] cookieHeader present:",
          Boolean(cookieHeader),
          cookieHeader ? String(cookieHeader).slice(0, 100) : ""
        );
        console.log(
          "[proxy] authHeader present:",
          Boolean(authHeader),
          authHeader
            ? String(authHeader).length > 100
              ? String(authHeader).slice(0, 100) + "..."
              : String(authHeader)
            : ""
        );
        console.log("[proxy] forwarded headers:", headers);
      } catch (e) {
        console.log("[proxy] failed to log headers", e);
      }
    }

    // Make the actual API request
    const apiResponse = await fetch(endpoint, {
      method: "GET",
      headers,
      // include credentials when possible — helpful for cross-origin cookie forwarding
      credentials: "include",
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[proxy] upstream status:",
        apiResponse.status,
        apiResponse.statusText
      );
    }

    // If upstream returned 401, return that status explicitly
    if (apiResponse.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process the response (this will throw for other non-ok statuses)
    const response = await handleApiResponse(apiResponse);

    // Return the response from the server
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in /api/attendance/report:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      cause: error?.cause,
      fullError: error,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch attendance report",
        message: error?.message,
        details:
          process.env.NODE_ENV === "development"
            ? {
                stack: error?.stack,
                name: error?.name,
                code: error?.code,
                cause: error?.cause,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
