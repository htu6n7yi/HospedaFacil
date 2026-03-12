import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Hotel, ArrowRight, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import authService from "@/services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await authService.login({ usuario, senha });
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErro(
        error.response?.data?.message ?? "Usuário ou senha inválidos."
      );
    } finally {
      setLoading(false);
    }
  };

  const preencherDemo = () => {
    setUsuario("admin");
    setSenha("123456");
    setErro("");
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        .card-shadow { box-shadow: 0 25px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08); }
        .photo-overlay {
          background: linear-gradient(
            to bottom,
            rgba(20,10,5,0.18) 0%,
            rgba(20,10,5,0.45) 60%,
            rgba(20,10,5,0.82) 100%
          );
        }
        .btn-loading { animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .input-focus { transition: border-color 0.2s, box-shadow 0.2s; }
        .input-focus:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.15);
          outline: none;
        }
        .fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="font-body w-full max-w-4xl rounded-2xl overflow-hidden card-shadow flex"
        style={{ minHeight: 520 }}
      >
        {/* Painel esquerdo — formulário */}
        <div className="bg-white w-full md:w-[45%] flex flex-col justify-center px-10 py-12 fade-in">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-orange-500 rounded-lg p-1.5">
              <Hotel size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-orange-500 text-lg tracking-tight">
              HospedaFacil
            </span>
          </div>

          {/* Cabeçalho */}
          <div className="mb-7">
            <h1 className="font-display text-3xl text-stone-800 leading-tight mb-1">
              Bem-vindo de volta
            </h1>
            <p className="text-stone-400 text-sm leading-relaxed">
              Acesse sua conta para gerenciar suas reservas e hóspedes.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="usuario" className="text-stone-600 font-medium">
                Usuário
              </Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Digite seu usuário"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="input-focus border-stone-200 text-stone-700 placeholder:text-stone-300 h-11 rounded-lg"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha" className="text-stone-600 font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="input-focus border-stone-200 text-stone-700 placeholder:text-stone-300 h-11 rounded-lg pr-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            {/* Lembrar + Esqueceu */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="lembrar"
                  checked={lembrar}
                  onCheckedChange={(val) => setLembrar(val as boolean)}
                  className="border-stone-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label htmlFor="lembrar" className="text-sm text-stone-500 cursor-pointer font-normal">
                  Lembrar-me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Botão */}
            <Button
              type="submit"
              disabled={loading}
              className={`
                h-11 rounded-lg font-semibold text-white text-sm gap-2
                ${loading
                  ? "bg-orange-400 btn-loading cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-orange-200"
                }
              `}
            >
              {loading ? "Entrando..." : (
                <>
                  Entrar no Sistema
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Alerta ambiente de teste */}
          <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-4">
            <div className="flex items-start gap-2.5">
              <Shield size={15} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-orange-700 mb-0.5">
                  Ambiente de Teste
                </p>
                <p className="text-xs text-orange-500 leading-relaxed">
                  Utilize as credenciais para demonstração:
                </p>
                <p className="text-xs text-orange-600 font-mono mt-0.5">
                  Usuário: <span className="font-semibold">admin</span> / Senha:{" "}
                  <span className="font-semibold">123456</span>
                </p>
                <button
                  onClick={preencherDemo}
                  type="button"
                  className="text-xs text-orange-500 hover:text-orange-700 underline mt-1 transition-colors"
                >
                  Preencher automaticamente
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Painel direito — imagem */}
        <div
          className="hidden md:flex md:w-[55%] relative flex-col justify-end overflow-hidden"
          style={{ background: "linear-gradient(135deg, #3d1f0a 0%, #1a0a02 100%)" }}
        >
          <img
            src="https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=900&q=80"
            alt="Lobby de hotel luxuoso"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 photo-overlay" />

          <div className="relative z-10 p-10 pb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-orange-400 opacity-80" />
              <span className="text-orange-300 text-xs font-semibold tracking-widest uppercase opacity-90">
                Luxury Resorts Group
              </span>
            </div>

            <blockquote className="font-display italic text-white text-xl leading-snug opacity-95 max-w-xs">
              "A excelência na gestão hoteleira começa com as ferramentas certas."
            </blockquote>

            <p className="text-orange-200 text-sm mt-3 opacity-75 font-light max-w-[260px] leading-relaxed">
              Transforme a experiência dos seus hóspedes hoje.
            </p>

            <div className="flex gap-1.5 mt-7">
              <div className="w-5 h-1 rounded-full bg-orange-400 opacity-90" />
              <div className="w-1.5 h-1 rounded-full bg-white opacity-30" />
              <div className="w-1.5 h-1 rounded-full bg-white opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}