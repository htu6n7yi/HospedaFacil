import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Trash2, Search, CalendarDays, ChevronDown, Loader2, MapPin, BedDouble, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import reservaService from "@/services/reservaService";
import hotelService, { type HotelDisponibilidade } from "@/services/hotelService";
import type { Reserva, ReservaPayload, StatusReserva, Quarto } from "@/types/Reserva.types";

// ─── Validação de CPF ─────────────────────────────
function validarCPF(cpf: string): boolean {
  const nums = cpf.replace(/\D/g, "");
  if (nums.length !== 11 || /^(\d)\1+$/.test(nums)) return false;
  const calc = (mod: number) => {
    const slice = nums.slice(0, mod - 1).split("").reduce(
      (acc, n, i) => acc + parseInt(n) * (mod - i), 0
    );
    const r = (slice * 10) % 11;
    return r >= 10 ? 0 : r;
  };
  return calc(10) === parseInt(nums[9]) && calc(11) === parseInt(nums[10]);
}

function formatarCPF(value: string): string {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  return nums
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

const EMPTY_FORM: ReservaPayload = {
  hospede_nome: "", hospede_email: "",
  hospede_tipo_documento: "cpf", hospede_documento: "",
  hotel_id: "", quarto_id: "",
  data_entrada: "", data_saida: "",
};

const STATUS_LABEL: Record<StatusReserva, string> = {
  pendente: "Pendente", confirmada: "Confirmada", cancelada: "Cancelada",
};

const STATUS_VARIANT: Record<StatusReserva, string> = {
  pendente: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmada: "bg-green-100 text-green-700 border-green-200",
  cancelada: "bg-red-100 text-red-600 border-red-200",
};

const TIPO_LABEL: Record<string, string> = {
  simples: "Simples", duplo: "Duplo", suite: "Suíte",
};

type Step = "hospede" | "datas" | "hotel" | "quarto";

const STEPS: { key: Step; label: string }[] = [
  { key: "hospede", label: "Hóspede" },
  { key: "datas",   label: "Datas" },
  { key: "hotel",   label: "Hotel" },
  { key: "quarto",  label: "Quarto" },
];

export default function Reservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const [buscaNome, setBuscaNome] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusReserva | "">("");
  const [filtroData, setFiltroData] = useState("");

  const location = useLocation();

  const [modalAberto, setModalAberto] = useState(false);
  const [step, setStep] = useState<Step>("hospede");
  const [form, setForm] = useState<ReservaPayload>(EMPTY_FORM);
  const [salvando, setSalvando] = useState(false);
  const [cpfErro, setCpfErro] = useState("");

  const [hoteisDisp, setHoteisDisp] = useState<HotelDisponibilidade[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [carregandoHoteis, setCarregandoHoteis] = useState(false);
  const [carregandoQuartos, setCarregandoQuartos] = useState(false);

  const [deletarId, setDeletarId] = useState<string | null>(null);
  const [deletando, setDeletando] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setReservas(await reservaService.listar());
    } catch {
      toast.error("Erro ao carregar reservas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  // Pré-preenche hóspede se veio da tela de hóspedes
  useEffect(() => {
    const state = location.state as Partial<ReservaPayload> | null;
    if (state?.hospede_nome) {
      setForm({
        ...EMPTY_FORM,
        hospede_nome: state.hospede_nome ?? "",
        hospede_email: state.hospede_email ?? "",
        hospede_tipo_documento: state.hospede_tipo_documento ?? "cpf",
        hospede_documento: state.hospede_documento ?? "",
      });
      setStep("datas");
      setModalAberto(true);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const buscarHoteis = async () => {
    try {
      setCarregandoHoteis(true);
      setHoteisDisp(await hotelService.verificarDisponibilidade(form.data_entrada, form.data_saida));
    } catch {
      toast.error("Erro ao buscar disponibilidade.");
    } finally {
      setCarregandoHoteis(false);
    }
  };

  const selecionarHotel = async (hotel: HotelDisponibilidade) => {
    if (!hotel.disponivel) return;
    setForm((f: any) => ({ ...f, hotel_id: hotel.id, quarto_id: "" }));
    try {
      setCarregandoQuartos(true);
      setQuartos(await reservaService.listarQuartosDisponiveis(hotel.id, form.data_entrada, form.data_saida));
      setStep("quarto");
    } catch {
      toast.error("Erro ao buscar quartos.");
    } finally {
      setCarregandoQuartos(false);
    }
  };

  const avancarStep = async () => {
    if (step === "hospede") {
      if (!form.hospede_nome || !form.hospede_email || !form.hospede_documento) {
        toast.error("Preencha todos os campos do hóspede.");
        return;
      }
      if (form.hospede_tipo_documento === "cpf") {
        if (!validarCPF(form.hospede_documento)) {
          setCpfErro("CPF inválido.");
          return;
        }
      }
      setCpfErro("");
      setStep("datas");
    } else if (step === "datas") {
      if (!form.data_entrada || !form.data_saida) {
        toast.error("Preencha as datas de check-in e check-out.");
        return;
      }
      if (new Date(form.data_saida) <= new Date(form.data_entrada)) {
        toast.error("A data de saída deve ser posterior à data de entrada.");
        return;
      }
      await buscarHoteis();
      setStep("hotel");
    }
  };

  const voltarStep = () => {
    if (step === "datas")  setStep("hospede");
    if (step === "hotel")  setStep("datas");
    if (step === "quarto") { setStep("hotel"); setForm((f: any) => ({ ...f, hotel_id: "", quarto_id: "" })); }
  };

  const salvar = async () => {
    if (!form.quarto_id) { toast.error("Selecione um quarto."); return; }
    try {
      setSalvando(true);
      await reservaService.criar(form);
      toast.success("Reserva cadastrada com sucesso!");
      setModalAberto(false);
      carregarDados();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { mensagem?: string } } };
      toast.error(error.response?.data?.mensagem ?? "Erro ao cadastrar reserva.");
    } finally {
      setSalvando(false);
    }
  };

  const abrirModal = () => {
    setForm(EMPTY_FORM);
    setHoteisDisp([]);
    setQuartos([]);
    setCpfErro("");
    setStep("hospede");
    setModalAberto(true);
  };

  const atualizarStatus = async (id: string, status: StatusReserva) => {
    try {
      await reservaService.atualizarStatus(id, status);
      toast.success(`Status atualizado para ${STATUS_LABEL[status]}.`);
      carregarDados();
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  };

  const confirmarDeletar = async () => {
    if (!deletarId) return;
    try {
      setDeletando(true);
      await reservaService.deletar(deletarId);
      toast.success("Reserva removida!");
      carregarDados();
    } catch {
      toast.error("Erro ao remover reserva.");
    } finally {
      setDeletando(false);
      setDeletarId(null);
    }
  };

  const reservasFiltradas = reservas.filter((r) => {
    const nomeOk = r.hospede_nome.toLowerCase().includes(buscaNome.toLowerCase());
    const statusOk = filtroStatus ? r.status === filtroStatus : true;
    const dataOk = filtroData ? r.data_entrada <= filtroData && r.data_saida >= filtroData : true;
    return nomeOk && statusOk && dataOk;
  });

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const hotelSelecionado = hoteisDisp.find((h) => h.id === form.hotel_id);

  return (
    <div className="p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Reservas
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">Gerencie as reservas do sistema.</p>
        </div>
        <Button onClick={abrirModal} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm">
          <Plus size={16} /> Nova Reserva
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input placeholder="Buscar hóspede..." value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            className="pl-9 w-48 h-10 border-stone-200 text-stone-700 placeholder:text-stone-300" />
        </div>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as StatusReserva | "")}
          className="h-10 px-3 rounded-md border border-stone-200 text-sm text-stone-600 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <Input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)}
          className="w-44 h-10 border-stone-200 text-stone-600" />
        {(buscaNome || filtroStatus || filtroData) && (
          <Button variant="ghost" onClick={() => { setBuscaNome(""); setFiltroStatus(""); setFiltroData(""); }}
            className="text-stone-400 hover:text-stone-600 text-sm">
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead className="text-stone-500 font-semibold">Hóspede</TableHead>
              <TableHead className="text-stone-500 font-semibold">Hotel</TableHead>
              <TableHead className="text-stone-500 font-semibold">Quarto</TableHead>
              <TableHead className="text-stone-500 font-semibold">Check-in</TableHead>
              <TableHead className="text-stone-500 font-semibold">Check-out</TableHead>
              <TableHead className="text-stone-500 font-semibold">Status</TableHead>
              <TableHead className="text-stone-500 font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-stone-400">Carregando...</TableCell></TableRow>
            ) : reservasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-stone-400">
                    <CalendarDays size={32} className="opacity-30" />
                    <p className="text-sm">Nenhuma reserva encontrada.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : reservasFiltradas.map((reserva) => (
              <TableRow key={reserva.id} className="hover:bg-stone-50">
                <TableCell>
                  <p className="font-medium text-stone-800">{reserva.hospede_nome}</p>
                  <p className="text-xs text-stone-400">{reserva.hospede_email}</p>
                  <p className="text-xs text-stone-400 uppercase">
                    {reserva.hospede_tipo_documento === "cpf" ? "CPF" : "Passaporte"}: {reserva.hospede_documento}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-stone-700">{reserva.hotel_nome}</p>
                  <p className="text-xs text-stone-400">{reserva.hotel_cidade}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1 text-stone-600">#{reserva.quarto_numero}</Badge>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {TIPO_LABEL[reserva.quarto_tipo]} · R$ {Number(reserva.quarto_preco_noite).toFixed(2)}/noite
                  </p>
                </TableCell>
                <TableCell className="text-stone-600">
                  {new Date(reserva.data_entrada).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                </TableCell>
                <TableCell className="text-stone-600">
                  {new Date(reserva.data_saida).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer ${STATUS_VARIANT[reserva.status]}`}>
                        {STATUS_LABEL[reserva.status]} <ChevronDown size={11} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {(["pendente", "confirmada", "cancelada"] as StatusReserva[])
                        .filter((s) => s !== reserva.status)
                        .map((s) => (
                          <DropdownMenuItem key={s} onClick={() => atualizarStatus(reserva.id, s)}>
                            {STATUS_LABEL[s]}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setDeletarId(reserva.id)}
                    className="h-8 w-8 text-stone-400 hover:text-red-500 hover:bg-red-50">
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Nova Reserva */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>Nova Reserva</DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex items-center gap-0 mb-2">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                    ${i < stepIndex ? "bg-orange-500 border-orange-500 text-white"
                      : i === stepIndex ? "bg-white border-orange-500 text-orange-500"
                      : "bg-white border-stone-200 text-stone-300"}`}>
                    {i < stepIndex ? <Check size={13} /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${i === stepIndex ? "text-orange-500" : i < stepIndex ? "text-orange-400" : "text-stone-300"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < stepIndex ? "bg-orange-400" : "bg-stone-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step: Hóspede */}
          {step === "hospede" && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-stone-600">Nome do responsável</Label>
                <Input placeholder="Ex: João Silva" value={form.hospede_nome}
                  onChange={(e) => setForm({ ...form, hospede_nome: e.target.value })}
                  className="border-stone-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-stone-600">E-mail</Label>
                <Input type="email" placeholder="Ex: joao@email.com" value={form.hospede_email}
                  onChange={(e) => setForm({ ...form, hospede_email: e.target.value })}
                  className="border-stone-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-stone-600">Tipo de documento</Label>
                <div className="flex gap-2">
                  {(["cpf", "passaporte"] as const).map((tipo) => (
                    <button key={tipo}
                      onClick={() => setForm({ ...form, hospede_tipo_documento: tipo, hospede_documento: "" })}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all
                        ${form.hospede_tipo_documento === tipo
                          ? "border-orange-400 bg-orange-50 text-orange-600"
                          : "border-stone-200 text-stone-500 hover:border-stone-300"}`}>
                      {tipo === "cpf" ? "CPF" : "Passaporte"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-stone-600">
                  {form.hospede_tipo_documento === "cpf" ? "CPF" : "Número do Passaporte"}
                </Label>
                <Input
                  placeholder={form.hospede_tipo_documento === "cpf" ? "000.000.000-00" : "Ex: AB123456"}
                  value={form.hospede_documento}
                  onChange={(e) => {
                    const val = form.hospede_tipo_documento === "cpf"
                      ? formatarCPF(e.target.value)
                      : e.target.value;
                    setForm({ ...form, hospede_documento: val });
                    setCpfErro("");
                  }}
                  className={`border-stone-200 ${cpfErro ? "border-red-400 focus:ring-red-400" : ""}`}
                />
                {cpfErro && <p className="text-xs text-red-500">{cpfErro}</p>}
              </div>
            </div>
          )}

          {/* Step: Datas */}
          {step === "datas" && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-stone-600">Check-in</Label>
                <Input type="date" value={form.data_entrada}
                  onChange={(e) => setForm({ ...form, data_entrada: e.target.value })}
                  className="border-stone-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-stone-600">Check-out</Label>
                <Input type="date" value={form.data_saida}
                  onChange={(e) => setForm({ ...form, data_saida: e.target.value })}
                  className="border-stone-200" />
              </div>
            </div>
          )}

          {/* Step: Hotel */}
          {step === "hotel" && (
            <div className="py-2">
              {carregandoHoteis ? (
                <div className="flex items-center justify-center py-10 gap-2 text-stone-400">
                  <Loader2 size={18} className="animate-spin" /> Verificando disponibilidade...
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {hoteisDisp.length === 0 ? (
                    <p className="text-sm text-stone-400 text-center py-8">Nenhum hotel encontrado.</p>
                  ) : hoteisDisp.map((hotel) => (
                    <button key={hotel.id} onClick={() => selecionarHotel(hotel)}
                      disabled={!hotel.disponivel}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-all
                        ${hotel.disponivel
                          ? "border-stone-200 hover:border-orange-400 hover:bg-orange-50 cursor-pointer"
                          : "border-stone-100 bg-stone-50 opacity-40 cursor-not-allowed"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-stone-800 text-sm">{hotel.nome}</p>
                          <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} /> {hotel.cidade}
                          </p>
                        </div>
                        <div>
                          {hotel.disponivel ? (
                            <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                              {hotel.quartos_disponiveis} disponível{hotel.quartos_disponiveis > 1 ? "is" : ""}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-red-400 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                              Sem vagas
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step: Quarto */}
          {step === "quarto" && (
            <div className="py-2">
              {hotelSelecionado && (
                <div className="flex items-center gap-2 mb-3 px-1">
                  <p className="text-xs text-stone-400">Hotel:</p>
                  <span className="text-xs font-semibold text-orange-500">{hotelSelecionado.nome}</span>
                </div>
              )}
              {carregandoQuartos ? (
                <div className="flex items-center justify-center py-10 gap-2 text-stone-400">
                  <Loader2 size={18} className="animate-spin" /> Carregando quartos...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {quartos.length === 0 ? (
                    <p className="col-span-2 text-sm text-stone-400 text-center py-8">Nenhum quarto disponível.</p>
                  ) : quartos.map((quarto) => (
                    <button key={quarto.id} onClick={() => setForm((f: any) => ({ ...f, quarto_id: quarto.id }))}
                      className={`text-left rounded-xl border px-3 py-3 transition-all
                        ${form.quarto_id === quarto.id
                          ? "border-orange-400 bg-orange-50 ring-1 ring-orange-400"
                          : "border-stone-200 hover:border-orange-300 hover:bg-orange-50"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                          <BedDouble size={13} className="text-orange-400" /> #{quarto.numero}
                        </span>
                        {form.quarto_id === quarto.id && <Check size={13} className="text-orange-500" />}
                      </div>
                      <p className="text-xs text-stone-500">{TIPO_LABEL[quarto.tipo]}</p>
                      <p className="text-xs font-semibold text-stone-700 mt-1">
                        R$ {Number(quarto.preco_noite).toFixed(2)}<span className="font-normal text-stone-400">/noite</span>
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 mt-2">
            {step !== "hospede" ? (
              <Button variant="outline" onClick={voltarStep} className="text-stone-600">Voltar</Button>
            ) : (
              <DialogClose asChild>
                <Button variant="outline" className="text-stone-600">Cancelar</Button>
              </DialogClose>
            )}
            {(step === "hospede" || step === "datas") && (
              <Button onClick={avancarStep} className="bg-orange-500 hover:bg-orange-600 text-white">
                Próximo
              </Button>
            )}
            {step === "quarto" && (
              <Button onClick={salvar} disabled={salvando || !form.quarto_id}
                className="bg-orange-500 hover:bg-orange-600 text-white">
                {salvando ? "Salvando..." : "Confirmar Reserva"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Deletar */}
      <AlertDialog open={!!deletarId} onOpenChange={() => setDeletarId(null)}>
        <AlertDialogContent className="bg-white border border-stone-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A reserva será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarDeletar} disabled={deletando}
              className="bg-red-500 hover:bg-red-600 text-white">
              {deletando ? "Removendo..." : "Sim, remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}