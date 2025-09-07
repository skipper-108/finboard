import { type NextRequest, NextResponse } from "next/server"

const generateMockChartData = (symbol: string, days = 30) => {
  const data = []
  const basePrice = Math.random() * 500 + 50
  let currentPrice = basePrice

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const change = (Math.random() - 0.5) * 10
    currentPrice = Math.max(currentPrice + change, basePrice * 0.8)

    data.push({
      timestamp: date.toISOString().split("T")[0],
      price: Number(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000,
      high: Number((currentPrice + Math.random() * 5).toFixed(2)),
      low: Number((currentPrice - Math.random() * 5).toFixed(2)),
      open: Number((currentPrice + (Math.random() - 0.5) * 3).toFixed(2)),
      close: Number(currentPrice.toFixed(2)),
    })
  }

  return data
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const interval = searchParams.get("interval") || "1D"
    const period = searchParams.get("period") || "1M"

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter required" }, { status: 400 })
    }

    const days = period === "1M" ? 30 : period === "1W" ? 7 : 1
    const chartData = generateMockChartData(symbol, days)

    return NextResponse.json({ data: chartData })
  } catch (error) {
    console.error("Chart API error:", error)
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}
