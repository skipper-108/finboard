"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react"

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
  pe?: number
}

interface StockTableProps {
  title?: string
  symbols?: string[]
  className?: string
}

// Mock stock data
const generateMockStockData = (symbols: string[]): StockData[] => {
  const stockNames: Record<string, string> = {
    AAPL: "Apple Inc.",
    GOOGL: "Alphabet Inc.",
    MSFT: "Microsoft Corp.",
    AMZN: "Amazon.com Inc.",
    TSLA: "Tesla Inc.",
    META: "Meta Platforms Inc.",
    NVDA: "NVIDIA Corp.",
    AMD: "Advanced Micro Devices",
    NFLX: "Netflix Inc.",
    CRM: "Salesforce Inc.",
  }

  return symbols.map((symbol) => {
    const basePrice = Math.random() * 500 + 50
    const change = (Math.random() - 0.5) * 20
    const changePercent = (change / basePrice) * 100

    return {
      symbol,
      name: stockNames[symbol] || `${symbol} Corp.`,
      price: Number(basePrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: `$${(Math.random() * 2000 + 100).toFixed(1)}B`,
      pe: Number((Math.random() * 50 + 10).toFixed(1)),
    }
  })
}

export function StockTable({
  title = "Stock Table",
  symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "AMD", "NFLX", "CRM"],
  className,
}: StockTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof StockData>("symbol")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const stockData = generateMockStockData(symbols)

  // Filter and sort data
  const filteredData = stockData.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: keyof StockData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort("symbol")}>
                  Symbol <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Company</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort("price")}>
                  Price <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort("changePercent")}>
                  Change <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" onClick={() => handleSort("volume")}>
                  Volume <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Market Cap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((stock) => (
              <TableRow key={stock.symbol}>
                <TableCell className="font-medium">{stock.symbol}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{stock.name}</TableCell>
                <TableCell className="font-medium">${stock.price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <Badge variant={stock.change >= 0 ? "default" : "destructive"} className="text-xs">
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{stock.volume.toLocaleString()}</TableCell>
                <TableCell className="text-sm">{stock.marketCap}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length}{" "}
            results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
