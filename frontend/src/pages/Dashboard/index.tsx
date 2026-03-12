import { Hotel, LogOut } from "lucide-react";
import authService from "@/services/authService";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 rounded-lg p-1.5">
            <Hotel size={18} className="text-white" />
          </div>
          <span className="font-bold text-orange-500 text-lg tracking-tight">
            HospedaFacil
          </span>
        </div>

        <button
          onClick={() => authService.logout()}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-red-500 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sair
        </button>
      </header>

      {/* Conteúdo */}
      <main className="p-6">
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">Bem-vindo ao painel de controle.</p>
      </main>
    </div>
  );
}