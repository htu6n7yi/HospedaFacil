import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hotel, BedDouble, Users, CalendarDays, TrendingUp,
  CheckCircle, Clock, XCircle, ArrowRight, LogIn, LogOut,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

interface DashboardData {
  cards: {
    total_hoteis: number;
    total_quartos: number;
    quartos_disponiveis: number;
    total_hospedes: number;
    reservas_pendentes: number;
    reservas_confirmadas: number;
    reservas_canceladas: number;
    reservas_hoje: number;
    reservas_semana: number;
    taxa_ocupacao: number;
  };
  proximos_checkins: Array<{
    id: string;
    data_entrada: string;
    status: string;
    hospede_nome: string;
    hotel_nome: string;
    quarto_numero: string;
  }>;
  proximos_checkouts: Array<{
    id: string;
    data_saida: string;
    status: string;
    hospede_nome: string;
    hotel_nome: string;
    quarto_numero: string;
  }>;
  ultimas_reservas: Array<{
    id: string;
    data_entrada: string;
    data_saida: string;
    status: string;
    criado_em: string;
    hospede_nome: string;
    hotel_nome: string;
    quarto_numero: string;
  }>;
  ocupacao_por_hotel: Array<{
    id: string;
    nome: string;
    cidade: string;
    total_quartos: number;
    ocupados: number;
    taxa: number;
  }>;
}

const STATUS_VARIANT: Record<string, string> = {
  pendente:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmada: "bg-green-100 text-green-700 border-green-200",
  cancelada:  "bg-red-100 text-red-600 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente", confirmada: "Confirmada", cancelada: "Cancelada",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get<DashboardData>("/dashboard");
        setData(res.data);
      } catch {
        toast.error("Erro ao carregar dashboard.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64 text-stone-400">
        Carregando dashboard...
      </div>
    );
  }

  if (!data) return null;

  const { cards } = data;
  const quartos_ocupados = cards.total_quartos - cards.quartos_disponiveis;

  return (
    <div className="p-8 space-y-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Dashboard
        </h1>
        <p className="text-stone-400 text-sm mt-0.5">Visão geral do sistema hoje.</p>
      </div>

      {/* ─── Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Hotéis</p>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Hotel size={16} className="text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-800">{cards.total_hoteis}</p>
          <p className="text-xs text-stone-400 mt-1">cadastrados</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Quartos</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <BedDouble size={16} className="text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-800">{cards.total_quartos}</p>
          <div className="flex gap-3 mt-1">
            <p className="text-xs text-green-600">{cards.quartos_disponiveis} disponíveis</p>
            <p className="text-xs text-red-400">{quartos_ocupados} ocupados</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Hóspedes</p>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Users size={16} className="text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-800">{cards.total_hospedes}</p>
          <p className="text-xs text-stone-400 mt-1">cadastrados</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Ocupação</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-800">{cards.taxa_ocupacao}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-stone-100">
            <div className="h-1.5 rounded-full bg-emerald-400 transition-all" style={{ width: `${cards.taxa_ocupacao}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Pendentes</p>
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Clock size={16} className="text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-800">{cards.reservas_pendentes}</p>
          <p className="text-xs text-stone-400 mt-1">reservas aguardando</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Confirmadas</p>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle size={16} className="text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-800">{cards.reservas_confirmadas}</p>
          <p className="text-xs text-stone-400 mt-1">reservas ativas</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Canceladas</p>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle size={16} className="text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-800">{cards.reservas_canceladas}</p>
          <p className="text-xs text-stone-400 mt-1">reservas canceladas</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Esta semana</p>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <CalendarDays size={16} className="text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-stone-800">{cards.reservas_semana}</p>
          <p className="text-xs text-stone-400 mt-1">
            check-ins nos próx. 7 dias
            {cards.reservas_hoje > 0 && (
              <span className="ml-1 text-orange-500 font-medium">({cards.reservas_hoje} hoje)</span>
            )}
          </p>
        </div>
      </div>

      {/* ─── Listas ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Próximos check-ins */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <LogIn size={16} className="text-green-500" />
              <p className="font-semibold text-stone-700 text-sm">Próximos Check-ins</p>
            </div>
            <button onClick={() => navigate("/reservas")}
              className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {data.proximos_checkins.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-6">Nenhum check-in nos próximos 7 dias.</p>
            ) : data.proximos_checkins.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-800">{r.hospede_nome}</p>
                  <p className="text-xs text-stone-400">{r.hotel_nome} · Quarto #{r.quarto_numero}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-stone-600">{formatDate(r.data_entrada)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_VARIANT[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos check-outs */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <LogOut size={16} className="text-red-400" />
              <p className="font-semibold text-stone-700 text-sm">Próximos Check-outs</p>
            </div>
            <button onClick={() => navigate("/reservas")}
              className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {data.proximos_checkouts.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-6">Nenhum check-out nos próximos 7 dias.</p>
            ) : data.proximos_checkouts.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-800">{r.hospede_nome}</p>
                  <p className="text-xs text-stone-400">{r.hotel_nome} · Quarto #{r.quarto_numero}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-stone-600">{formatDate(r.data_saida)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_VARIANT[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas reservas */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-orange-500" />
              <p className="font-semibold text-stone-700 text-sm">Últimas Reservas</p>
            </div>
            <button onClick={() => navigate("/reservas")}
              className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {data.ultimas_reservas.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-6">Nenhuma reserva cadastrada.</p>
            ) : data.ultimas_reservas.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-800">{r.hospede_nome}</p>
                  <p className="text-xs text-stone-400">
                    {r.hotel_nome} · #{r.quarto_numero} · {formatDate(r.data_entrada)} → {formatDate(r.data_saida)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_VARIANT[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ocupação por hotel */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Hotel size={16} className="text-orange-500" />
              <p className="font-semibold text-stone-700 text-sm">Ocupação por Hotel</p>
            </div>
            <button onClick={() => navigate("/hoteis")}
              className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {data.ocupacao_por_hotel.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-6">Nenhum hotel com quartos cadastrados.</p>
            ) : data.ocupacao_por_hotel.map((h) => (
              <div key={h.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{h.nome}</p>
                    <p className="text-xs text-stone-400">{h.cidade} · {h.ocupados}/{h.total_quartos} quartos</p>
                  </div>
                  <span className={`text-xs font-bold ${h.taxa >= 80 ? "text-red-500" : h.taxa >= 50 ? "text-yellow-500" : "text-green-500"}`}>
                    {h.taxa}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-100">
                  <div
                    className={`h-1.5 rounded-full transition-all ${h.taxa >= 80 ? "bg-red-400" : h.taxa >= 50 ? "bg-yellow-400" : "bg-green-400"}`}
                    style={{ width: `${h.taxa}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}