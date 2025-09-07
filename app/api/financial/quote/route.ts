import { type NextRequest, NextResponse } from "next/server"

// Server-side API configuration with secure environment variables
const API_CONFIG = {
  ALPHA_VANTAGE: {
    baseUrl: "https://www.alphavantage.co/query",
    key: process.env.ALPHA_VANTAGE_API_KEY || "demo",
    rateLimit: 5,
  },
  FINNHUB: {
    baseUrl: "https://finnhub.io/api/v1",
    key: process.env.FINNHUB_API_KEY || "demo",
    rateLimit: 60,
  },
  POLYGON: {
    baseUrl: "https://api.polygon.io/v2",
    key: process.env.POLYGON_API_KEY || "demo",
    rateLimit: 5,
  },
}

// Mock data generator for fallback
const generateMockQuote = (symbol: string) => {
  const basePrice = Math.random() * 500 + 50
  const change = (Math.random() - 0.5) * 20
  const changePercent = (change / basePrice) * 100

  return {
    symbol,
    price: Number(basePrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: `$${(Math.random() * 2000 + 100).toFixed(1)}B`,
    pe: Number((Math.random() * 50 + 10).toFixed(1)),
    high: Number((basePrice + Math.random() * 10).toFixed(2)),
    low: Number((basePrice - Math.random() * 10).toFixed(2)),
    open: Number((basePrice + (Math.random() - 0.5) * 5).toFixed(2)),
    previousClose: Number((basePrice - change).toFixed(2)),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const symbols = searchParams.get("symbols")

    if (!symbol && !symbols) {
      return NextResponse.json({ error: "Symbol or symbols parameter required" }, { status: 400 })
    }

    // Handle multiple symbols
    if (symbols) {
      const symbolList = symbols.split(",")
      const quotes = symbolList.map(generateMockQuote)
      return NextResponse.json({ data: quotes })
    }

    // Handle single symbol
    if (symbol) {
      const quote = generateMockQuote(symbol)
      return NextResponse.json({ data: quote })
    }
  } catch (error) {
    console.error("Quote API error:", error)
    return NextResponse.json({ error: "Failed to fetch quote data" }, { status: 500 })
  }
}
