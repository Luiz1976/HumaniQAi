import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

export default function FinalizacaoAmigavel() {
  const navigate = useNavigate();

  const handleConcluir = () => {
    navigate("/testes");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Logo size="md" showText={false} />
          <Sparkles className="h-6 w-6 text-indigo-500" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Teste concluído</h1>
        </div>
        <p className="text-gray-700 mt-4">
          Obrigado por dedicar este momento ao seu bem-estar. Seu empenho faz diferença.
        </p>
        <p className="text-gray-700 mt-2">
          O resultado foi enviado para a empresa.
        </p>
        <p className="text-gray-600 mt-4">
          Em breve, a equipe responsável poderá direcionar ações de apoio e cuidado.
          Conte com a gente para promover um ambiente saudável e acolhedor.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            onClick={handleConcluir}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
            data-testid="button-concluir-finalizacao"
          >
            Voltar para testes
          </Button>
          <Heart className="h-6 w-6 text-rose-500" />
        </div>
      </div>
    </div>
  );
}