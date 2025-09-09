"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"

interface QRContentFormsProps {
  activeType: string
  content: string
  onContentChange: (content: string) => void
  // Type-specific data
  emailData: { email: string; subject: string; body: string }
  onEmailDataChange: (data: { email: string; subject: string; body: string }) => void
  phoneData: { phone: string }
  onPhoneDataChange: (data: { phone: string }) => void
  smsData: { phone: string; message: string }
  onSmsDataChange: (data: { phone: string; message: string }) => void
  wifiData: { ssid: string; password: string; security: string; hidden: boolean }
  onWifiDataChange: (data: { ssid: string; password: string; security: string; hidden: boolean }) => void
  vcardData: {
    firstName: string
    lastName: string
    organization: string
    phone: string
    email: string
    url: string
    address: string
  }
  onVcardDataChange: (data: {
    firstName: string
    lastName: string
    organization: string
    phone: string
    email: string
    url: string
    address: string
  }) => void
  eventData: { title: string; location: string; startDate: string; endDate: string; description: string }
  onEventDataChange: (data: {
    title: string
    location: string
    startDate: string
    endDate: string
    description: string
  }) => void
  paymentData: { amount: string; currency: string; description: string; recipient: string }
  onPaymentDataChange: (data: { amount: string; currency: string; description: string; recipient: string }) => void
}

export function QRContentForms({
  activeType,
  content,
  onContentChange,
  emailData,
  onEmailDataChange,
  phoneData,
  onPhoneDataChange,
  smsData,
  onSmsDataChange,
  wifiData,
  onWifiDataChange,
  vcardData,
  onVcardDataChange,
  eventData,
  onEventDataChange,
  paymentData,
  onPaymentDataChange,
}: QRContentFormsProps) {
  const renderForm = () => {
    switch (activeType) {
      case "url":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
              />
            </div>
          </div>
        )

      case "text":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Text Content</Label>
              <Textarea
                id="text"
                placeholder="Enter your text message..."
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )

      case "email":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                value={emailData.email}
                onChange={(e) => onEmailDataChange({ ...emailData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={emailData.subject}
                onChange={(e) => onEmailDataChange({ ...emailData, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Email message..."
                value={emailData.body}
                onChange={(e) => onEmailDataChange({ ...emailData, body: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )

      case "phone":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneData.phone}
                onChange={(e) => onPhoneDataChange({ phone: e.target.value })}
              />
            </div>
          </div>
        )

      case "sms":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sms-phone">Phone Number</Label>
              <Input
                id="sms-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={smsData.phone}
                onChange={(e) => onSmsDataChange({ ...smsData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                placeholder="SMS message..."
                value={smsData.message}
                onChange={(e) => onSmsDataChange({ ...smsData, message: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )

      case "wifi":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <Input
                id="ssid"
                placeholder="MyWiFiNetwork"
                value={wifiData.ssid}
                onChange={(e) => onWifiDataChange({ ...wifiData, ssid: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="wifi-password">Password</Label>
              <Input
                id="wifi-password"
                type="password"
                placeholder="Network password"
                value={wifiData.password}
                onChange={(e) => onWifiDataChange({ ...wifiData, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="security">Security Type</Label>
              <Select
                value={wifiData.security}
                onValueChange={(value) => onWifiDataChange({ ...wifiData, security: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hidden"
                checked={wifiData.hidden}
                onCheckedChange={(checked) => onWifiDataChange({ ...wifiData, hidden: checked })}
              />
              <Label htmlFor="hidden">Hidden Network</Label>
            </div>
          </div>
        )

      case "vcard":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={vcardData.firstName}
                  onChange={(e) => onVcardDataChange({ ...vcardData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={vcardData.lastName}
                  onChange={(e) => onVcardDataChange({ ...vcardData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="Company Name"
                value={vcardData.organization}
                onChange={(e) => onVcardDataChange({ ...vcardData, organization: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vcard-phone">Phone</Label>
              <Input
                id="vcard-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={vcardData.phone}
                onChange={(e) => onVcardDataChange({ ...vcardData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vcard-email">Email</Label>
              <Input
                id="vcard-email"
                type="email"
                placeholder="john@example.com"
                value={vcardData.email}
                onChange={(e) => onVcardDataChange({ ...vcardData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vcard-url">Website</Label>
              <Input
                id="vcard-url"
                type="url"
                placeholder="https://example.com"
                value={vcardData.url}
                onChange={(e) => onVcardDataChange({ ...vcardData, url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="123 Main St, City, State 12345"
                value={vcardData.address}
                onChange={(e) => onVcardDataChange({ ...vcardData, address: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        )

      case "event":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                placeholder="Meeting Title"
                value={eventData.title}
                onChange={(e) => onEventDataChange({ ...eventData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                placeholder="Conference Room A"
                value={eventData.location}
                onChange={(e) => onEventDataChange({ ...eventData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date & Time</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={eventData.startDate}
                  onChange={(e) => onEventDataChange({ ...eventData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date & Time</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={eventData.endDate}
                  onChange={(e) => onEventDataChange({ ...eventData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                placeholder="Event description..."
                value={eventData.description}
                onChange={(e) => onEventDataChange({ ...eventData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )

      case "location":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">GPS Coordinates</Label>
              <Input
                id="location"
                placeholder="37.7749,-122.4194 or address"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Enter coordinates (lat,lng) or a full address</p>
            </div>
          </div>
        )

      case "paypal":
      case "bitcoin":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">{activeType === "paypal" ? "PayPal Email" : "Bitcoin Address"}</Label>
              <Input
                id="recipient"
                placeholder={activeType === "paypal" ? "paypal@example.com" : "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"}
                value={paymentData.recipient}
                onChange={(e) => onPaymentDataChange({ ...paymentData, recipient: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentData.amount}
                  onChange={(e) => onPaymentDataChange({ ...paymentData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={paymentData.currency}
                  onValueChange={(value) => onPaymentDataChange({ ...paymentData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="payment-description">Description</Label>
              <Input
                id="payment-description"
                placeholder="Payment for..."
                value={paymentData.description}
                onChange={(e) => onPaymentDataChange({ ...paymentData, description: e.target.value })}
              />
            </div>
          </div>
        )

      case "instagram":
      case "twitter":
      case "facebook":
      case "youtube":
      case "linkedin":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="social-url">{activeType.charAt(0).toUpperCase() + activeType.slice(1)} Profile URL</Label>
              <Input
                id="social-url"
                type="url"
                placeholder={`https://${activeType}.com/username`}
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-content">Content</Label>
              <Textarea
                id="default-content"
                placeholder="Enter content..."
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )
    }
  }

  return (
    <Card>
      <CardContent className="p-6">{renderForm()}</CardContent>
    </Card>
  )
}
