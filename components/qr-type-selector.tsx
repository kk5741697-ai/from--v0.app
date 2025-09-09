"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Link,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  User,
  Wifi,
  Calendar,
  MapPin,
  CreditCard,
  Bitcoin,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
} from "lucide-react"

export interface QRType {
  id: string
  label: string
  icon: any
  category: "basic" | "contact" | "social" | "payment"
  description: string
}

export const qrTypes: QRType[] = [
  // Basic Types
  { id: "url", label: "Website URL", icon: Link, category: "basic", description: "Link to any website or webpage" },
  { id: "text", label: "Plain Text", icon: FileText, category: "basic", description: "Simple text message or note" },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    category: "contact",
    description: "Send email with pre-filled subject and body",
  },
  { id: "phone", label: "Phone Call", icon: Phone, category: "contact", description: "Direct phone call to number" },
  {
    id: "sms",
    label: "SMS Message",
    icon: MessageSquare,
    category: "contact",
    description: "Send SMS with pre-written message",
  },

  // Contact & Business
  {
    id: "vcard",
    label: "Contact Card",
    icon: User,
    category: "contact",
    description: "Complete contact information (vCard)",
  },
  {
    id: "wifi",
    label: "WiFi Network",
    icon: Wifi,
    category: "basic",
    description: "Connect to WiFi network automatically",
  },
  { id: "event", label: "Calendar Event", icon: Calendar, category: "contact", description: "Add event to calendar" },
  { id: "location", label: "GPS Location", icon: MapPin, category: "basic", description: "Show location on map" },

  // Payment & Crypto
  {
    id: "paypal",
    label: "PayPal Payment",
    icon: CreditCard,
    category: "payment",
    description: "Request PayPal payment",
  },
  {
    id: "bitcoin",
    label: "Bitcoin Address",
    icon: Bitcoin,
    category: "payment",
    description: "Bitcoin wallet address",
  },

  // Social Media
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    category: "social",
    description: "Link to Instagram profile",
  },
  { id: "twitter", label: "Twitter/X", icon: Twitter, category: "social", description: "Link to Twitter/X profile" },
  { id: "facebook", label: "Facebook", icon: Facebook, category: "social", description: "Link to Facebook profile" },
  { id: "youtube", label: "YouTube", icon: Youtube, category: "social", description: "Link to YouTube channel" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, category: "social", description: "Link to LinkedIn profile" },
]

interface QRTypeSelectorProps {
  activeType: string
  onTypeChange: (type: string) => void
  className?: string
}

export function QRTypeSelector({ activeType, onTypeChange, className }: QRTypeSelectorProps) {
  const categories = {
    basic: "Essential",
    contact: "Contact & Business",
    social: "Social Media",
    payment: "Payment & Crypto",
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {Object.entries(categories).map(([categoryId, categoryName]) => {
          const categoryTypes = qrTypes.filter((type) => type.category === categoryId)

          return (
            <div key={categoryId} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm text-muted-foreground">{categoryName}</h3>
                <Badge variant="secondary" className="text-xs">
                  {categoryTypes.length}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {categoryTypes.map((type) => {
                  const Icon = type.icon
                  const isActive = activeType === type.id

                  return (
                    <Button
                      key={type.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => onTypeChange(type.id)}
                      className={`h-auto p-3 flex flex-col items-center gap-2 text-center transition-all ${
                        isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted/50"
                      }`}
                      title={type.description}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-medium leading-tight">{type.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
