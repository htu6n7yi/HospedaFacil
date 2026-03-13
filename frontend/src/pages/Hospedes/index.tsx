import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, Users, CalendarDays, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import hospedeService from "@/services/hospedeService";
import hotelService from "@/services/hotelService";
import type { Hospede } from "@/types/hospede.types";
import type { Hotel } from "@/types/hotel.types";

const STATUS_LABEL = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

const STATUS_VARIANT: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmada: "bg-green-100 text-green-700 border-green-200",
  cancelada: "bg-red-100 text-red-600 border-red-200",
};

export default function Hospedes() {
  const navigate = useNavigate();

  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [hoteis, setHoteis] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  // Filtros
  const [buscaNome, setBuscaNome] = useState("");
  const [buscaDocumento, setBuscaDocumento] = useState("");
  const [filtroHotel, setFiltroHotel] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const [hospedesData, hoteisData] = await Promise.all([
          hospedeService.listar(),
          hotelService.listar(),
        ]);
        setHospedes(hospedesData);
        setHoteis(hoteisData);
      } catch {
        toast.error("Erro ao carregar hóspedes.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const toggleExpandir = (id: string) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const novaReserva = (hospede: Hospede) => {
    // Navega para reservas passando dados do hóspede via state
    navigate("/reservas", {
      state: {
        hospede_nome: hospede.nome,
        hospede_email: hospede.email,
        hospede_tipo_documento: hospede.tipo_documento,
        hospede_documento: hospede.documento,
      },
    });
  };

  // Filtros combinados
  const hospedesFiltrados = hospedes.filter((h) => {
    const nomeOk = h.nome.toLowerCase().includes(buscaNome.toLowerCase());
    const docOk = h.documento.toLowerCase().includes(buscaDocumento.toLowerCase());
    const reservas = h.reservas ?? [];

    const hotelOk = filtroHotel
      ? reservas.some((r) => {
          const hotel = hoteis.find((ht) => ht.nome === r.hotel_nome);
          return hotel?.id === filtroHotel;
        })
      : true;

    const statusOk = filtroStatus
      ? reservas.some((r) => r.status === filtroStatus)
      : true;

    return nomeOk && docOk && hotelOk && statusOk;
  });

  const temFiltro = buscaNome || buscaDocumento || filtroHotel || filtroStatus;

  const limparFiltros = () => {
    setBuscaNome("");
    setBuscaDocumento("");
    setFiltroHotel("");
    setFiltroStatus("");
  };

  return (
    <div className="p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Hóspedes
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">Visualize hóspedes e suas reservas.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Buscar por nome..."
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            className="pl-9 h-10 w-44 border-stone-200 text-stone-700 placeholder:text-stone-300"
          />
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Buscar por documento..."
            value={buscaDocumento}
            onChange={(e) => setBuscaDocumento(e.target.value)}
            className="pl-9 w-48 h-10 border-stone-200 text-stone-700 placeholder:text-stone-300"
          />
        </div>
        <select
          value={filtroHotel}
          onChange={(e) => setFiltroHotel(e.target.value)}
          className="h-10 px-3 rounded-md border border-stone-200 text-sm text-stone-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Todos os hotéis</option>
          {hoteis.map((h) => <option key={h.id} value={h.id}>{h.nome}</option>)}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="h-10 px-3 rounded-md border border-stone-200 text-sm text-stone-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        {temFiltro && (
          <Button variant="ghost" onClick={limparFiltros} className="text-stone-400 hover:text-stone-600 text-sm">
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead className="w-8" />
              <TableHead className="text-stone-500 font-semibold">Hóspede</TableHead>
              <TableHead className="text-stone-500 font-semibold">Documento</TableHead>
              <TableHead className="text-stone-500 font-semibold">Reservas</TableHead>
              <TableHead className="text-stone-500 font-semibold">Cadastrado em</TableHead>
              <TableHead className="text-stone-500 font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-stone-400">Carregando...</TableCell>
              </TableRow>
            ) : hospedesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-stone-400">
                    <Users size={32} className="opacity-30" />
                    <p className="text-sm">Nenhum hóspede encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : hospedesFiltrados.map((hospede) => {
              const reservas = hospede.reservas ?? [];
              const expandido = expandidos.has(hospede.id);

              return (
                <>
                  {/* Linha principal */}
                  <TableRow
                    key={hospede.id}
                    className="hover:bg-stone-50 cursor-pointer"
                    onClick={() => reservas.length > 0 && toggleExpandir(hospede.id)}
                  >
                    <TableCell>
                      {reservas.length > 0 && (
                        <div className="text-stone-400">
                          {expandido ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-stone-800">{hospede.nome}</p>
                      <p className="text-xs text-stone-400">{hospede.email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-stone-500 uppercase">
                        {hospede.tipo_documento === "cpf" ? "CPF" : "Passaporte"}
                      </p>
                      <p className="text-sm text-stone-700">{hospede.documento}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-stone-600">
                        {reservas.length} reserva{reservas.length !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-stone-500 text-sm">
                      {new Date(hospede.criado_em).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => novaReserva(hospede)}
                        className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 gap-1.5 text-xs"
                      >
                        <Plus size={13} /> Nova Reserva
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Linha expandida com reservas */}
                  {expandido && reservas.length > 0 && (
                    <TableRow key={`${hospede.id}-expanded`} className="bg-stone-50/60">
                      <TableCell colSpan={6} className="py-0">
                        <div className="py-3 pl-10 pr-4">
                          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                            Reservas
                          </p>
                          <div className="space-y-2">
                            {reservas.map((reserva) => (
                              <div
                                key={reserva.reserva_id}
                                className="flex items-center justify-between bg-white rounded-lg border border-stone-200 px-4 py-2.5"
                              >
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-stone-800">{reserva.hotel_nome}</p>
                                    <p className="text-xs text-stone-400">Quarto #{reserva.quarto_numero}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                    <CalendarDays size={12} />
                                    {new Date(reserva.data_entrada).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                    {" → "}
                                    {new Date(reserva.data_saida).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                  </div>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_VARIANT[reserva.status]}`}>
                                  {STATUS_LABEL[reserva.status]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}