import React, { useEffect, useState } from "react";
import { FaCrown, FaTrophy, FaVoteYea, FaRobot, FaLock, FaUnlock, FaRegCheckCircle, FaRegTimesCircle, FaMedal } from "react-icons/fa";
import { SiOpenai, SiAnthropic, SiGoogle, SiMeta, SiDeepnote } from "react-icons/si";
import AnalyticsChart from "./AnalyticsChart";

const api = (path, opts = {}) => fetch(path, opts).then((r) => r.json());

const providerIcons = {
  "OpenAI": <SiOpenai style={{ color: "#10a37f", fontSize: 22, marginRight: 5 }} />, 
  "Anthropic": <SiAnthropic style={{ color: "#fbbf24", fontSize: 22, marginRight: 5 }} />, 
  "Google": <SiGoogle style={{ color: "#4285F4", fontSize: 22, marginRight: 5 }} />, 
  "Meta": <SiMeta style={{ color: "#4267B2", fontSize: 22, marginRight: 5 }} />, 
  "DeepSeek": <SiDeepnote style={{ color: "#2563eb", fontSize: 22, marginRight: 5 }} />,
};

const paramColor = {
  "Very Large": "#6366f1",
  "Large": "#0ea5e9",
  "Medium": "#f59e42",
};

const providerBg = {
  "OpenAI": "linear-gradient(135deg, #e6faf6 70%, #10a37f22 100%)",
  "Anthropic": "linear-gradient(135deg, #fffbe6 70%, #fbbf2422 100%)",
  "Google": "linear-gradient(135deg, #fdeaea 70%, #EA433522 100%)", // Google Red
  "Meta": "linear-gradient(135deg, #eaf0fb 70%, #4267b222 100%)",
  "DeepSeek": "linear-gradient(135deg, #e7f0fe 70%, #2563eb22 100%)"
};

function ModelCard({ model, highlight, onVote, disabled, rank }) {
  const cardBg = providerBg[model.provider] || "linear-gradient(135deg, #fff 70%, #f1f5f9 100%)";
  return (
    <div
      style={{
        position: 'relative',
        border: highlight ? "2.5px solid #4f46e5" : "1.5px solid #e0e7ef",
        borderRadius: 18,
        background: cardBg,
        boxShadow: highlight
          ? "0 4px 18px #6366f144, 0 1.5px 10px #6366f122"
          : "0 2px 10px #0001",
        padding: 28,
        minWidth: 280,
        maxWidth: 410,
        margin: 12,
        flex: 1,
        fontSize: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 410,
        transition: 'box-shadow 0.2s, border 0.2s',
        cursor: disabled ? 'default' : 'pointer',
        outline: highlight ? '#6366f1 solid 2px' : 'none',
      }}
      tabIndex={0}
      onMouseOver={e => {
        if (!highlight) e.currentTarget.style.boxShadow = "0 4px 18px #6366f133, 0 1.5px 10px #6366f122";
      }}
      onMouseOut={e => {
        if (!highlight) e.currentTarget.style.boxShadow = "0 2px 10px #0001";
      }}
    >
      {/* Rank badge */}
      {typeof rank === 'number' && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 16,
          background: 'rgba(30,41,59,0.92)',
          color: '#fff',
          borderRadius: 11,
          fontSize: 15.5,
          fontWeight: 700,
          padding: '2.5px 11px',
          boxShadow: '0 1px 6px #0002',
          zIndex: 10,
          letterSpacing: 1,
          minWidth: 60,
          textAlign: 'center',
          lineHeight: 1.3
        }}>
          rank #{rank+1}
        </div>
      )}
      <div style={{overflow: 'hidden', paddingTop: 14}}>
        <div style={{ display: 'flex', alignItems: 'center', fontWeight: 900, fontSize: 30, marginBottom: 2, flexWrap: 'wrap', wordBreak: 'break-word' }}>
          {model.name}
        </div>
        <div style={{ color: "#6366f1", fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
          {providerIcons[model.provider] || null} {model.provider}
        </div>
        <div style={{ fontSize: 19, margin: "12px 0 0 0", color: paramColor[model.params] || "#64748b", fontWeight: 800 }}>
          {model.params} <span style={{ color: "#64748b", fontWeight: 600 }}>| Context: {model.context}</span>
        </div>
        <div style={{ fontSize: 18, margin: "8px 0 0 0", color: "#64748b", display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {model.open ? <FaUnlock style={{ color: '#16a34a', fontSize: 22 }} /> : <FaLock style={{ color: '#dc2626', fontSize: 22 }} />} {model.open ? "Open" : "Closed"} | Reasoning: {model.reasoning ? <FaRegCheckCircle style={{ color: '#16a34a', marginLeft: 2, fontSize: 22 }} /> : <FaRegTimesCircle style={{ color: '#dc2626', marginLeft: 2, fontSize: 22 }} />} {model.reasoning ? "Yes" : "No"}
        </div>
        <div style={{ fontSize: 18, margin: "8px 0 0 0", color: "#64748b", wordBreak: 'break-word' }}>
          Input: {model.input_cost !== null ? `$${model.input_cost}` : "N/A"} | Output: {model.output_cost !== null ? `$${model.output_cost}` : "N/A"}
        </div>
      </div>
      <button
        disabled={disabled}
        style={{
          marginTop: 22,
          fontSize: 19,
          fontWeight: 800,
          padding: "15px 0",
          borderRadius: 10,
          border: "none",
          background: disabled ? "#a5b4fc" : "linear-gradient(90deg,#6366f1 60%,#4f46e5 100%)",
          color: "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          boxShadow: disabled ? 'none' : '0 2px 8px #6366f122',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
        onClick={onVote}
        onMouseOver={e => { if (!disabled) e.currentTarget.style.background = '#6366f1'; }}
        onMouseOut={e => { if (!disabled) e.currentTarget.style.background = 'linear-gradient(90deg,#6366f1 60%,#4f46e5 100%)'; }}
      >
        <FaVoteYea style={{ fontSize: 22, marginRight: 10 }} /> Vote for this LLM
      </button>
    </div>
  );
}

function Leaderboard({ rankings, changes }) {
  return (
    <table style={{ width: "100%", marginTop: 12, background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px #0001", fontSize: 17 }}>
      <thead>
        <tr style={{ background: "#f1f5f9", color: "#334155" }}>
          <th style={{ textAlign: "left", padding: 8 }}>#</th>
          <th style={{ textAlign: "left", padding: 8 }}>Model</th>
          <th style={{ textAlign: "left", padding: 8 }}><FaTrophy style={{ color: '#6366f1', verticalAlign: 'middle' }} /> Score</th>
          <th style={{ textAlign: "left", padding: 8 }}>Change</th>
        </tr>
      </thead>
      <tbody>
        {rankings.map((r, i) => (
          <tr key={r.name} style={{ borderTop: "1px solid #eee" }}>
            <td style={{ padding: 8, fontWeight: 700, fontSize: 17 }}>
              {i === 0 ? <FaMedal style={{ color: '#FFD700', fontSize: 22, verticalAlign: 'middle' }} title="Gold Medal" /> :
               i === 1 ? <FaMedal style={{ color: '#C0C0C0', fontSize: 22, verticalAlign: 'middle' }} title="Silver Medal" /> :
               i === 2 ? <FaMedal style={{ color: '#cd7f32', fontSize: 22, verticalAlign: 'middle' }} title="Bronze Medal" /> :
               i + 1}
            </td>
            <td style={{ padding: 8 }}>{r.name}</td>
            <td style={{ padding: 8 }}>{r.score}</td>
            <td style={{ padding: 8, color: r.change > 0 ? "#16a34a" : r.change < 0 ? "#dc2626" : "#64748b", fontWeight: 600, fontSize: 22, display: 'flex', alignItems: 'center', gap: 4 }}>
              {r.change > 0 ? <span style={{fontSize:26,verticalAlign:'middle'}}>↑</span> : r.change < 0 ? <span style={{fontSize:26,verticalAlign:'middle'}}>↓</span> : <span style={{fontSize:18}}>–</span>}
              <span style={{fontSize:18,marginLeft:2}}>{r.change !== 0 ? Math.abs(r.change) : ''}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RecentVotes({ history }) {
  return (
    <div style={{ marginTop: 18, background: "#f8fafc", borderRadius: 10, padding: 18, boxShadow: '0 2px 8px #0001' }}>
      <div style={{ fontWeight: 700, color: "#334155", marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
        <FaVoteYea style={{ color: '#6366f1', fontSize: 20 }} /> Recent Votes
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {history.map((h, i) => (
          <li key={i} style={{ color: "#334155", fontSize: 15, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaTrophy style={{ color: '#6366f1', fontSize: 15 }} />
            <b>{h.winner}</b> beat <b>{h.loser}</b> <span style={{ color: "#64748b", fontWeight: 400 }}>({h.time ? new Date(h.time).toLocaleTimeString() : "just now"})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TabNav({ tab, setTab }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
      <button onClick={() => setTab("vote")}
        style={{ fontWeight: 700, background: tab === "vote" ? "#6366f1" : "#e0e7ef", color: tab === "vote" ? "#fff" : "#334155", border: "none", borderRadius: 9, padding: "10px 24px", marginRight: 6, fontSize: 18, boxShadow: tab === "vote" ? '0 2px 8px #6366f122' : undefined }}>
        Voting
      </button>
      <button onClick={() => setTab("analytics")}
        style={{ fontWeight: 700, background: tab === "analytics" ? "#6366f1" : "#e0e7ef", color: tab === "analytics" ? "#fff" : "#334155", border: "none", borderRadius: 9, padding: "10px 24px", fontSize: 18, boxShadow: tab === "analytics" ? '0 2px 8px #6366f122' : undefined }}>
        Analytics
      </button>
      <button onClick={() => setTab("elo")}
        style={{ fontWeight: 700, background: tab === "elo" ? "#6366f1" : "#e0e7ef", color: tab === "elo" ? "#fff" : "#334155", border: "none", borderRadius: 9, padding: "10px 24px", fontSize: 18, boxShadow: tab === "elo" ? '0 2px 8px #6366f122' : undefined }}>
        Elo System
      </button>
    </div>
  );
}

export default function App() {
  const [models, setModels] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [matchup, setMatchup] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("vote");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedModels, setSelectedModels] = useState([null, null]);

  useEffect(() => {
    api("/llms").then(setModels);
    refresh();
  }, []);
  function refresh() {
    api("/rankings").then(setRankings);
    api("/matchup").then(setMatchup);
    api("/history").then(setHistory);
  }
  async function vote(winner, loser) {
    setLoading(true);
    await api("/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner, loser }),
    });
    setLoading(false);
    refresh();
  }

  // Fetch analytics data when entering analytics tab
  useEffect(() => {
    if (tab === "analytics" && !analyticsData) {
      api("/analytics").then(setAnalyticsData);
    }
  }, [tab, analyticsData]);

  // Get current #1 model
  const topModel = rankings.length > 0 ? rankings[0].name : null;

  // Ensure top model is always included
  let analyticsModels = selectedModels.filter(Boolean);
  if (topModel && !analyticsModels.includes(topModel)) {
    analyticsModels = analyticsModels.slice(0, 2);
    analyticsModels.push(topModel);
  }
  // Only keep 3
  analyticsModels = analyticsModels.slice(0, 3);

  // Voting view
  if (tab === "vote") {
    const modelA = models.find((m) => m.name === matchup?.a);
    const modelB = models.find((m) => m.name === matchup?.b);
    return (
      <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
        <h1 style={{ fontWeight: 800, fontSize: 36, marginBottom: 2 }}>LLM Rank</h1>
        <TabNav tab={tab} setTab={setTab} />
        <div style={{ color: "#64748b", fontSize: 19, marginBottom: 18 }}>
          Which LLM would you rather use?
        </div>
        <div style={{
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          gap: 28,
          marginBottom: 26,
          flexWrap: "wrap",
          width: "100%"
        }}>
          {modelA && (
             <ModelCard 
               model={modelA} 
               highlight={false} 
               onVote={() => vote(modelA.name, modelB.name)} 
               disabled={loading || !modelA || !modelB}
               rank={rankings.findIndex(r => r.name === modelA?.name)}
             />
          )}
          <div style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#4f46e5",
            alignSelf: 'center',
            margin: '0 8px',
            padding: '10px 0',
            minWidth: 60,
            textAlign: 'center',
            background: 'linear-gradient(90deg,#e0e7ff 60%,#eef2ff 100%)',
            borderRadius: 14,
            boxShadow: '0 2px 8px #6366f122',
            letterSpacing: 2,
          }}>VS</div>
          {modelB && (
             <ModelCard 
               model={modelB} 
               highlight={false} 
               onVote={() => vote(modelB.name, modelA.name)} 
               disabled={loading || !modelA || !modelB}
               rank={rankings.findIndex(r => r.name === modelB?.name)}
             />
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8, marginBottom: 32 }}>
          <button
            disabled={loading}
            style={{
              fontSize: 17,
              fontWeight: 600,
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: loading ? "#e5e7eb" : "#d1fae5",
              color: loading ? "#64748b" : "#059669",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 1px 4px #0001',
              transition: 'background 0.2s',
            }}
            onClick={() => {
              setLoading(true);
              api("/matchup").then(m => { setMatchup(m); setLoading(false); });
            }}
          >
            Skip this matchup
          </button>
        </div>
        <Leaderboard rankings={rankings} />
        <RecentVotes history={history} />
      </div>
    );
  }

  // Elo System tab
  // Always show tab navigation at the top
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontWeight: 800, fontSize: 36, marginBottom: 2 }}>LLM Rank</h1>
      <TabNav tab={tab} setTab={setTab} />


      {/* Tab content below */}
      {tab === "elo" && (
        <div>
          <div style={{ color: "#64748b", fontSize: 19, marginBottom: 18 }}>
            <b>How does the Elo rating work in this app?</b>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 22, boxShadow: '0 2px 8px #0001', fontSize: 17, color: '#334155', lineHeight: 1.7 }}>
            <ul style={{ marginLeft: 22, marginBottom: 18 }}>
              <li>Every model starts with a score of <b>1500</b>.</li>
              <li>When two models are compared, the winner gains points and the loser loses points.</li>
              <li>The amount of points exchanged depends on the difference in their ratings and a constant called <b>K</b> (here, K = 32).</li>
              <li>The expected chance of winning is calculated for each model based on their current ratings.</li>
              <li>If a lower-rated model wins, it gains more points; if a higher-rated model wins, it gains fewer points.</li>
              <li>The Elo update formula used is:<br/>
                <code>NewRating = OldRating + K × (ActualResult - ExpectedResult)</code>
              </li>
              <li>In this app, <b>ActualResult</b> is 1 for a win and 0 for a loss.</li>
            </ul>
            <b>Difference from chess Elo:</b>
            <ul style={{ marginLeft: 22 }}>
              <li>Chess Elo often uses K values that change based on experience or rating; here, K is always 32.</li>
              <li>Chess games can end in a draw (ActualResult = 0.5), but in this app, there are no draws—one model always wins.</li>
              <li>Otherwise, the core rating logic is the same as in chess Elo.</li>
            </ul>
            <div style={{ color: '#6366f1', marginTop: 10 }}>
              <b>Summary:</b> Elo is a fair way to update rankings based on head-to-head matchups, rewarding upsets and reflecting recent performance.
            </div>
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <>
          <div style={{ color: "#64748b", fontSize: 19, marginBottom: 18 }}>
            Explore LLM analytics and ranking development over time.
          </div>
      <div style={{ marginBottom: 18, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontWeight: 700, color: '#334155', marginRight: 8 }}>Model 1:</label>
          <select
            value={selectedModels[0] || ""}
            onChange={e => {
              const val = e.target.value;
              setSelectedModels([val || null, selectedModels[1]]);
            }}
            style={{ fontSize: 17, padding: '6px 14px', borderRadius: 7, border: '1.5px solid #e0e7ef', marginRight: 8 }}
          >
            <option value="">Select model</option>
            {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 700, color: '#334155', marginRight: 8 }}>Model 2:</label>
          <select
            value={selectedModels[1] || ""}
            onChange={e => {
              const val = e.target.value;
              setSelectedModels([selectedModels[0], val || null]);
            }}
            style={{ fontSize: 17, padding: '6px 14px', borderRadius: 7, border: '1.5px solid #e0e7ef' }}
          >
            <option value="">Select model</option>
            {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        {topModel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#f1f5f9', borderRadius: 8, padding: '6px 14px', fontWeight: 700, color: '#4f46e5' }}>
            <FaCrown style={{ color: '#fbbf24', fontSize: 22 }} /> #1: {topModel}
          </div>
        )}
      </div>
      {analyticsData && analyticsModels.length > 0 && (
        <AnalyticsChart timelines={analyticsData} modelNames={analyticsModels} />
      )}
      <div style={{ color: '#64748b', fontSize: 15, marginTop: 16 }}>
        Select two models to compare. The current #1 ranked model is always included for context.
      </div>
        </>
      )}
    </div>
  );
}
