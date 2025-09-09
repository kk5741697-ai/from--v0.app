import { Shield, Target, Award, TrendingUp, Users, CheckCircle, Maximize, Eye } from "lucide-react"

export const imageToolsContent = {
  "image-cropper": {
    faqs: [
      {
        question: "What image formats are supported for cropping?",
        answer:
          "Our image cropper supports all major formats including JPG, PNG, WebP, GIF, and BMP. The tool automatically detects the format and maintains quality during cropping.",
      },
      {
        question: "Can I crop multiple images at once?",
        answer:
          "Currently, the cropper processes one image at a time to ensure optimal quality and precision. For batch processing, you can use our bulk image processing tools.",
      },
      {
        question: "How do I maintain aspect ratio while cropping?",
        answer:
          "Use the aspect ratio presets (1:1, 4:3, 16:9, etc.) or hold Shift while dragging to maintain proportions. You can also enter custom aspect ratios in the options panel.",
      },
      {
        question: "What's the maximum file size I can crop?",
        answer:
          "Free users can crop images up to 50MB. The tool processes everything locally in your browser, so larger files may take longer depending on your device's performance.",
      },
      {
        question: "Will cropping reduce image quality?",
        answer:
          "No, cropping only removes pixels outside the selected area without compressing the remaining image. The quality of the cropped area remains identical to the original.",
      },
    ],
    tutorials: [
      {
        title: "Basic Image Cropping Guide",
        description: "Learn the fundamentals of cropping images with precision and maintaining quality.",
        difficulty: "Beginner" as const,
        duration: "5 min",
        rating: 4.8,
        views: "125k",
        type: "guide" as const,
      },
      {
        title: "Advanced Cropping Techniques",
        description: "Master aspect ratios, custom dimensions, and professional cropping workflows.",
        difficulty: "Intermediate" as const,
        duration: "8 min",
        rating: 4.9,
        views: "89k",
        type: "video" as const,
      },
      {
        title: "Batch Cropping Workflow",
        description: "Efficient methods for cropping multiple images with consistent dimensions.",
        difficulty: "Advanced" as const,
        duration: "12 min",
        rating: 4.7,
        views: "56k",
        type: "article" as const,
      },
    ],
    tips: [
      {
        title: "Use Grid Lines for Better Composition",
        description:
          "Enable the rule of thirds grid to create more visually appealing crops. Position important elements along the grid lines or at intersection points.",
        category: "Composition",
        difficulty: "Beginner" as const,
      },
      {
        title: "Preview Before Downloading",
        description:
          "Always use the preview feature to check your crop before downloading. This saves time and ensures you get the exact result you want.",
        category: "Workflow",
        difficulty: "Beginner" as const,
      },
      {
        title: "Keyboard Shortcuts for Precision",
        description:
          "Use arrow keys for pixel-perfect adjustments and Shift+drag to maintain aspect ratios. These shortcuts dramatically improve cropping accuracy.",
        category: "Efficiency",
        difficulty: "Intermediate" as const,
      },
      {
        title: "Consider Output Usage",
        description:
          "Crop differently for social media, print, or web use. Each platform has optimal dimensions that affect how your image appears.",
        category: "Strategy",
        difficulty: "Intermediate" as const,
      },
      {
        title: "Preserve Important Details",
        description:
          "When cropping portraits, ensure eyes are properly positioned and important facial features aren't cut off at awkward points.",
        category: "Composition",
        difficulty: "Advanced" as const,
      },
      {
        title: "Batch Processing Strategy",
        description:
          "For multiple similar images, establish your crop settings first, then apply the same dimensions to maintain consistency across your image set.",
        category: "Workflow",
        difficulty: "Advanced" as const,
      },
    ],
    bestPractices: [
      {
        title: "Maintain Image Quality",
        description:
          "Always work with the highest quality original image available. Cropping doesn't reduce quality, but starting with a high-resolution image gives you more flexibility.",
        icon: Award,
        benefits: [
          "Better detail preservation",
          "More cropping flexibility",
          "Professional results",
          "Future-proof output",
        ],
      },
      {
        title: "Plan Your Composition",
        description:
          "Before cropping, consider the final use case and apply composition rules like the rule of thirds, leading lines, and balanced elements.",
        icon: Target,
        benefits: [
          "More engaging images",
          "Professional appearance",
          "Better visual impact",
          "Improved user engagement",
        ],
      },
      {
        title: "Optimize for Platform",
        description:
          "Different platforms have different optimal dimensions. Crop specifically for where the image will be used to ensure the best presentation.",
        icon: TrendingUp,
        benefits: [
          "Platform-optimized display",
          "Consistent branding",
          "Better engagement rates",
          "Professional presentation",
        ],
      },
      {
        title: "Backup Original Files",
        description:
          "Always keep your original images before cropping. This allows you to re-crop differently if needed or use the full image for other purposes.",
        icon: Shield,
        benefits: ["Non-destructive workflow", "Multiple crop options", "Future flexibility", "Risk mitigation"],
      },
    ],
    useCases: [
      "Social media post optimization",
      "Profile picture creation",
      "Product photography editing",
      "Website banner creation",
      "Print material preparation",
      "Email newsletter images",
      "Blog post thumbnails",
      "E-commerce product photos",
      "Portfolio image curation",
      "Marketing material design",
      "Presentation slide images",
      "Mobile app screenshots",
    ],
  },
  "image-resizer": {
    faqs: [
      {
        question: "What's the difference between resizing and scaling?",
        answer:
          "Resizing changes the actual pixel dimensions of an image, while scaling changes how large it appears. Our tool performs true resizing, changing the file size and dimensions.",
      },
      {
        question: "Will resizing affect image quality?",
        answer:
          "Enlarging images may reduce quality, but our advanced algorithms minimize quality loss. Reducing image size typically maintains good quality, especially with our smart compression.",
      },
      {
        question: "Can I resize images while maintaining aspect ratio?",
        answer:
          "Yes! Enable 'Lock Aspect Ratio' to automatically adjust height when you change width (or vice versa). This prevents image distortion.",
      },
      {
        question: "What's the maximum resolution I can resize to?",
        answer:
          "You can resize up to 8K resolution (7680×4320 pixels). However, enlarging beyond the original size may result in quality loss.",
      },
      {
        question: "How do I resize for specific platforms?",
        answer:
          "Use our preset dimensions for popular platforms like Instagram (1080×1080), Facebook cover (820×312), or YouTube thumbnail (1280×720).",
      },
    ],
    tutorials: [
      {
        title: "Image Resizing Fundamentals",
        description: "Master the basics of image resizing, aspect ratios, and quality preservation techniques.",
        difficulty: "Beginner" as const,
        duration: "6 min",
        rating: 4.9,
        views: "156k",
        type: "guide" as const,
      },
      {
        title: "Platform-Specific Resizing",
        description: "Learn optimal dimensions for social media, web, and print applications.",
        difficulty: "Intermediate" as const,
        duration: "10 min",
        rating: 4.8,
        views: "98k",
        type: "video" as const,
      },
      {
        title: "Batch Resizing Workflow",
        description: "Efficiently resize multiple images with consistent settings and quality.",
        difficulty: "Advanced" as const,
        duration: "15 min",
        rating: 4.7,
        views: "67k",
        type: "article" as const,
      },
    ],
    tips: [
      {
        title: "Use Percentage for Proportional Scaling",
        description:
          "When you need to reduce file size while maintaining proportions, use percentage scaling (e.g., 50%) rather than fixed dimensions.",
        category: "Scaling",
        difficulty: "Beginner" as const,
      },
      {
        title: "Consider Final Output Medium",
        description:
          "Web images need different resolutions than print. Web typically uses 72-96 DPI, while print requires 300 DPI for quality results.",
        category: "Output",
        difficulty: "Intermediate" as const,
      },
      {
        title: "Optimize for Loading Speed",
        description:
          "For web use, balance image quality with file size. Smaller dimensions with good quality often perform better than large, compressed images.",
        category: "Performance",
        difficulty: "Intermediate" as const,
      },
      {
        title: "Upscaling Best Practices",
        description:
          "When enlarging images, don't exceed 200% of original size for photos. Vector-style images can be enlarged more without quality loss.",
        category: "Quality",
        difficulty: "Advanced" as const,
      },
      {
        title: "Batch Processing Efficiency",
        description:
          "For multiple images, establish your resize settings first, then process all images with the same parameters for consistency.",
        category: "Workflow",
        difficulty: "Advanced" as const,
      },
      {
        title: "Mobile Optimization",
        description:
          "Create multiple sizes for responsive design: thumbnail (150px), medium (600px), and large (1200px) versions of important images.",
        category: "Responsive",
        difficulty: "Advanced" as const,
      },
    ],
    bestPractices: [
      {
        title: "Preserve Aspect Ratios",
        description:
          "Always maintain original proportions unless specifically creating square or custom aspect ratio images. This prevents distortion and maintains visual integrity.",
        icon: Maximize,
        benefits: [
          "Prevents image distortion",
          "Maintains visual appeal",
          "Professional appearance",
          "Consistent branding",
        ],
      },
      {
        title: "Optimize for Purpose",
        description:
          "Resize images based on their intended use. Web images need different specifications than print materials or social media posts.",
        icon: Target,
        benefits: [
          "Faster loading times",
          "Better user experience",
          "Reduced bandwidth usage",
          "Platform optimization",
        ],
      },
      {
        title: "Quality vs File Size Balance",
        description:
          "Find the sweet spot between image quality and file size. Use our quality slider to achieve the best balance for your specific needs.",
        icon: TrendingUp,
        benefits: ["Optimal performance", "Maintained quality", "Reduced storage costs", "Better SEO scores"],
      },
      {
        title: "Test Across Devices",
        description:
          "Preview resized images on different screen sizes to ensure they look good on desktop, tablet, and mobile devices.",
        icon: Eye,
        benefits: [
          "Consistent user experience",
          "Mobile-friendly design",
          "Better engagement",
          "Professional presentation",
        ],
      },
    ],
    useCases: [
      "Website image optimization",
      "Social media content creation",
      "Email newsletter graphics",
      "E-commerce product images",
      "Blog post illustrations",
      "Mobile app assets",
      "Print material preparation",
      "Thumbnail generation",
      "Avatar and profile pictures",
      "Banner and header images",
      "Presentation slides",
      "Digital marketing materials",
    ],
  },
}

export const pdfToolsContent = {
  "pdf-splitter": {
    faqs: [
      {
        question: "Can I split password-protected PDFs?",
        answer:
          "Yes, but you'll need to provide the password first. Our tool will decrypt the PDF locally in your browser, split it, and you can choose whether to password-protect the resulting files.",
      },
      {
        question: "What's the maximum PDF size I can split?",
        answer:
          "Free users can split PDFs up to 100MB. The processing happens in your browser, so very large files may take longer depending on your device's performance.",
      },
      {
        question: "Can I split specific page ranges?",
        answer:
          "You can specify exact page ranges (e.g., 1-5, 10-15), individual pages, or use our visual page selector to choose which pages to extract.",
      },
      {
        question: "Will splitting affect PDF quality?",
        answer:
          "No, splitting is a lossless operation. The extracted pages maintain exactly the same quality, formatting, and embedded elements as the original PDF.",
      },
      {
        question: "Can I split multiple PDFs at once?",
        answer:
          "Currently, the tool processes one PDF at a time to ensure optimal performance and accuracy. For batch processing, you can use our bulk PDF tools.",
      },
    ],
    tutorials: [
      {
        title: "PDF Splitting Basics",
        description: "Learn how to split PDFs by pages, ranges, and bookmarks with our comprehensive guide.",
        difficulty: "Beginner" as const,
        duration: "4 min",
        rating: 4.9,
        views: "89k",
        type: "guide" as const,
      },
      {
        title: "Advanced Splitting Techniques",
        description: "Master complex splitting scenarios including password-protected files and large documents.",
        difficulty: "Intermediate" as const,
        duration: "8 min",
        rating: 4.8,
        views: "67k",
        type: "video" as const,
      },
      {
        title: "Batch PDF Processing Workflow",
        description: "Efficient methods for processing multiple PDFs with consistent splitting rules.",
        difficulty: "Advanced" as const,
        duration: "12 min",
        rating: 4.7,
        views: "45k",
        type: "article" as const,
      },
    ],
    tips: [
      {
        title: "Use Page Thumbnails for Accuracy",
        description:
          "Preview page thumbnails before splitting to ensure you're selecting the correct pages. This prevents mistakes and saves time.",
        category: "Accuracy",
        difficulty: "Beginner" as const,
      },
      {
        title: "Name Output Files Descriptively",
        description:
          "Use meaningful names for split files like 'Chapter1_Pages1-10.pdf' instead of generic names. This improves organization and findability.",
        category: "Organization",
        difficulty: "Beginner" as const,
      },
      {
        title: "Split by Bookmarks for Chapters",
        description:
          "If your PDF has bookmarks, use them to automatically split into logical sections like chapters or sections.",
        category: "Efficiency",
        difficulty: "Intermediate" as const,
      },
      {
        title: "Consider File Size Distribution",
        description:
          "When splitting large PDFs, aim for reasonably sized output files (5-20MB) for easier sharing and faster loading.",
        category: "Performance",
        difficulty: "Intermediate" as const,
      },
      {
        title: "Preserve Metadata",
        description:
          "Enable metadata preservation to maintain document properties, author information, and creation dates in split files.",
        category: "Data Integrity",
        difficulty: "Advanced" as const,
      },
      {
        title: "Batch Processing Strategy",
        description:
          "For multiple similar documents, establish your splitting rules first, then apply consistently across all files.",
        category: "Workflow",
        difficulty: "Advanced" as const,
      },
    ],
    bestPractices: [
      {
        title: "Plan Your Split Strategy",
        description:
          "Before splitting, determine the logical divisions of your document. Consider chapters, sections, or functional groups for the most useful output.",
        icon: Target,
        benefits: [
          "Logical file organization",
          "Easier document management",
          "Better user experience",
          "Improved workflow efficiency",
        ],
      },
      {
        title: "Maintain Document Security",
        description:
          "If the original PDF was password-protected, consider whether split files need the same level of security based on their content.",
        icon: Shield,
        benefits: [
          "Consistent security policies",
          "Data protection compliance",
          "Controlled access",
          "Risk mitigation",
        ],
      },
      {
        title: "Optimize for Sharing",
        description:
          "Split large documents into smaller, more manageable files that are easier to email, upload, or share through various platforms.",
        icon: Users,
        benefits: ["Faster file transfers", "Better collaboration", "Reduced email bounces", "Improved accessibility"],
      },
      {
        title: "Quality Assurance",
        description:
          "Always verify that split files contain the expected content and maintain proper formatting before distributing or archiving.",
        icon: CheckCircle,
        benefits: ["Error prevention", "Professional reliability", "User satisfaction", "Workflow confidence"],
      },
    ],
    useCases: [
      "Extract specific chapters from books",
      "Separate invoice pages from statements",
      "Create individual forms from packets",
      "Split presentation handouts",
      "Extract pages for review or approval",
      "Create smaller files for email sharing",
      "Separate confidential sections",
      "Archive individual documents",
      "Create study materials from textbooks",
      "Extract specific reports from compilations",
      "Prepare documents for different audiences",
      "Organize legal document collections",
    ],
  },
}

export const qrToolsContent = {
  "qr-code-generator": {
    faqs: [
      {
        question: "What types of data can I encode in QR codes?",
        answer:
          "Our generator supports URLs, plain text, email addresses, phone numbers, SMS messages, WiFi credentials, vCard contacts, calendar events, and geographic locations.",
      },
      {
        question: "Can I customize the appearance of my QR codes?",
        answer:
          "Yes! You can customize colors, add logos, change corner styles, adjust error correction levels, and even add frames with custom text.",
      },
      {
        question: "What's the maximum amount of data I can store?",
        answer:
          "QR codes can store up to 2,953 characters of alphanumeric data. However, more data creates denser codes that may be harder to scan, so we recommend keeping content concise.",
      },
      {
        question: "Will my QR codes work on all devices?",
        answer:
          "Yes, QR codes are standardized and work with any QR code scanner app or built-in camera app on modern smartphones and tablets.",
      },
      {
        question: "Can I track scans of my QR codes?",
        answer:
          "Our basic generator creates static QR codes that don't include tracking. For analytics and tracking, consider using dynamic QR codes with our premium features.",
      },
    ],
    tutorials: [
      {
        title: "QR Code Basics and Best Practices",
        description: "Learn how to create effective QR codes that scan reliably and serve your marketing goals.",
        difficulty: "Beginner" as const,
        duration: "5 min",
        rating: 4.9,
        views: "134k",
        type: "guide" as const,
      },
      {
        title: "Advanced QR Code Customization",
        description: "Master logo integration, color schemes, and design techniques for branded QR codes.",
        difficulty: "Intermediate" as const,
        duration: "9 min",
        rating: 4.8,
        views: "87k",
        type: "video" as const,
      },
      {
        title: "QR Code Marketing Strategies",
        description: "Discover how to use QR codes effectively in marketing campaigns and customer engagement.",
        difficulty: "Advanced" as const,
        duration: "14 min",
        rating: 4.7,
        views: "62k",
        type: "article" as const,
      },
    ],
    tips: [
      {
        title: "Test Before Printing",
        description:
          "Always test your QR codes with multiple devices and apps before printing or publishing. This ensures compatibility and readability.",
        category: "Quality Control",
        difficulty: "Beginner" as const,
      },
      {
        title: "Optimize Size for Distance",
        description:
          "The scanning distance should be roughly 10 times the QR code width. For codes viewed from 3 feet away, make them at least 1 inch wide.",
        category: "Sizing",
        difficulty: "Beginner" as const,
      },
      {
        title: "Use High Contrast Colors",
        description:
          "Ensure sufficient contrast between foreground and background colors. Dark codes on light backgrounds work best for scanning reliability.",
        category: "Design",
        difficulty: "Intermediate" as const,
      },
      {
        title: "Add Clear Call-to-Action",
        description:
          "Include text like 'Scan for menu' or 'Scan to connect to WiFi' near your QR code to tell users what to expect.",
        category: "User Experience",
        difficulty: "Intermediate" as const,
      },
      {
        title: "Choose Appropriate Error Correction",
        description:
          "Use higher error correction (H level) for codes that might get damaged or partially obscured, but remember this increases code density.",
        category: "Reliability",
        difficulty: "Advanced" as const,
      },
      {
        title: "Logo Integration Best Practices",
        description:
          "Keep logos small (max 20% of code area) and ensure they don't interfere with the three corner squares or timing patterns.",
        category: "Branding",
        difficulty: "Advanced" as const,
      },
    ],
    bestPractices: [
      {
        title: "Ensure Scannability",
        description:
          "Design QR codes with sufficient contrast, appropriate sizing, and clear positioning to guarantee reliable scanning across all devices.",
        icon: Eye,
        benefits: [
          "Higher scan success rates",
          "Better user experience",
          "Reduced user frustration",
          "Improved campaign effectiveness",
        ],
      },
      {
        title: "Provide Context and Instructions",
        description:
          "Always include clear instructions and context about what the QR code does. Users should know what to expect before scanning.",
        icon: Users,
        benefits: [
          "Increased scan rates",
          "Better user engagement",
          "Reduced abandonment",
          "Improved trust and adoption",
        ],
      },
      {
        title: "Optimize for Mobile Experience",
        description:
          "Ensure the destination content is mobile-optimized since most QR code scans happen on smartphones.",
        icon: TrendingUp,
        benefits: [
          "Better conversion rates",
          "Improved user satisfaction",
          "Reduced bounce rates",
          "Enhanced mobile engagement",
        ],
      },
      {
        title: "Test Across Environments",
        description:
          "Test QR codes in various lighting conditions, distances, and angles to ensure they work in real-world scenarios.",
        icon: CheckCircle,
        benefits: [
          "Reliable performance",
          "Consistent user experience",
          "Reduced technical issues",
          "Professional implementation",
        ],
      },
    ],
    useCases: [
      "Restaurant menu access",
      "WiFi network sharing",
      "Contact information sharing",
      "Event registration and check-in",
      "Product information and reviews",
      "Social media profile linking",
      "App download promotion",
      "Payment and donation collection",
      "Location sharing and directions",
      "Marketing campaign tracking",
      "Digital business cards",
      "Educational resource access",
    ],
  },
}
