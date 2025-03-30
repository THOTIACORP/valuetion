import React, { useState } from "react";
import { Card, Button, Input, Skeleton, Row, Col } from "antd";
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
    const element = document.getElementById("profile-card");
    const buttons = document.querySelectorAll(".button");

    buttons.forEach(button => button.style.display = 'none');

    html2canvas(element, { useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "github_profile.png";
      link.click();

      buttons.forEach(button => button.style.display = 'inline-block');
    });
  };

  return (
    <>
      <div className="container">
        <Card>
          <h1 >🚀 GitHub Profile Evaluator</h1>
          <p >Avalie o valor do seu perfil GitHub com base em métricas chave!</p>

          <Input
            placeholder="Digite o usuário ou organização (ex: octocat)"
            value={username}
            suffix={<MdSearch style={{ cursor: 'pointer' }} onClick={fetchProfileData} />}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
             style={{ width: '100%', marginBottom: '16px' }}
          />

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading && <Skeleton active />}

          {data && (
            <Card id="profile-card" style={{ textAlign: 'center' }}>
              <img
                src={data.avatar_url}
                alt="Avatar"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '0.5rem',
          
                  
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <h2>{data.login}</h2>
              <Row justify="space-around" style={{ marginTop: '16px' }}>
                <Col>
                  <BarChart2 size={22} />
                  <p>{data.name || "Não informado"}</p>
                </Col>
                <Col>
                  <FileText size={22} />
                  <p>{data.public_repos || 0} Repos</p>
                </Col>
              </Row>

              <Row justify="space-around" style={{ marginTop: '8px' }}>
                {!isOrg && (
                  <Col>
                    <Users size={22} />
                    <p>{data.followers || 0} Seguidores</p>
                  </Col>
                )}
                <Col>
                  <Code size={22} />
                  <p>{data.public_gists || 0} Gists</p>
                </Col>
              </Row>

              <div style={{ marginTop: '24px', width: '100%', overflow: 'hidden' }}>
  <h3 style={{ fontSize: '1.25rem', color: '#b3b3b3' }}>🔍 Gráfico de Métricas</h3>
  <div className="chart-container" style={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
    <Line 
      data={chartData} 
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          }
        }
      }} 
    />
  </div>
</div>

              <div style={{ marginTop: '16px' }}>
                <p style={{ color: '#FFD700' }}>🏆 Score: {calculateScore(data).toFixed(1)}</p>
                <p style={{ color: '#32CD32', fontWeight: 'bold' }}>💰 Valuation: ${calculateValuation(data).toLocaleString()}</p>

                <Button onClick={captureAndDownloadImage} style={{ marginTop: '16px' }}>
                  Baixar Imagem
                </Button>
                <Button onClick={() => setShowMore(!showMore)} style={{ marginTop: '8px' }}>
                  {showMore ? "Mostrar Menos" : "Mostrar Mais"}
                </Button>
              </div>

              {showMore && (
                <div style={{ marginTop: '16px', fontSize: '0.875rem', color: '#b3b3b3' }}>
                  <h4>Explicação das Métricas:</h4>
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
        </Card>
      </div>

      <div class="button-supermoderno-container">
        <Button className="button-supermoderno" onClick={() => window.open("https://www.thotiacorp.com.br/", "_blank")}>
          Visitar Desenvolvedor
        </Button>
      </div>
    </>
  );
};

export default GitHubProfileEvaluator;
