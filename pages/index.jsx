import { useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  // --- Auth state ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- Input state ---
  const [companyName, setCompanyName] = useState('');
  const [growth, setGrowth] = useState('');
  const [tam, setTam] = useState('');
  const [revenue, setRevenue] = useState('');

  // --- Results + Forecast ---
  const [results, setResults] = useState(null);
  const [forecast, setForecast] = useState(null);

  // --- Clipboard fallback ---
  const hiddenTextarea = useRef(null);

  // --- Rating functions (1–10) ---
  function rateGrowth(g) {
    if (g <= 0) return 1;
    if (g <= 20) return Math.round(2 + ((g - 1) / 19));
    if (g <= 50) return Math.round(4 + ((g - 21) / 29));
    if (g <= 100) return Math.round(6 + ((g - 51) / 49));
    if (g <= 200) return Math.round(8 + ((g - 101) / 99));
    return 10;
  }
  function rateTam(t) {
    if (t < 100) return 1;
    if (t < 500) return 3;
    if (t < 1000) return 5;
    if (t < 5000) return 7;
    return 9;
  }
  function ratePenetration(rev, t) {
    const p = (rev / t) * 100;
    if (p < 0.01) return 1;
    if (p < 0.1) return 3;
    if (p < 1) return 5;
    if (p < 5) return 7;
    return 9;
  }

  // --- Detailed analysis ---
  function analyzeGrowth(g) {
    if (g <= 0) return 'Negative or no growth—urgent pivot needed.';
    if (g < 25) return 'Low growth—boost acquisition or pricing.';
    if (g < 75) return 'Moderate growth—optimize channels.';
    return 'High growth—ensure scalability & capacity.';
  }
  function analyzeTAM(t) {
    if (t < 100) return 'Very small market—consider adjacent segments.';
    if (t < 500) return 'Small market—explore niche expansion.';
    if (t < 1000) return 'Medium market—opportunity to scale.';
    if (t < 5000) return 'Large market—high potential upside.';
    return 'Massive market—prime for aggressive growth.';
  }
  function analyzePenetration(rev, t) {
    const p = (rev / t) * 100;
    if (p < 0.1) return 'Minimal traction—intensify go-to-market.';
    if (p < 1) return 'Early traction—iterate product-market fit.';
    if (p < 5) return 'Good traction—expand customer segments.';
    return 'Strong traction—consider pricing power or upsells.';
  }

  // --- 20-year forecast generator ---
  function generateForecast(g, startingRev) {
    const years = Array.from({ length: 21 }, (_, i) => i);
    const data = years.map(year =>
      startingRev * Math.pow(1 + g / 100, year)
    );
    return { years, data };
  }

  // --- Recommendation based on weakest metric ---
  function makeRecommendation(gR, tR, pR) {
    const lowest = Math.min(gR, tR, pR);
    if (lowest === gR) {
      if (gR < 4) return 'YoY growth weakest—focus on top-line acceleration.';
      if (gR < 7) return 'Growth moderate—optimize marketing channels.';
      return 'Growth strong—maintain momentum & margins.';
    }
    if (lowest === tR) {
      if (tR < 4) return 'TAM limited—reevaluate market sizing.';
      if (tR < 7) return 'TAM decent—expand into adjacencies.';
      return 'TAM ample—prime for broad scaling.';
    }
    // Penetration is weakest
    if (pR < 4) return 'Penetration low—double down on sales & marketing.';
    if (pR < 7) return 'Penetration moderate—leverage referrals & pilots.';
    return 'Penetration strong—consider price increases.';
  }

  // --- Handle login ---
  function handleLogin(e) {
    e.preventDefault();
    if (username === 'Rollingthunderventures' && password === 'ADMIN1') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials.');
    }
  }

  // --- Calculate & analyze ---
  function handleCalculate(e) {
    e.preventDefault();
    const g = parseFloat(growth);
    const t = parseFloat(tam);
    const r = parseFloat(revenue);
    if (!companyName || isNaN(g) || isNaN(t) || isNaN(r)) {
      return alert('Please enter valid values for all fields.');
    }
    const gR = rateGrowth(g);
    const tR = rateTam(t);
    const pR = ratePenetration(r, t);
    const score = ((gR * 0.4 + tR * 0.3 + pR * 0.3)).toFixed(1);
    const recommendation = makeRecommendation(gR, tR, pR);
    const fc = generateForecast(g, r);
    setResults({ g, t, r, gR, tR, pR, score, recommendation });
    setForecast(fc);
  }

  // --- Copy CSV fallback ---
  function copyCSV() {
    if (!results) return;
    const { g, t, r, gR, tR, pR, score } = results;
    const headers = [
      'Company','YoY Growth %','TAM ($M)','Revenue ($M)',
      'Growth Rating','TAM Rating','Penetration Rating','AISF Score'
    ];
    const row = [companyName, g, t, r, gR, tR, pR, score];
    const csv = `${headers.join(',')}\n${row.join(',')}`;
    const ta = hiddenTextarea.current;
    ta.value = csv;
    ta.select();
    document.execCommand('copy');
    alert('CSV copied to clipboard!');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-6">
      {!isAuthenticated ? (
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow-xl"
        >
          <h2 className="text-3xl font-bold text-center mb-6">
            Secure Login
          </h2>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 mb-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 mb-2"
          />
          {loginError && (
            <p className="text-red-500 text-center mb-2">{loginError}</p>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-semibold"
          >
            Log In
          </button>
        </form>
      ) : (
        <div className="w-full max-w-4xl bg-gray-800 p-10 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-extrabold mb-8">
            AISF-Lite Investment Evaluator
          </h1>

          <form
            onSubmit={handleCalculate}
            className="grid grid-cols-2 gap-6 mb-8"
          >
            <div>
              <label className="block mb-2">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block mb-2">YoY Growth %</label>
              <input
                type="number"
                step="0.1"
                value={growth}
                onChange={e => setGrowth(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block mb-2">TAM ($M)</label>
              <input
                type="number"
                step="0.1"
                value={tam}
                onChange={e => setTam(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block mb-2">Revenue ($M)</label>
              <input
                type="number"
                step="0.1"
                value={revenue}
                onChange={e => setRevenue(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2"
              />
            </div>
            <button
              type="submit"
              className="col-span-2 bg-green-600 hover:bg-green-500 py-3 rounded-xl font-semibold"
            >
              Calculate
            </button>
          </form>

          {results && forecast && (
            <div className="bg-gray-700 p-6 rounded-lg space-y-6">
              <h2 className="text-2xl font-semibold">Results & Analysis</h2>
              <p>
                <strong>Company:</strong> {companyName}
              </p>
              <p>
                <strong>AISF Score:</strong> {results.score}
              </p>
              <ul className="list-disc pl-5">
                <li>Growth Rating: {results.gR} / 10</li>
                <li>TAM Rating: {results.tR} / 10</li>
                <li>Penetration Rating: {results.pR} / 10</li>
              </ul>
              <p><strong>Recommendation:</strong> {results.recommendation}</p>

              {/* 20-year forecast graph below the data */}
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  20-Year Revenue Forecast
                </h3>
                <Line
                  data={{
                    labels: forecast.years,
                    datasets: [
                      {
                        label: 'Revenue ($M)',
                        data: forecast.data.map(val => val.toFixed(2)),
                        borderColor: 'rgba(79, 70, 229, 1)',
                        backgroundColor: 'rgba(79, 70, 229, 0.5)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      x: { title: { display: true, text: 'Years from Now' } },
                      y: {
                        title: { display: true, text: 'Revenue ($M)' },
                        ticks: { callback: v => `$${v}` },
                      },
                    },
                  }}
                />
              </div>

              <button
                onClick={copyCSV}
                className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl"
              >
                Copy CSV to Clipboard
              </button>
              <textarea
                ref={hiddenTextarea}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
