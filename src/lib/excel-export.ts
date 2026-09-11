import ExcelJS from "exceljs";
import { AdminStudyData } from "./supabase/client";
import { getStudyConfig, getStudyDayNumber } from "./study-config";
import { formatDurationDecimalHours, formatDurationHoursMinutes, formatTime12Hour } from "./sleep-calculations";

export async function exportStudyDataToExcel(data: AdminStudyData, filename?: string): Promise<void> {
  const config = getStudyConfig();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sleep Study Research Platform";
  workbook.lastModifiedBy = "Researcher Admin";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color & Style Constants
  const headerFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF312E81" }, // Deep Indigo
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFE2E8F0" } },
    left: { style: "thin", color: { argb: "FFE2E8F0" } },
    bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
    right: { style: "thin", color: { argb: "FFE2E8F0" } },
  };

  // ---------------------------------------------------------------------------
  // SHEET 1: Raw Data (One row per daily sleep entry)
  // ---------------------------------------------------------------------------
  const rawSheet = workbook.addWorksheet("Raw Data", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  rawSheet.columns = [
    { header: "Participant ID", key: "participant_id", width: 22 },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Study Day", key: "study_day", width: 14 },
    { header: "Log Date", key: "log_date", width: 15 },
    { header: "Bed Time", key: "bed_time", width: 14 },
    { header: "Wake Time", key: "wake_time", width: 14 },
    { header: "Total Sleep Minutes", key: "total_sleep_minutes", width: 20 },
    { header: "Total Sleep Hours", key: "total_sleep_hours", width: 18 },
    { header: "Sleep Quality (1-5)", key: "sleep_quality", width: 20 },
    { header: "Notes", key: "notes", width: 35 },
    { header: "Created At", key: "created_at", width: 22 },
    { header: "Updated At", key: "updated_at", width: 22 },
  ];

  // Populate Raw Data Rows
  data.logs.forEach((log, index) => {
    const participant = data.participants.find((p) => p.id === log.participant_id) || {
      full_name: log.participant?.full_name || "Unknown",
      email: log.participant?.email || "Unknown",
    };

    const studyDayNum = getStudyDayNumber(log.log_date, config.startDate);
    const studyDayLabel = studyDayNum > 0 && studyDayNum <= config.targetDays
      ? `Day ${studyDayNum}`
      : `Day ${studyDayNum} (Out of range)`;

    const totalMinutes = log.total_sleep_minutes || 0;
    const decimalHours = formatDurationDecimalHours(totalMinutes);

    const row = rawSheet.addRow({
      participant_id: log.participant_id,
      name: participant.full_name,
      email: participant.email,
      study_day: studyDayLabel,
      log_date: log.log_date,
      bed_time: formatTime12Hour(log.bed_time),
      wake_time: formatTime12Hour(log.wake_time),
      total_sleep_minutes: totalMinutes,
      total_sleep_hours: decimalHours,
      sleep_quality: log.sleep_quality ?? "",
      notes: log.notes || "",
      created_at: log.created_at ? new Date(log.created_at).toLocaleString() : "",
      updated_at: log.updated_at ? new Date(log.updated_at).toLocaleString() : "",
    });

    // Row zebra striping & borders
    const isEven = index % 2 === 0;
    row.eachCell((cell, colNumber) => {
      cell.border = thinBorder;
      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
      if (colNumber === 8 || colNumber === 9 || colNumber === 10) {
        cell.alignment = { horizontal: "right" };
      }
    });
  });

  // Format Header Row
  const rawHeaderRow = rawSheet.getRow(1);
  rawHeaderRow.height = 28;
  rawHeaderRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = thinBorder;
  });

  // ---------------------------------------------------------------------------
  // SHEET 2: Participant Summary
  // ---------------------------------------------------------------------------
  const summarySheet = workbook.addWorksheet("Participant Summary", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  summarySheet.columns = [
    { header: "Participant ID", key: "participant_id", width: 22 },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Expected Days", key: "expected_days", width: 16 },
    { header: "Completed Days", key: "completed_days", width: 16 },
    { header: "Completion %", key: "completion_pct", width: 16 },
    { header: "Average Sleep Minutes", key: "avg_sleep_minutes", width: 24 },
    { header: "Average Sleep Hours", key: "avg_sleep_hours", width: 22 },
    { header: "Minimum Sleep", key: "min_sleep", width: 18 },
    { header: "Maximum Sleep", key: "max_sleep", width: 18 },
    { header: "Average Sleep Quality", key: "avg_quality", width: 22 },
  ];

  data.participantSummaries.forEach((summary, index) => {
    const avgHours = formatDurationDecimalHours(summary.average_sleep_minutes);
    const minFormatted = summary.completed_days > 0 ? formatDurationHoursMinutes(summary.min_sleep_minutes) : "--";
    const maxFormatted = summary.completed_days > 0 ? formatDurationHoursMinutes(summary.max_sleep_minutes) : "--";

    const row = summarySheet.addRow({
      participant_id: summary.id,
      name: summary.full_name,
      email: summary.email,
      expected_days: summary.expected_days,
      completed_days: summary.completed_days,
      completion_pct: `${summary.completion_percentage}%`,
      avg_sleep_minutes: summary.average_sleep_minutes,
      avg_sleep_hours: avgHours,
      min_sleep: minFormatted,
      max_sleep: maxFormatted,
      avg_quality: summary.average_quality ?? "N/A",
    });

    const isEven = index % 2 === 0;
    row.eachCell((cell, colNumber) => {
      cell.border = thinBorder;
      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
      if ([4, 5, 6, 7, 8, 9, 10, 11].includes(colNumber)) {
        cell.alignment = { horizontal: "right" };
      }
    });
  });

  const summaryHeaderRow = summarySheet.getRow(1);
  summaryHeaderRow.height = 28;
  summaryHeaderRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = thinBorder;
  });

  // Generate binary buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const timestamp = new Date().toISOString().split("T")[0];
  anchor.href = url;
  anchor.download = filename || `Sleep_Study_Data_Export_${timestamp}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
