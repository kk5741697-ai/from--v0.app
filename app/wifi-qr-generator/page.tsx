"use client"

import { useState } from "react"
import { QRTypeSelector } from "@/components/qr-type-selector"
import { QRContentForms } from "@/components/qr-content-forms"

export default function QRCodeGeneratorPage() {
  const [activeType, setActiveType] = useState("website")
  const [content, setContent] = useState("")
  const [emailData, setEmailData] = useState({ to: "", subject: "", body: "" })
  const [phoneData, setPhoneData] = useState({ phoneNumber: "", vCard: false })
  const [smsData, setSmsData] = useState({ phoneNumber: "", message: "" })
  const [wifiData, setWifiData] = useState({ ssid: "", password: "", encryption: "WPA" })
  const [vcardData, setVcardData] = useState({ firstName: "", lastName: "", phoneNumber: "", email: "" })
  const [eventData, setEventData] = useState({ summary: "", location: "", dtstart: "", dtend: "" })
  const [paymentData, setPaymentData] = useState({ amount: "", currency: "USD", description: "", recipient: "" })

  const generateQRContent = () => {
    try {
      switch (activeType) {
        case "website":
          return content
        case "email":
          return `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`
        case "phone":
          return phoneData.vCard
            ? `vcard:${vcardData.firstName};${vcardData.lastName};${vcardData.phoneNumber};${vcardData.email}`
            : `tel:${phoneData.phoneNumber}`
        case "sms":
          return `sms:${smsData.phoneNumber}?body=${encodeURIComponent(smsData.message)}`
        case "wifi":
          return `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};;`
        case "paypal":
          if (!paymentData.recipient.trim()) return ""
          return `https://paypal.me/${paymentData.recipient}${paymentData.amount ? `/${paymentData.amount}${paymentData.currency}` : ""}`
        case "bitcoin":
          if (!paymentData.recipient.trim()) return ""
          return `bitcoin:${paymentData.recipient}${paymentData.amount ? `?amount=${paymentData.amount}` : ""}${paymentData.description ? `&label=${encodeURIComponent(paymentData.description)}` : ""}`
        case "instagram":
        case "twitter":
        case "facebook":
        case "youtube":
        case "linkedin":
          return content
        default:
          return ""
      }
    } catch (error) {
      console.error("Error generating QR content:", error)
      return ""
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">QR Code Generator</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create professional QR codes for websites, WiFi, contacts, payments, and more. Customize colors, add
              logos, and download in multiple formats.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - QR Type Selection */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h2 className="text-lg font-semibold mb-4">Choose QR Code Type</h2>
                <QRTypeSelector activeType={activeType} onTypeChange={setActiveType} />
              </div>
            </div>

            {/* Middle Panel - Content Form */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Enter Content</h2>
                  <QRContentForms
                    activeType={activeType}
                    content={content}
                    onContentChange={setContent}
                    emailData={emailData}
                    onEmailDataChange={setEmailData}
                    phoneData={phoneData}
                    onPhoneDataChange={setPhoneData}
                    smsData={smsData}
                    onSmsDataChange={setSmsData}
                    wifiData={wifiData}
                    onWifiDataChange={setWifiData}
                    vcardData={vcardData}
                    onVcardDataChange={setVcardData}
                    eventData={eventData}
                    onEventDataChange={setEventData}
                    paymentData={paymentData}
                    onPaymentDataChange={setPaymentData}
                  />
                </div>

                {/* ... existing styling options ... */}
              </div>
            </div>

            {/* Right Panel - Preview and Download */}
            <div className="lg:col-span-1">{/* ... existing preview and download section ... */}</div>
          </div>
        </div>
      </main>
    </div>
  )
}
