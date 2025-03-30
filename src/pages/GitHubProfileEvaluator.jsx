import React, { useState } from "react";
import { Card, Button, Input, Skeleton } from 'antd';
import { BarChart2, FileText, Users, Code } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { MdSearch } from "react-icons/md";
import html2canvas from "html2canvas";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GitHubProfileEvaluator = () => {
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOrg, setIsOrg] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false); // Controle de carregamento da imagem

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchProfileData();
    }
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
        borderColor: "#FF6347",
        backgroundColor: "rgba(255, 99, 71, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };
  const captureAndDownloadImage = () => {
    const element = document.getElementById("profile-card"); // ID do elemento a ser capturado
    const buttons = document.querySelectorAll(".button"); // Selecione todos os botões que você quer esconder

    // Esconder os botões
    buttons.forEach(button => button.style.display = 'none');

    html2canvas(element, { useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "github_profile.png";
      link.click();

      // Restaurar os botões após o download
      buttons.forEach(button => button.style.display = 'inline-block');
    });

  };
  return (
    <div className="container">
      <div className="card">
        <h1 className="text-4xl font-extrabold text-yellow-400 mb-4">🚀 GitHub Profile Evaluator</h1>
        <p className="text-lg mb-6 text-gray-200">Avalie o valor do seu perfil GitHub com base em métricas chave!</p>

        <div className="input-button-container">
          <Input
            className="w-2/3 bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-3"
            placeholder="Digite o usuário ou organização (ex: octocat)"
            value={username}
            suffix={<MdSearch style={{ cursor: 'pointer' }} onClick={fetchProfileData} />}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {loading && <Skeleton className="h-48 w-full mt-6 bg-gray-700 rounded-lg" />}

        {data && (
          <Card id="profile-card" className="mt-6 p-6 bg-gray-700 rounded-lg shadow-xl hover:scale-105 transition-transform">
            <div className="flex justify-center">
              <img src={data.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg card-body img" />

            </div>
            <h2 className="text-2xl font-semibold mt-4 text-center">{data.login}</h2>
            <div className="flex justify-evenly mt-4 text-sm text-white">
              <div className="flex items-center">
                <BarChart2 className="mr-2" size={22} />
                <p>{data.name || "Não informado"}</p>
              </div>
              <div className="flex items-center">
                <FileText className="mr-2" size={22} />
                <p>{data.public_repos || 0} Repos</p>
              </div>
            </div>

            <div className="flex justify-evenly mt-2 text-sm text-white">
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


            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">🔍 Gráfico de Métricas</h3>
              <div className="line-chart">
                <Line data={chartData} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-yellow-400">🏆 Score: {calculateScore(data).toFixed(1)}</p>
              <p className="text-green-500 font-bold">💰 Valuation: ${calculateValuation(data).toLocaleString()}</p>
              <div className="mt-6 text-center">
                <Button className="button-visitar-desenvolvedor" onClick={captureAndDownloadImage}>
                  Baixar Imagem
                </Button>
              </div>
              <Button className="button" onClick={() => setShowMore(!showMore)}>
                {showMore ? "Mostrar Menos" : "Mostrar Mais"}
              </Button>
            </div>

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

        <div className="mt-6 text-center">
          <Button
            className="button-visitar-desenvolvedor"
            onClick={() => window.open("https://www.thotiacorp.com.br/", "_blank")}
          >
            Visitar Desenvolvedor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GitHubProfileEvaluator;
