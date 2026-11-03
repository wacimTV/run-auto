import { NextRequest, NextResponse } from "next/server";
import { getDayAvailability } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Le paramètre date est obligatoire (format YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  // Regex de validation format date
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json(
      { error: "Format de date invalide. Utilisez AAAA-MM-JJ" },
      { status: 400 }
    );
  }

  const availability = getDayAvailability(date);
  return NextResponse.json(availability);
}
