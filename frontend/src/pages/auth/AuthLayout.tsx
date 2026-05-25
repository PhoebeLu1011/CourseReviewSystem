import { Outlet } from "react-router";
import { BookOpen } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-slate-950 text-white relative overflow-hidden p-12">
        <div className="absolute inset-0 bg-rose-900/20 mix-blend-multiply z-0" />
        <div className="absolute -left-40 -top-40 w-96 h-96 bg-rose-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute right-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent z-10" />

        <div className="relative z-20 flex items-center gap-3 mb-auto">
          <div className="w-12 h-12 bg-rose-700 rounded-xl flex items-center justify-center shadow-lg shadow-rose-900/50">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-100">
            NTNU Toolbox
          </span>
        </div>

        <div className="relative z-20 max-w-lg mt-auto mb-16">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-white">
            Your Academic Journey, <span className="text-rose-400">Simplified.</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed font-medium">
            Join thousands of NTNU students managing their course selections, 
            finding the perfect groupmates, and engaging in transparent reviews.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-rose-700 rounded-lg flex items-center justify-center shadow-md">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              NTNU Toolbox
            </span>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
}
