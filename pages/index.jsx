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
  // — Auth State —
  const [isAuthed, setIsAuthed] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  // — Input State —
  const [company, setCompany] = useState('');
  const [growth, setGrowth] = useState('');
  const [tam, setTam] = useState('');
  const [rev, setRev] = useState('');

  // — Results & Forecast —
  const [res, setRes] = useState(null);
  const [fc, setFc] = useState(null);
  const csvRef = useRef();

  // — Rating Helpers —
  const rateGrowth = g =>
    g <= 0 ? 1 :
    g <= 20 ? 3 :
    g <= 50 ? 5 :
    g <= 100 ? 7 :
    g <= 200 ? 9 : 10;

  const rateTam = t =>
    t < 100   ? 1 :
    t < 500   ? 3 :
    t < 1000  ? 5 :
    t < 5000  ? 7 : 10;

  const ratePenetration = (r, t) => {
    const p = (r / t) * 100;
    return p < 0.1 ? 1 :
           p < 1   ? 3 :
           p < 5   ? 5 :
           p < 10  ? 7 : 10;
  };

  // — Deep Analysis —
  const analyzeGrowth = g =>
    g <= 0   ? '⚠️ No growth—urgent pivot required.'
    : g < 25 ? '🔻 Low growth—boost customer acquisition & pricing.'
    : g < 75 ? '🔸 Moderate growth—optimize channels & partnerships.'
             : '✅ High growth—scale operations and capacity.';

  const analyzeTam = t =>
    t < 100    ? '⚠️ Tiny TAM—consider adjacent markets.'
    : t < 500  ? '🔻 Small TAM—explore niche expansions.'
    : t < 1000 ? '🔸 Medium TAM—good scale opportunity.'
    : t < 5000 ? '✅ Large TAM—high upside potential.'
               : '🚀 Massive TAM—prime for aggressive growth.';

  const analyzePen = (r, t) => {
    const p = (r / t) * 100;
    return p < 0.1  ? '⚠️ Minimal traction—intensify go-to-market.'
         : p < 1    ? '🔻 Early traction—iterate product-market fit.'
         : p < 5    ? '🔸 Good traction—expand customer segments.'
                    : '✅ Strong traction—leverage pricing power.';
  };

  // — 20-Year Forecast (Revenue to Valuation ×5) —
  const makeForecast = (g, startRev) => {
    const years = Array.from({ length: 21 }, (_, i) => i);
    const data = years.map(y =>
      (startRev * (1 + g/100) ** y) * 5
    );
    return { years, data };
  };

  // — Recommendation Based on Weakest —
  const makeRec = (gR, tR, pR) => {
    const mn = Math.min(gR, tR, pR);
    if (mn === gR) return 'Focus on accelerating top-line growth.';
    if (mn === tR) return 'Reevaluate market strategy to expand TAM.';
    return 'Boost go-to-market to deepen penetration.';
  };

  // — Handlers —
  const onLogin = e => {
    e.preventDefault();
    if (user === 'Rollingthunderventures' && pass === 'ADMIN1') {
      setIsAuthed(true);
      setLoginErr('');
    } else {
      setLoginErr('Invalid credentials');
    }
  };

  const onCalculate = e => {
    e.preventDefault();
    const g = parseFloat(growth), t = parseFloat(tam), r = parseFloat(rev);
    if (!company || isNaN(g) || isNaN(t) || isNaN(r)) {
      return alert('Please fill all fields with valid numbers.');
    }
    const gR = rateGrowth(g), tR = rateTam(t), pR = ratePenetration(r, t);
    const score = ((gR*0.4 + tR*0.3 + pR*0.3)).toFixed(1);
    const rec   = makeRec(gR, tR, pR);
    setRes({ g, t, r, gR, tR, pR, score, rec });
    setFc(makeForecast(g, r));
  };

  const onCopyCSV = () => {
    if (!res) return;
    const { g, t, r, gR, tR, pR, score, rec } = res;
    const header = ['Company','YoY Growth%','TAM($M)','Rev($M)','gR','tR','pR','Score','Rec'];
    const row = [company, g, t, r, gR, tR, pR, score, `"${rec}"`];
    const csv  = header.join(',') + '\\n' + row.join(',');
    csvRef.current.value = csv;
    csvRef.current.select();
    document.execCommand('copy');
    alert('CSV copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-50 flex items-center justify-center p-6">
      {!isAuthed ? (
        <form onSubmit={onLogin} className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-center">Secure Login</h2>
          <input
            placeholder="Username"
            value={user} onChange={e => setUser(e.target.value)}
            className="w-full bg-gray-700 px-4 py-2 rounded"
          />
          <input
            type="password" placeholder="Password"
            value={pass} onChange={e => setPass(e.target.value)}
            className="w-full bg-gray-700 px-4 py-2 rounded"
          />
          {loginErr && <p className="text-red-500">{loginErr}</p>}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-semibold">
            Log In
          </button>
        </form>
      ) : (
        <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-2xl shadow-2xl space-y-8">
          <h1 className="text-4xl font-extrabold text-center">AISF-Lite Evaluator</h1>

          <form onSubmit={onCalculate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1">Company Name</label>
              <input
                value={company} onChange={e => setCompany(e.target.value)}
                className="w-full bg-gray-700 px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">YoY Growth %</label>
              <input
                type="number" step="0.1" value={growth} onChange={e => setGrowth(e.target.value)}
                className="w-full bg-gray-700 px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">TAM ($M)</label>
              <input
                type="number" step="0.1" value={tam} onChange={e => setTam(e.target.value)}
                className="w-full bg-gray-700 px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Revenue ($M)</label>
              <input
                type="number" step="0.1" value={rev} onChange={e => setRev(e.target.value)}
                className="w-full bg-gray-700 px-4 py-2 rounded"
              />
            </div>
            <div className="md:col-span-2 text-center">
              <button type="submit" className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl font-semibold">
                Calculate
              </button>
            </div>
          </form>

          {res && fc && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="font-bold mb-1">Growth Analysis</h3>
                  <p>{analyzeGrowth(res.g)}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="font-bold mb-1">TAM Analysis</h3>
                  <p>{analyzeTam(res.t)}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="font-bold mb-1">Penetration Analysis</h3>
                  <p>{analyzePen(res.r, res.t)}</p>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded">
                <h3 className="text-xl font-semibold mb-2">20-Year Valuation Forecast</h3>
                <Line
                  data={{
                    labels: fc.years,
                    datasets: [{
                      label: 'Valuation ($M)',
                      data: fc.data.map(v => v.toFixed(2)),
                      borderColor: '#4f46e5',
                      backgroundColor: 'rgba(79,70,229,0.3)',
                    }]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      x: { title: { display: true, text: 'Years from Now' } },
                      y: { title: { display: true, text: 'Valuation ($M)' } }
                    }
                  }}
                />
              </div>

              <div className="flex justify-end">
                <button onClick={onCopyCSV} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl">
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
