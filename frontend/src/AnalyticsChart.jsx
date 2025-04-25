import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsChart({ timelines, modelNames }) {
  // timelines: { modelName: [{time, score}, ...], ... }
  // modelNames: [model1, model2, model3]
  if (!timelines || modelNames.length === 0) return null;

  // Only render if all selected models have data
  if (!modelNames.every(name => timelines[name] && timelines[name].length > 0)) return null;

  // Use vote number as x-axis (0, 1, 2, ...)
  const numVotes = timelines[modelNames[0]].length;
  const voteNumbers = Array.from({length: numVotes}, (_, i) => i); // [0, 1, ...]

  const colors = [
    "#6366f1", // indigo
    "#0ea5e9", // blue
    "#f59e42", // orange
  ];

  // If only initial scores (no votes), show message
  if (numVotes <= 1) {
    return <div style={{marginTop: 28, color: '#64748b', fontSize: 17, background: '#fff', borderRadius: 12, padding: 22, boxShadow: "0 2px 8px #0001"}}>Not enough votes to display ranking evolution. Vote for some models to see analytics!</div>;
  }

  const data = {
    labels: voteNumbers,
    datasets: modelNames.map((name, idx) => ({
      label: name,
      data: timelines[name].map((pt) => pt.score),
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length] + "33",
      tension: 0.3,
      pointRadius: 2.5,
      borderWidth: 2.2,
    })),
  };


  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Model Ranking Development Over Time",
        font: { size: 22 },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: "Elo Score" },
      },
      x: {
        title: { display: true, text: "Vote #" },
        ticks: {
          maxTicksLimit: 10,
          callback: function (val, idx) {
            // Show only every few labels for readability
            return idx % Math.ceil(voteNumbers.length / 10) === 0
              ? voteNumbers[idx]
              : "";
          },
        },
      },
    },
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 22, boxShadow: "0 2px 8px #0001", marginTop: 24 }}>
      <Line data={data} options={options} height={70} />
    </div>
  );
}
