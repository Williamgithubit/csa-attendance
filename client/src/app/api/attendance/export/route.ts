import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    // forward any query params
    for (const [k, v] of searchParams.entries()) {
      queryParams.set(k, v);
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) {
      console.error(
        "NEXT_PUBLIC_API_URL is not set — cannot proxy attendance export requests"
      );
      return NextResponse.json(
        { error: "Server misconfiguration: missing NEXT_PUBLIC_API_URL" },
        { status: 500 }
      );
    }

    const endpoint = `${apiBase.replace(/\/$/, "")}/attendance/export${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const cookieHeader = request.headers.get("cookie");
    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = {};
    if (cookieHeader) headers["cookie"] = cookieHeader;
    if (authHeader) headers["authorization"] = authHeader;

    if (process.env.NODE_ENV === "development") {
      try {
        console.log("[proxy export] endpoint:", endpoint);
        console.log(
          "[proxy export] incoming headers:",
          Object.fromEntries(request.headers.entries())
        );
        console.log("[proxy export] forwarded headers:", headers);
      } catch (e) {
        console.log("[proxy export] failed to log headers", e);
      }
    }

    const apiResponse = await fetch(endpoint, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[proxy export] upstream status:", apiResponse.status);
    }

    // If upstream is not ok, return its status and text so client sees meaningful error
    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      return NextResponse.json({ error: text }, { status: apiResponse.status });
    }

    // Stream the CSV (or any binary) back to the client, forwarding important headers
    const respHeaders: Record<string, string> = {};
    const contentType = apiResponse.headers.get("content-type");
    const contentDisposition = apiResponse.headers.get("content-disposition");
    if (contentType) respHeaders["content-type"] = contentType;
    if (contentDisposition)
      respHeaders["content-disposition"] = contentDisposition;

    return new NextResponse(apiResponse.body, {
      status: 200,
      headers: respHeaders,
    });
  } catch (error: any) {
    console.error("Error in /api/attendance/export:", error);
    return NextResponse.json(
      { error: "Failed to proxy export", message: error?.message },
      { status: 500 }
    );
  }
}
