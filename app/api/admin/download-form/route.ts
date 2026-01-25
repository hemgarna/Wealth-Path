import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import ExcelJS from "exceljs"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { userId, formType } = await request.json()

    // Verify admin is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to verify they're an advisor
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "advisor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: clientProfile } = await supabase.from("profiles").select("full_name, email").eq("id", userId).single()

    let tableName = ""
    let formData = {}

    switch (formType) {
      case "financial_goals":
        tableName = "financial_goals"
        break
      case "growth_strategy":
        tableName = "growth_strategy"
        break
      case "defense_strategy":
        tableName = "defense_strategy"
        break
      case "savings_vs_spending":
        tableName = "savings_vs_spending"
        break
      case "final_report":
        tableName = "final_report"
        break
      default:
        return NextResponse.json({ error: "Invalid form type" }, { status: 400 })
    }

    const { data, error } = await supabase.from(tableName).select("*").eq("user_id", userId).maybeSingle()

    if (error) {
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Form not yet filled by client" }, { status: 404 })
    }

    formData = data

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(
      formType
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )

    const title = formType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    worksheet.mergeCells("A1:B1")
    const titleCell = worksheet.getCell("A1")
    titleCell.value = title
    titleCell.font = { size: 16, bold: true, color: { argb: "FF1F2937" } }
    titleCell.alignment = { vertical: "middle", horizontal: "center" }
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" },
    }
    worksheet.getRow(1).height = 30

    worksheet.mergeCells("A2:B2")
    const dateCell = worksheet.getCell("A2")
    dateCell.value = `Generated: ${new Date().toLocaleDateString()} | Client: ${clientProfile?.full_name || clientProfile?.email || "N/A"}`
    dateCell.font = { size: 10, color: { argb: "FF6B7280" } }
    dateCell.alignment = { vertical: "middle", horizontal: "center" }
    worksheet.getRow(2).height = 20

    worksheet.addRow([])

    const headerRow = worksheet.addRow(["Field", "Value"])
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    }
    headerRow.height = 25
    headerRow.alignment = { vertical: "middle", horizontal: "left" }

    worksheet.getColumn(1).width = 40
    worksheet.getColumn(2).width = 50

    for (const [key, value] of Object.entries(formData)) {
      if (key === "id" || key === "user_id" || key === "created_at" || key === "updated_at") continue

      // Format field name
      const fieldName = key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      const displayValue = value?.toString() || "N/A"

      const dataRow = worksheet.addRow([fieldName, displayValue])
      dataRow.alignment = { vertical: "top", horizontal: "left", wrapText: true }

      if (worksheet.rowCount % 2 === 0) {
        dataRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF9FAFB" },
        }
      }
    }

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 3) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          }
        })
      }
    })

    const buffer = await workbook.xlsx.writeBuffer()

    const clientName = (clientProfile?.full_name || clientProfile?.email || "client")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase()
    const filename = `${clientName}_${formType}_${new Date().toISOString().split("T")[0]}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error generating Excel:", error)
    return NextResponse.json({ error: "Failed to generate Excel file" }, { status: 500 })
  }
}
