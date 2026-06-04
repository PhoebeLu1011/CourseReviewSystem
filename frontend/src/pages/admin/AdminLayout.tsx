import { Outlet } from "react-router";
import { AdminSidebar } from "./AdminSidebar";
import { AnalyticsCards } from "./AnalyticsCards";
import { Bell, Search } from "lucide-react";

export function AdminLayout() {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        <header className="bg-white border-b border-slate-200 px-6 sm:px-10 h-[89px] flex justify-between items-center shrink-0 z-10 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              NTNU Course Selection Toolbox
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
            
            <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none mb-1">Super Admin</p>
                <p className="text-xs text-slate-500 font-medium leading-none">System Ops</p>
              </div>
              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white">
                AD
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50/80">
          <div className="max-w-7xl mx-auto">
            <AnalyticsCards />
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
