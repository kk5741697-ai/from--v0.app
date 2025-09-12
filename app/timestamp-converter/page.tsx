"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Copy, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function TimestampConverterPage() {
  const [timestamp, setTimestamp] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [humanDate, setHumanDate] = useState("")
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000))

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
    { value: "Europe/London", label: "London" },
    { value: "Europe/Paris", label: "Paris" },
    { value: "Asia/Tokyo", label: "Tokyo" },
    { value: "Asia/Shanghai", label: "Shanghai" },
  ]

  const convertFromTimestamp = () => {
    if (!timestamp.trim()) {
      setHumanDate("")
      return
    }

    try {
      const ts = parseInt(timestamp)
      if (isNaN(ts)) {
        toast({
          title: "Invalid timestamp",
          description: "Please enter a valid Unix timestamp",
          variant: "destructive"
        })
        return
      }

      const date = new Date(ts * 1000)
      const formatted = date.toLocaleString("en-US", {
        timeZone: timezone === "UTC" ? "UTC" : timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short"
      })

      setHumanDate(formatted)
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Invalid timestamp format",
        variant: "destructive"
      })
    }
  }

  const convertToTimestamp = () => {
    if (!humanDate.trim()) {
      setTimestamp("")
      return
    }

    try {
      const date = new Date(humanDate)
      if (isNaN(date.getTime())) {
        toast({
          title: "Invalid date",
          description: "Please enter a valid date",
          variant: "destructive"
        })
        return
      }

      const ts = Math.floor(date.getTime() / 1000)
      setTimestamp(ts.toString())
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Invalid date format",
        variant: "destructive"
      })
    }
  }

  const useCurrentTime = () => {
    const now = Math.floor(Date.now() / 1000)
    setTimestamp(now.toString())
    setCurrentTimestamp(now)
    convertFromTimestamp()
  }

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value)
    toast({
      title: "Copied to clipboard",
      description: "Value copied successfully"
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Clock className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Timestamp Converter</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert between Unix timestamps and human-readable dates with timezone support.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Current Time */}
          <Card>
            <CardHeader>
              <CardTitle>Current Time</CardTitle>
              <CardDescription>Current Unix timestamp and date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Timestamp</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={currentTimestamp} readOnly className="font-mono" />
                    <Button variant="outline" size="icon" onClick={() => copyValue(currentTimestamp.toString())}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Current Date</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={new Date().toLocaleString()} readOnly />
                    <Button variant="outline" size="icon" onClick={useCurrentTime}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamp to Date */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamp to Date</CardTitle>
              <CardDescription>Convert Unix timestamp to human-readable date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timestamp-input">Unix Timestamp</Label>
                <Input
                  id="timestamp-input"
                  value={timestamp}
                  onChange={(e) => {
                    setTimestamp(e.target.value)
                    convertFromTimestamp()
                  }}
                  placeholder="1640995200"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Human-Readable Date</Label>
                <div className="flex items-center space-x-2">
                  <Input value={humanDate} readOnly />
                  <Button variant="outline" size="icon" onClick={() => copyValue(humanDate)} disabled={!humanDate}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date to Timestamp */}
          <Card>
            <CardHeader>
              <CardTitle>Date to Timestamp</CardTitle>
              <CardDescription>Convert human-readable date to Unix timestamp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date-input">Date and Time</Label>
                <Input
                  id="date-input"
                  type="datetime-local"
                  value={humanDate}
                  onChange={(e) => {
                    setHumanDate(e.target.value)
                    convertToTimestamp()
                  }}
                />
              </div>

              <div>
                <Label>Unix Timestamp</Label>
                <div className="flex items-center space-x-2">
                  <Input value={timestamp} readOnly className="font-mono" />
                  <Button variant="outline" size="icon" onClick={() => copyValue(timestamp)} disabled={!timestamp}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}