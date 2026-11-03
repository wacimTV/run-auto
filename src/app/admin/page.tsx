import React from "react";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth";
import { storage } from "@/lib/storage";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const appointments = storage.getAppointments();
  const contacts = storage.getContacts();
  const { blockedDates } = storage.getBlockedSlots();

  return (
    <AdminDashboardClient
      initialAppointments={appointments}
      initialContacts={contacts}
      initialBlockedDates={blockedDates}
    />
  );
}
