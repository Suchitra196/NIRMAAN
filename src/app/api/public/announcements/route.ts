import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ANNOUNCEMENTS = [
  {
    id: "1",
    text: "NIRMAAN system now available for all Zilla Parishad officers across Maharashtra",
  },
  {
    id: "2",
    text: "New project registration portal launched for contractor onboarding",
  },
  {
    id: "3",
    text: "Q1 2025 budget utilization reports now available in the Finance module",
  },
  {
    id: "4",
    text: "Digital payment tracking enabled for all active projects",
  },
];

export async function GET() {
  return NextResponse.json(ANNOUNCEMENTS);
}
