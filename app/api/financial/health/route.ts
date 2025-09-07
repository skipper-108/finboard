import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple health check - in production, this could test actual API connectivity
    return NextResponse.json({
      data: {
        provider: "Mock API",
        status: "healthy",
        message: "Financial API is responding normally",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        data: {
          provider: "Mock API",
          status: "error",
          message: "Health check failed",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}
