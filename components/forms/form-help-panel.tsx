"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HelpCircle, X, ChevronDown, ChevronUp } from "lucide-react"

interface HelpItem {
  question: string
  answer: string
  category?: string
}

interface FormHelpPanelProps {
  helpItems: HelpItem[]
  title?: string
}

export function FormHelpPanel({ helpItems, title = "Form Help" }: FormHelpPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-h-[600px] shadow-xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[500px] px-6 pb-6">
          <div className="space-y-3">
            {helpItems.map((item, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="font-medium text-sm pr-2">{item.question}</span>
                  {expandedIndex === index ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
                {expandedIndex === index && (
                  <div className="p-3 pt-0 text-sm text-muted-foreground border-t">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
