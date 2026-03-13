import { NavLink, Outlet } from "react-router-dom";
import {
  Hotel,
  LayoutDashboard,
  Users,
  CalendarDays,
  LogOut,
  BedDouble,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import authService from "@/services/authService";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hoteis",    label: "Hotéis",    icon: Hotel },
  { to: "/hospedes",  label: "Hóspedes",  icon: Users },
  { to: "/reservas",  label: "Reservas",  icon: CalendarDays },
];

export default function AppLayout() {
  return (
      <div
        className="flex min-h-screen bg-amber-500"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');

          .nav-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 14px;
            border-radius: 10px;
            font-size: 0.875rem;
            font-weight: 500;
            color: #78716c;
            transition: all 0.15s ease;
            text-decoration: none;
            width: 100%;
          }
          .nav-link:hover {
            background: #fff7ed;
            color: #ea580c;
          }
          .nav-link.active {
            background: #fff7ed;
            color: #ea580c;
            font-weight: 600;
          }
          .nav-link svg {
            flex-shrink: 0;
            transition: color 0.15s ease;
          }
          .sidebar-shadow {
            box-shadow: 4px 0 24px rgba(0,0,0,0.06);
          }
        `}</style>

        {/* Sidebar */}
        <aside className="sidebar-shadow w-60 border border-r-stone-300 bg-white flex flex-col fixed top-0 left-0 h-full z-20">

          {/* Logo */}
          <div className="px-5 py-5">
            <div className="flex items-center gap-2.5">
              <div className="bg-orange-500 rounded-xl p-2">
                <BedDouble size={18} className="text-white" />
              </div>
              <div>
                <span
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  className="font-bold text-orange-500 text-base leading-none block"
                >
                  HospedaFacil
                </span>
                <span className="text-stone-600 text-[11px]">
                  Gestão Hoteleira
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest px-3 mb-2">
              Menu
            </p>
            {navItems.map(({ to, label, icon: Icon }) => (
              
                  <NavLink to={to} className="nav-link">
                    <Icon size={17} />
                    {label}
                  </NavLink>
            ))}
          </nav>

          <Separator />

          {/* Footer */}
          <div className="px-3 py-4 space-y-3">
            {/* Avatar do usuário */}
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-stone-700 leading-none">
                  Admin
                </span>
                <span className="text-[11px] text-stone-400 mt-0.5">
                  Administrador
                </span>
              </div>
            </div>

            <Separator />

            {/* Botão sair */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-stone-500 hover:text-red-500 hover:bg-red-50 px-3"
              onClick={() => authService.logout()}
            >
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 ml-60 min-h-screen bg-amber-50">
          <Outlet />
        </main>
      </div>
  );
}