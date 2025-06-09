// pages/index.jsx
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
import 'tailwindcss/tailwind.css';

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
  // ── Authentication ──
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loginErr, setLoginErr] = useState('');

  // ── Compare Mode Toggle ──
  const [compareMode, setCompareMode] = useState(false);

  // ── Investment A Inputs ──
  const [company1, setCompany1] = useState('');
  const [growth1, setGrowth1] = useState('');
  const [tam1, setTam1] = useState('');
  const [rev1, setRev1] = useState('');

  // ── Investment B Inputs ──
  const [company2, setCompany2] = useState('');
  const [growth2, setGrowth2] = useState('');
  const [tam2, setTam2] = useState('');
  const [rev2, setRev2] = useState('');

  // ── Results & Forecast ──
  const [res1, setRes1] = useState(null);
  const [res2, setRes2] = useState(null);
  const [forecast, setForecast] = useState(null);
  const csvRef = useRef();

  // ── Rating Helpers ──
  const rateGrowth = g =>
    g <= 0   ? 1 :
    g <= 20  ? 3 :
    g <= 50  ? 5 :
    g <= 100 ? 7 :
    g <= 200 ? 9 : 10;

  const rateTam = t =>
    t < 100   ? 1 :
    t < 500   ? 3 :
    t < 1000  ? 5 :
    t < 5000  ? 7 : 10;

  const ratePen = (r, t) => {
    const p = (r / t) * 100;
    return p < 0.1  ? 1 :
           p < 1    ? 3 :
           p < 5    ? 5 :
           p < 10   ? 7 : 10;
  };

  // ── Analysis Helpers ──
  const analyzeGrowth = g =>
    g <= 0   ? '⚠️ No growth—urgent pivot.' :
    g < 25   ? '🔻 Low growth—boost acquisition & pricing.' :
    g < 75   ? '🔸 Moderate growth—optimize channels.' :
               '✅ High growth—scale operations.';

  const analyzeTam = t =>
    t < 100    ? '⚠️ Tiny TAM—consider adjacent markets.' :
    t < 500    ? '🔻 Small TAM—explore niches.' :
    t < 1000   ? '🔸 Medium TAM—good scaling.' :
    t < 5000   ? '✅ Large TAM—high upside.' :
                 '🚀 Massive TAM—prime aggressive growth.';

  const analyzePen = (r, t) => {
    const p = (r / t) * 100;
    return p < 0.1  ? '⚠️ Minimal traction—intensify GTM.' :
           p < 1    ? '🔻 Early traction—refine PMF.' :
           p < 5    ? '🔸 Good traction—expand segments.' :
                     '✅ Strong traction—leverage pricing.';
  };

  // ── Forecast Generator ──
  const makeForecast = (g, start) => {
    const years = Array.from({ length: 21 }, (_, i) => i);
    const revs  = years.map(y => start * (1 + g / 100) ** y);
    return { years, revs };
  };

  // ── Recommendation ──
  const makeRec = (gR, tR, pR) => {
    const mn = Math.min(gR, tR, pR);
    return mn === gR
      ? 'Accelerate top-line growth.'
      : mn === tR
      ? 'Reevaluate TAM strategy.'
      : 'Boost penetration efforts.';
  };

  // ── Handlers ──
  const handleLogin = e => {
    e.preventDefault();
    if (user === 'Rollingthunderventures' && pass === 'ADMIN1') {
      setIsAuthed(true);
      setLoginErr('');
    } else {
      setLoginErr('Invalid credentials');
    }
  };

  const handleCalculate = e => {
    e.preventDefault();
    // parse & score investment
    const parseInv = (c, g, t, r) => {
      const gF = parseFloat(g), tF = parseFloat(t), rF = parseFloat(r);
      if (!c || isNaN(gF) || isNaN(tF) || isNaN(rF)) throw new Error();
      const gR = rateGrowth(gF),
            tR = rateTam(tF),
            pR = ratePen(rF, tF),
            score = ((gR * 0.4 + tR * 0.3 + pR * 0.3)).toFixed(1),
            rec   = makeRec(gR, tR, pR);
      return { name: c, gF, tF, rF, gR, tR, pR, score, rec };
    };

    try {
      const r1 = parseInv(company1, growth1, tam1, rev1);
      setRes1(r1);
      if (compareMode) {
        const r2 = parseInv(company2, growth2, tam2, rev2);
        setRes2(r2);
      } else {
        const base = makeForecast(r1.gF, r1.rF);
        setForecast({
          years: base.years,
          datasets: [
            { label: '3× Exit',  data: base.revs.map(v => v * 3) },
            { label: '5× Exit',  data: base.revs.map(v => v * 5) },
            { label: '7× Exit',  data: base.revs.map(v => v * 7) },
            { label: '9× Exit',  data: base.revs.map(v => v * 9) },
            { label: '12× Exit', data: base.revs.map(v => v * 12) },
          ]
        });
      }
    } catch {
      alert('Please fill all fields correctly.');
    }
  };

  const handleCopy = () => {
    const rows = compareMode
      ? [['Company','Score'], [res1.name,res1.score],[res2.name,res2.score]]
      : [['Company','Score'], [res1.name,res1.score]];
    const csv = rows.map(r => r.join(',')).join('\n');
    csvRef.current.value = csv;
    csvRef.current.select();
    document.execCommand('copy');
    alert('CSV copied to clipboard!');
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-900 text-gray-50 flex items-center justify-center p-6">
      {/* LOGIN SCREEN */}
      {!isAuthed ? (
        <form onSubmit={handleLogin}
              className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-center">AISF-Lite by Rolling Thunder Ventures</h2>
          <input
            className="w-full bg-gray-700 px-4 py-2 rounded"
            placeholder="Username"
            value={user}
            onChange={e => setUser(e.target.value)}
          />
          <input
            type="password"
            className="w-full bg-gray-700 px-4 py-2 rounded"
            placeholder="Password"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          {loginErr && <p className="text-red-500">{loginErr}</p>}
          <button type="submit"
                  className="w-full bg-indigo-600 py-2 rounded hover:bg-indigo-500">
            Log In
          </button>
        </form>
      ) : (
        <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-2xl shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold">AISF-Lite Evaluator</h1>
            <label className="flex items-center space-x-2">
              <span>Compare Mode</span>
              <input
                type="checkbox"
                className="form-checkbox"
                checked={compareMode}
                onChange={() => setCompareMode(!compareMode)}
              />
            </label>
          </div>

          <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Investment A */}
            <div className="bg-gray-700 p-4 rounded space-y-2">
              <h2 className="font-semibold">Investment A</h2>
              <input
                className="w-full bg-gray-600 px-3 py-2 rounded"
                placeholder="Company Name"
                value={company1}
                onChange={e => setCompany1(e.target.value)}
              />
              <input
                type="number" step="0.1"
                className="w-full bg-gray-600 px-3 py-2 rounded"
                placeholder="YoY Growth %"
                value={growth1}
                onChange={e => setGrowth1(e.target.value)}
              />
              <input
                type="number" step="0.1"
                className="w-full bg-gray-600 px-3 py-2 rounded"
                placeholder="TAM ($M)"
                value={tam1}
                onChange={e => setTam1(e.target.value)}
              />
              <input
                type="number" step="0.1"
                className="w-full bg-gray-600 px-3 py-2 rounded"
                placeholder="Revenue ($M)"
                value={rev1}
                onChange={e => setRev1(e.target.value)}
              />
            </div>

            {/* Investment B (only if compareMode) */}
            {compareMode && (
              <div className="bg-gray-700 p-4 rounded space-y-2">
                <h2 className="font-semibold">Investment B</h2>
                <input
                  className="w-full bg-gray-600 px-3 py-2 rounded"
                  placeholder="Company Name"
                  value={company2}
                  onChange={e => setCompany2(e.target.value)}
                />
                <input
                  type="number" step="0.1"
                  className="w-full bg-gray-600 px-3 py-2 rounded"
                  placeholder="YoY Growth %"
                  value={growth2}
                  onChange={e => setGrowth2(e.target.value)}
                />
                <input
                  type="number" step="0.1"
                  className="w-full bg-gray-600 px-3 py-2 rounded"
                  placeholder="TAM ($M)"
                  value={tam2}
                  onChange={e => setTam2(e.target.value)}
                />
                <input
                  type="number" step="0.1"
                  className="w-full bg-gray-600 px-3 py-2 rounded"
                  placeholder="Revenue ($M)"
                  value={rev2}
                  onChange={e => setRev2(e.target.value)}
                />
              </div>
            )}

            <div className="md:col-span-2 text-center">
              <button
                type="submit"
                className="bg-green-600 px-6 py-2 rounded hover:bg-green-500"
              >
                Calculate
              </button>
            </div>
          </form>

          {/* Results & Chart */}
          {res1 && (
            <div className="space-y-6">
              {/* Comparison Mode */}
              {compareMode ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[res1, res2].map((r, i) => (
                    <div key={i} className="bg-gray-700 p-4 rounded">
                      <h3 className="font-semibold">{r.name}</h3>
                      <p>Score: <strong>{r.score}</strong></p>
                      <p>{r.rec}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Single-mode Analysis */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 rounded">
                      <h3 className="font-semibold">Growth</h3>
                      <p>{analyzeGrowth(res1.gF)}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded">
                      <h3 className="font-semibold">TAM</h3>
                      <p>{analyzeTam(res1.tF)}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded">
                      <h3 className="font-semibold">Penetration</h3>
                      <p>{analyzePen(res1.rF, res1.tF)}</p>
                    </div>
                  </div>

                  {/* Forecast Chart */}
                  {forecast && (
                    <div className="bg-gray-700 p-4 rounded">
                      <Line
                        data={{
                          labels: forecast.years,
                          datasets: forecast.datasets.map(ds => ({
                            ...ds,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderColor:
                              ds.label === '3× Exit'  ? '#10b981' :
                              ds.label === '5× Exit'  ? '#4f46e5' :
                              ds.label === '7× Exit'  ? '#f59e0b' :
                              ds.label === '9× Exit'  ? '#ef4444' :
                                                         '#3b82f6',
                            tension: 0.3,
                          }))
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { labels: { color: '#ddd' } }
                          },
                          scales: {
                            x: {
                              ticks: { color: '#bbb' },
                              title: { display: true, text: 'Years', color: '#ddd' }
                            },
                            y: {
                              ticks: { color: '#bbb' },
                              title: { display: true, text: 'Valuation ($M)', color: '#ddd' }
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* CSV Export */}
              <div className="flex justify-end">
                <button
                  onClick={handleCopy}
                  className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500"
                >
                  Copy CSV
                </button>
                <textarea ref={csvRef} className="hidden" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
