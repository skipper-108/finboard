"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { financialApi, type StockQuote, type ChartDataPoint, type MarketIndex } from "@/lib/api/financial-api"
import { useSettings } from "@/lib/stores/dashboard-store"

// Custom hook for stock quotes with settings integration
export function useStockQuote(symbol: string, customRefreshInterval?: number) {
  const [data, setData] = useState<StockQuote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const settings = useSettings()
  const refreshInterval = useMemo(() => {
    return customRefreshInterval || (settings.autoRefresh ? settings.refreshInterval : 0)
  }, [customRefreshInterval, settings.autoRefresh, settings.refreshInterval])

  const fetchQuote = useCallback(async () => {
    if (!symbol) return

    try {
      setLoading(true)
      setError(null)
      const quote = await financialApi.getStockQuote(symbol)
      setData(quote)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch quote"
      setError(errorMessage)
      console.error(`Quote fetch error for ${symbol}:`, err)
    } finally {
      setLoading(false)
    }
  }, [symbol])

  useEffect(() => {
    fetchQuote()

    // Set up auto-refresh based on settings
    if (refreshInterval > 0) {
      const interval = setInterval(fetchQuote, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchQuote, refreshInterval])

  return { data, loading, error, refetch: fetchQuote }
}

// Custom hook for multiple stock quotes with settings integration
export function useMultipleQuotes(symbols: string[], customRefreshInterval?: number) {
  const [data, setData] = useState<StockQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const settings = useSettings()
  const refreshInterval = useMemo(() => {
    return customRefreshInterval || (settings.autoRefresh ? settings.refreshInterval : 0)
  }, [customRefreshInterval, settings.autoRefresh, settings.refreshInterval])

  const symbolsString = useMemo(() => symbols.join(","), [symbols])

  const fetchQuotes = useCallback(async () => {
    if (!symbols.length) return

    try {
      setLoading(true)
      setError(null)
      const quotes = await financialApi.getMultipleQuotes(symbols)
      setData(quotes)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch quotes"
      setError(errorMessage)
      console.error(`Multiple quotes fetch error for ${symbols.join(",")}:`, err)
    } finally {
      setLoading(false)
    }
  }, [symbolsString])

  useEffect(() => {
    fetchQuotes()

    // Set up auto-refresh based on settings
    if (refreshInterval > 0) {
      const interval = setInterval(fetchQuotes, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchQuotes, refreshInterval])

  return { data, loading, error, refetch: fetchQuotes }
}

// Custom hook for chart data
export function useChartData(symbol: string, interval = "1D", period = "1M") {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChartData = useCallback(async () => {
    if (!symbol) return

    try {
      setLoading(true)
      setError(null)
      const chartData = await financialApi.getChartData(symbol, interval, period)
      setData(chartData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch chart data"
      setError(errorMessage)
      console.error(`Chart data fetch error for ${symbol}:`, err)
    } finally {
      setLoading(false)
    }
  }, [symbol, interval, period])

  useEffect(() => {
    fetchChartData()
  }, [fetchChartData])

  return { data, loading, error, refetch: fetchChartData }
}

// Custom hook for market indices with settings integration
export function useMarketIndices(customRefreshInterval?: number) {
  const [data, setData] = useState<MarketIndex[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const settings = useSettings()
  const refreshInterval = useMemo(() => {
    return customRefreshInterval || (settings.autoRefresh ? settings.refreshInterval : 0)
  }, [customRefreshInterval, settings.autoRefresh, settings.refreshInterval])

  const fetchIndices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const indices = await financialApi.getMarketIndices()
      setData(indices)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch market indices"
      setError(errorMessage)
      console.error("Market indices fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIndices()

    // Set up auto-refresh based on settings
    if (refreshInterval > 0) {
      const interval = setInterval(fetchIndices, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchIndices, refreshInterval])

  return { data, loading, error, refetch: fetchIndices }
}

// Custom hook for top gainers with settings integration
export function useTopGainers(limit = 10, customRefreshInterval?: number) {
  const [data, setData] = useState<StockQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const settings = useSettings()
  const refreshInterval = useMemo(() => {
    return customRefreshInterval || (settings.autoRefresh ? settings.refreshInterval : 0)
  }, [customRefreshInterval, settings.autoRefresh, settings.refreshInterval])

  const fetchGainers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const gainers = await financialApi.getTopGainers(limit)
      setData(gainers)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch top gainers"
      setError(errorMessage)
      console.error("Top gainers fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchGainers()

    // Set up auto-refresh based on settings
    if (refreshInterval > 0) {
      const interval = setInterval(fetchGainers, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchGainers, refreshInterval])

  return { data, loading, error, refetch: fetchGainers }
}

// Custom hook for top losers with settings integration
export function useTopLosers(limit = 10, customRefreshInterval?: number) {
  const [data, setData] = useState<StockQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const settings = useSettings()
  const refreshInterval = useMemo(() => {
    return customRefreshInterval || (settings.autoRefresh ? settings.refreshInterval : 0)
  }, [customRefreshInterval, settings.autoRefresh, settings.refreshInterval])

  const fetchLosers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const losers = await financialApi.getTopLosers(limit)
      setData(losers)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch top losers"
      setError(errorMessage)
      console.error("Top losers fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchLosers()

    // Set up auto-refresh based on settings
    if (refreshInterval > 0) {
      const interval = setInterval(fetchLosers, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchLosers, refreshInterval])

  return { data, loading, error, refetch: fetchLosers }
}

// Custom hook for API health monitoring
export function useApiHealth() {
  const [status, setStatus] = useState<"checking" | "healthy" | "error">("checking")
  const [message, setMessage] = useState<string>("")

  const checkHealth = useCallback(async () => {
    try {
      setStatus("checking")
      const health = await financialApi.checkApiHealth()
      setStatus(health.status)
      setMessage(health.message)
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Health check failed")
      console.error("API health check error:", err)
    }
  }, [])

  useEffect(() => {
    checkHealth()

    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 300000)
    return () => clearInterval(interval)
  }, [checkHealth])

  return { status, message, checkHealth }
}
