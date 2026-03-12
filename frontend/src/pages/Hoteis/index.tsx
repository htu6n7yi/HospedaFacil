import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Hotel, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import hotelService from "@/services/hotelService";
import type { Hotel as HotelType, HotelPayload } from "@/types/hotel.types";

const EMPTY_FORM: HotelPayload = { nome: "", cidade: "", quantidade_quartos: 0 };

export default function Hoteis() {
  const [hoteis, setHoteis] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<HotelType | null>(null);
  const [form, setForm] = useState<HotelPayload>(EMPTY_FORM);
  const [salvando, setSalvando] = useState(false);

  const [deletarId, setDeletarId] = useState<string | null>(null);
  const [deletando, setDeletando] = useState(false);

  const carregarHoteis = async () => {
    try {
      setLoading(true);
      const data = await hotelService.listar();
      setHoteis(data);
    } catch {
      toast.error("Erro ao carregar hotéis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarHoteis(); }, []);

  const hoteisFiltrados = hoteis.filter((h) =>
    h.nome.toLowerCase().includes(busca.toLowerCase()) ||
    h.cidade.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirCriar = () => {
    setEditando(null);
    setForm(EMPTY_FORM);
    setModalAberto(true);
  };

  const abrirEditar = (hotel: HotelType) => {
    setEditando(hotel);
    setForm({
      nome: hotel.nome,
      cidade: hotel.cidade,
      quantidade_quartos: hotel.quantidade_quartos,
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.nome || !form.cidade) {
      toast.error("Nome e cidade são obrigatórios.");
      return;
    }
    try {
      setSalvando(true);
      if (editando) {
        await hotelService.atualizar(editando.id, form);
        toast.success("Hotel atualizado com sucesso!");
      } else {
        await hotelService.criar(form);
        toast.success("Hotel cadastrado com sucesso!");
      }
      setModalAberto(false);
      carregarHoteis();
    } catch {
      toast.error("Erro ao salvar hotel.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarDeletar = async () => {
    if (!deletarId) return;
    try {
      setDeletando(true);
      await hotelService.deletar(deletarId);
      toast.success("Hotel removido com sucesso!");
      carregarHoteis();
    } catch {
      toast.error("Erro ao remover hotel.");
    } finally {
      setDeletando(false);
      setDeletarId(null);
    }
  };

  return (
    <div className="p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-stone-800"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Hotéis
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">
            Gerencie os hotéis cadastrados no sistema.
          </p>
        </div>
        <Button
          onClick={abrirCriar}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm"
        >
          <Plus size={16} />
          Novo Hotel
        </Button>
      </div>

      {/* Busca */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input
          placeholder="Buscar por nome ou cidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9 border-stone-200 text-stone-700 placeholder:text-stone-300"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead className="text-stone-500 font-semibold">Nome</TableHead>
              <TableHead className="text-stone-500 font-semibold">Cidade</TableHead>
              <TableHead className="text-stone-500 font-semibold">Quartos</TableHead>
              <TableHead className="text-stone-500 font-semibold">Cadastrado em</TableHead>
              <TableHead className="text-stone-500 font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-stone-400">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : hoteisFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-stone-400">
                    <Hotel size={32} className="opacity-30" />
                    <p className="text-sm">Nenhum hotel encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              hoteisFiltrados.map((hotel) => (
                <TableRow key={hotel.id} className="hover:bg-stone-50">
                  <TableCell className="font-medium text-stone-800">{hotel.nome}</TableCell>
                  <TableCell className="text-stone-600">{hotel.cidade}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1 text-stone-600">
                      <BedDouble size={11} />
                      {hotel.quantidade_quartos}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-stone-400 text-sm">
                    {new Date(hotel.criado_em).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => abrirEditar(hotel)}
                        className="h-8 w-8 text-stone-400 hover:text-orange-500 hover:bg-orange-50"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletarId(hotel.id)}
                        className="h-8 w-8 text-stone-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Criar/Editar */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-md bg-slate-200">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>
              {editando ? "Editar Hotel" : "Novo Hotel"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-stone-600 ">Nome</Label>
              <Input
                id="nome"
                placeholder="Ex: Hotel Recife Palace"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="border-slate-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cidade" className="text-stone-600">Cidade</Label>
              <Input
                id="cidade"
                placeholder="Ex: Recife"
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                className="border-slate-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quartos" className="text-stone-600">Quantidade de Quartos</Label>
              <Input
                id="quartos"
                type="number"
                min={0}
                placeholder="Ex: 50"
                value={form.quantidade_quartos}
                onChange={(e) =>
                  setForm({ ...form, quantidade_quartos: Number(e.target.value) })
                }
                className="border-slate-400"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="text-stone-600">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={salvar}
              disabled={salvando}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {salvando ? "Salvando..." : editando ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Deletar */}
      <AlertDialog open={!!deletarId} onOpenChange={() => setDeletarId(null)}>
        <AlertDialogContent className="bg-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover hotel?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O hotel será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDeletar}
              disabled={deletando}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deletando ? "Removendo..." : "Sim, remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}