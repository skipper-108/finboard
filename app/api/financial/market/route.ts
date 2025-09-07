import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "indices"

    if (type === "indices") {
      const indices = ["SPY", "QQQ", "DIA"].map((symbol) => ({
        symbol,
        name: symbol === "SPY" ? "S&P 500" : symbol === "QQQ" ? "NASDAQ" : "DOW",
        price: Number((Math.random() * 1000 + 3000).toFixed(2)),
        change: Number(((Math.random() - 0.5) * 100).toFixed(2)),
        changePercent: Number(((Math.random() - 0.5) * 3).toFixed(2)),
      }))

      return NextResponse.json({ data: indices })
    }

    if (type === "gainers") {
      const symbols = ["NVDA", "AMD", "TSLA", "AAPL", "GOOGL", "MSFT", "META", "AMZN", "NFLX", "CRM"]
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      const gainers = symbols
        .slice(0, limit)
        .map((symbol) => {
          const basePrice = Math.random() * 500 + 50
          const change = Math.random() * 20 + 5 // Ensure positive change
          const changePercent = (change / basePrice) * 100

          return {
            symbol,
            price: Number(basePrice.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            volume: Math.floor(Math.random() * 10000000) + 1000000,
          }
        })
        .sort((a, b) => b.changePercent - a.changePercent)

      return NextResponse.json({ data: gainers })
    }

    if (type === "losers") {
      const symbols = ["META", "NFLX", "CRM", "PYPL", "SNAP", "TWTR", "UBER", "LYFT", "ROKU", "ZM"]
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      const losers = symbols
        .slice(0, limit)
        .map((symbol) => {
          const basePrice = Math.random() * 500 + 50
          const change = -(Math.random() * 20 + 5) // Ensure negative change
          const changePercent = (change / basePrice) * 100

          return {
            symbol,
            price: Number(basePrice.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            volume: Math.floor(Math.random() * 10000000) + 1000000,
          }
        })
        .sort((a, b) => a.changePercent - b.changePercent)

      return NextResponse.json({ data: losers })
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error) {
    console.error("Market API error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
