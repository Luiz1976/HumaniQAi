import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { MobileHeader } from "./MobileHeader";
import { VinhedoFooter } from "@/components/VinhedoFooter";

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 flex flex-col overflow-auto bg-gray-50">
          <MobileHeader />
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
          <VinhedoFooter />
        </main>
      </div>
    </SidebarProvider>
  );
}