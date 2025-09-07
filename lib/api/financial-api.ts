"use client"

// Financial API Integration Layer - Client-side wrapper for server API routes

export interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: string
  pe?: number
  high?: number
  low?: number
  open?: number
  previousClose?: number
}

export interface ChartDataPoint {
  timestamp: string
  price: number
  volume?: number
  high?: number
  low?: number
  open?: number
  close?: number
}

export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

// Cache utility for client-side caching
class ApiCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  set(key: string, data: any, ttlMinutes = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    })
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  clear(): void {
    this.cache.clear()
  }
}

const apiCache = new ApiCache()

export class FinancialApiService {
  private baseUrl = "/api/financial"

  private async makeRequest(endpoint: string, params: URLSearchParams, cacheKey: string, cacheTtl = 5): Promise<any> {
    // Check cache first
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const url = `${this.baseUrl}${endpoint}?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Cache the response
      apiCache.set(cacheKey, result.data, cacheTtl)

      return result.data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    const cacheKey = `quote_${symbol}`
    const params = new URLSearchParams({ symbol })

    try {
      return await this.makeRequest("/quote", params, cacheKey, 1) // 1 minute cache for quotes
    } catch (error) {
      console.warn(`Failed to fetch quote for ${symbol}:`, error)
      throw error
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const cacheKey = `quotes_${symbols.join(",")}`
    const params = new URLSearchParams({ symbols: symbols.join(",") })

    try {
      return await this.makeRequest("/quote", params, cacheKey, 1)
    } catch (error) {
      console.warn(`Failed to fetch quotes for ${symbols.join(",")}:`, error)
      throw error
    }
  }

  async getChartData(symbol: string, interval = "1D", period = "1M"): Promise<ChartDataPoint[]> {
    const cacheKey = `chart_${symbol}_${interval}_${period}`
    const params = new URLSearchParams({ symbol, interval, period })

    try {
      return await this.makeRequest("/chart", params, cacheKey, 5)
    } catch (error) {
      console.warn(`Failed to fetch chart data for ${symbol}:`, error)
      throw error
    }
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    const cacheKey = "market_indices"
    const params = new URLSearchParams({ type: "indices" })

    try {
      return await this.makeRequest("/market", params, cacheKey, 5)
    } catch (error) {
      console.warn("Failed to fetch market indices:", error)
      throw error
    }
  }

  async getTopGainers(limit = 10): Promise<StockQuote[]> {
    const cacheKey = `gainers_${limit}`
    const params = new URLSearchParams({ type: "gainers", limit: limit.toString() })

    try {
      return await this.makeRequest("/market", params, cacheKey, 2)
    } catch (error) {
      console.warn("Failed to fetch top gainers:", error)
      throw error
    }
  }

  async getTopLosers(limit = 10): Promise<StockQuote[]> {
    const cacheKey = `losers_${limit}`
    const params = new URLSearchParams({ type: "losers", limit: limit.toString() })

    try {
      return await this.makeRequest("/market", params, cacheKey, 2)
    } catch (error) {
      console.warn("Failed to fetch top losers:", error)
      throw error
    }
  }

  // Utility method to clear cache
  clearCache(): void {
    apiCache.clear()
  }

  // Method to check API health
  async checkApiHealth(): Promise<{ provider: string; status: "healthy" | "error"; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Health check failed")
      }

      return result.data
    } catch (error) {
      return {
        provider: "Server API",
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

// Export singleton instance
export const financialApi = new FinancialApiService()

// All API calls now go through our secure server routes
