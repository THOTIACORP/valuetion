import React, { useState } from "react";
import { Card, Button, Input, Skeleton } from 'antd';
import { BarChart2, FileText, Users, Code } from "lucide-react"; // Ícones do Lucide
import { Line } from "react-chartjs-2"; // Importando o gráfico de linha do react-chartjs-2
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Registrando os componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GitHubProfileEvaluator = () => {
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOrg, setIsOrg] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const cleanUsername = (input) => {
    return input.replace(/https?:\/\/github\.com\//, "").trim();
  };

  const fetchProfileData = async () => {
    if (!username) return;
    const cleanedUsername = cleanUsername(username);
    setLoading(true);
    setError(null);
    setData(null);
    setIsOrg(false);

    try {
      let response = await fetch(`https://api.github.com/users/${cleanedUsername}`);
      if (response.status === 404) {
        response = await fetch(`https://api.github.com/orgs/${cleanedUsername}`);
        if (!response.ok) throw new Error("Perfil ou organização não encontrado");
        setIsOrg(true);
      } else if (!response.ok) {
        throw new Error("Perfil não encontrado");
      }

      const profileData = await response.json();
      setData(profileData);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const calculateScore = (profileData) => {
    if (!profileData) return 0;
    const { public_repos = 0, followers = 0 } = profileData;
    return public_repos * 2 + followers * 3;
  };

  const calculateValuation = (profileData) => {
    if (!profileData) return 0;
    const { public_repos = 0, followers = 0, public_gists = 0 } = profileData;
    return (public_repos * 500) + (followers * 1000) + (public_gists * 300);
  };

  // Dados para o gráfico
  const chartData = {
    labels: ["Repositórios Públicos", "Seguidores", "Gists Públicos"],
    datasets: [
      {
        label: "Métricas do Perfil",
        data: [
          data?.public_repos || 0,
          data?.followers || 0,
          data?.public_gists || 0
        ],
        borderColor: "#FF6347", // Cor mais vibrante
        backgroundColor: "rgba(255, 99, 71, 0.2)", // Cor mais vibrante
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="container">
    <div className="card">
      <h1 className="text-4xl font-extrabold text-yellow-400 mb-4">🚀 GitHub Profile Evaluator</h1>
        <p className="text-lg mb-6 text-gray-200">Avalie o valor do seu perfil GitHub com base em métricas chave!</p>
        
        <div className="flex items-center gap-4 mb-4 justify-center">
          <Input
            className="w-2/3 bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3"
            placeholder="Digite o usuário ou organização (ex: octocat)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button 
            className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-lg transition-transform transform hover:scale-105 text-white"
            onClick={fetchProfileData} 
            disabled={loading}
          >
            {loading ? "Carregando..." : "Avaliar"}
          </Button>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {loading && <Skeleton className="h-48 w-full mt-6 bg-gray-700 rounded-lg" />}

        {data && (
          <Card className="mt-6 p-6 bg-gray-700 rounded-lg shadow-xl hover:scale-105 transition-transform">
            <img src={data.avatar_url} alt="Avatar" className="w-32 h-32 rounded-full mx-auto mt-2 border-4 border-pink-500 shadow-lg hover:shadow-2xl" />
            <h2 className="text-2xl font-semibold mt-4">{data.login}</h2>
            <div className="flex justify-between mt-4 text-sm text-gray-300">
              <div className="flex items-center">
                <BarChart2 className="mr-2" size={22} />
                <p>{data.name || "Não informado"}</p>
              </div>
              <div className="flex items-center">
                <FileText className="mr-2" size={22} />
                <p>{data.public_repos || 0} Repos</p>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-300">
              {!isOrg && (
                <div className="flex items-center">
                  <Users className="mr-2" size={22} />
                  <p>{data.followers || 0} Seguidores</p>
                </div>
              )}
              <div className="flex items-center">
                <Code className="mr-2" size={22} />
                <p>{data.public_gists || 0} Gists</p>
              </div>
            </div>

            {/* Gráfico de métricas */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">🔍 Gráfico de Métricas</h3>
              <div className="line-chart">
              <Line data={chartData} />
            </div>

            </div>

            <div className="mt-4">
              <p className="text-yellow-400">🏆 Score: {calculateScore(data).toFixed(1)}</p>
              <p className="text-green-500 font-bold">💰 Valuation: ${calculateValuation(data).toLocaleString()}</p>
              <Button
                className="button"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Mostrar Menos" : "Mostrar Mais"}
              </Button>
            </div>

            {/* Exibição das explicações das métricas */}
            {showMore && (
              <div className="mt-4 text-sm text-gray-300">
                <h4 className="font-semibold">Explicação das Métricas:</h4>
                <p><strong>Repos:</strong> O número de repositórios públicos no perfil.</p>
                <p><strong>Seguidores:</strong> Quantidade de seguidores no GitHub.</p>
                <p><strong>Gists:</strong> Número de gists públicos do usuário ou organização.</p>
                <p><strong>Score:</strong> Calculado como: (2x Repos + 3x Seguidores).</p>
                <p><strong>Valuation:</strong> Estimativa de valor com base nas métricas, onde:</p>
                <ul>
                  <li>500 por repositório público</li>
                  <li>1000 por seguidor</li>
                  <li>300 por gist público</li>
                </ul>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default GitHubProfileEvaluator;
