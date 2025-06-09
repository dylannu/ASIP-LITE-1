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
  // ─── Auth State ───
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser]   = useState('');
  const [pass, setPass]   = useState('');
  const [loginErr, setLoginErr] = useState('');

  // ─── Compare Toggle ───
  const [compareMode, setCompareMode] = useState(false);

  // ─── Inputs A ───
  const [company1, setCompany1] = useState('');
  const [growth1,  setGrowth1]  = useState('');
  const [tam1,     setTam1]     = useState('');
  const [rev1,     setRev1]     = useState('');

  // ─── Inputs B ───
  const [company2, setCompany2] = useState('');
  const [growth2,  setGrowth2]  = useState('');
  const [tam2,     setTam2]     = useState('');
  const [rev2,     setRev2]     = useState('');

  // ─── Results & Forecasts ───
  const [res1, setRes1] = useState(null);
  const [res2, setRes2] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [compareForecast, setCompareForecast] = useState(null);
  const csvRef = useRef();

  // ─── Rating Helpers ───
  const rateGrowth = g => g <= 0 ? 1 : g <= 20 ? 3 : g <= 50 ? 5 : g <= 100 ? 7 : g <= 200 ? 9 : 10;
  const rateTam    = t => t < 100 ? 1 : t < 500 ? 3 : t < 1000 ? 5 : t < 5000 ? 7 : 10;
  const ratePen    = (r,t) => {
    const p = (r/t)*100;
    return p < 0.1 ? 1 : p < 1 ? 3 : p < 5 ? 5 : p < 10 ? 7 : 10;
  };

  // ─── Analysis Helpers ───
  const analyzeGrowth = g =>
    g <= 0   ? '⚠️ No growth—urgent pivot.' :
    g < 25   ? '🔻 Low growth—boost acquisition & pricing.' :
    g < 75   ? '🔸 Moderate growth—optimize channels.' :
               '✅ High growth—scale operations.';
  const analyzeTam = t =>
    t < 100   ? '⚠️ Tiny TAM—adjacent markets.' :
    t < 500   ? '🔻 Small TAM—explore niches.' :
    t < 1000  ? '🔸 Medium TAM—good scaling.' :
    t < 5000  ? '✅ Large TAM—high upside.' :
               '🚀 Massive TAM—prime aggressive growth.';
  const analyzePen = (r,t) => {
    const p = (r/t)*100;
    return p < 0.1  ? '⚠️ Minimal traction—intensify GTM.' :
           p < 1    ? '🔻 Early traction—refine PMF.' :
           p < 5    ? '🔸 Good traction—expand segments.' :
                     '✅ Strong traction—leverage pricing.';
  };

  // ─── Exponential Forecast (1×→multiple) ───
  const makeCurve = multiple => {
    const years = Array.from({ length: 21 }, (_,i) => i);
    const vals  = years.map(y => Math.pow(multiple, y/20));
    return { years, vals };
  };

  // ─── Recommendation ───
  const makeRec = (gR,tR,pR) => {
    const mn = Math.min(gR,tR,pR);
    return mn===gR
      ? 'Accelerate top-line growth.'
      : mn===tR
      ? 'Reevaluate TAM strategy.'
      : 'Boost penetration efforts.';
  };

  // ─── Handlers ───
  const handleLogin = e => {
    e.preventDefault();
    if (user==='Rollingthunderventures' && pass==='ADMIN1') {
      setIsAuthed(true);
      setLoginErr('');
    } else {
      setLoginErr('Invalid credentials');
    }
  };

  const handleCalculate = e => {
    e.preventDefault();
    const parseInv = (c,g,t,r) => {
      const gF=parseFloat(g), tF=parseFloat(t), rF=parseFloat(r);
      if (!c||isNaN(gF)||isNaN(tF)||isNaN(rF)) throw 0;
      const gR=rateGrowth(gF), tR=rateTam(tF), pR=ratePen(rF,tF),
            score=(gR*0.4 + tR*0.3 + pR*0.3).toFixed(1),
            rec=makeRec(gR,tR,pR);
      return { name:c, gF,tF,rF,gR,tR,pR,score,rec };
    };

    try {
      const r1 = parseInv(company1,growth1,tam1,rev1);
      setRes1(r1);

      if (compareMode) {
        // clear single-mode
        setForecast(null);

        const r2 = parseInv(company2,growth2,tam2,rev2);
        setRes2(r2);

        // 5× compare only
        const c1 = makeCurve(5),
              c2 = makeCurve(5);
        setCompareForecast({
          years: c1.years,
          datasets: [
            { label:r1.name, data:c1.vals },
            { label:r2.name, data:c2.vals }
          ]
        });
      } else {
        // clear compare-mode
        setRes2(null);
        setCompareForecast(null);

        // build multi-curves
        const multiples = [3,5,7,9,12];
        const datasets = multiples.map(m => {
          const c = makeCurve(m);
          return { label:`${m}×`, data:c.vals };
        });
        setForecast({ years:makeCurve(3).years, datasets });
      }
    } catch {
      alert('Please fill all fields correctly.');
    }
  };

  const handleCopy = () => {
    const rows = compareMode && res2
      ? [['Company','Score'], [res1.name,res1.score], [res2.name,res2.score]]
      : [['Company','Score'], [res1.name,res1.score]];
    const csv = rows.map(r=>r.join(',')).join('\n');
    csvRef.current.value = csv;
    csvRef.current.select();
    document.execCommand('copy');
    alert('CSV copied!');
  };

  // ─── Render ───
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      {/* LOGIN */}
      {!isAuthed
        ? <form onSubmit={handleLogin}
                className="bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-bold text-center text-white">
              AISF-Lite by Rolling Thunder Ventures
            </h2>
            <input className="w-full bg-gray-700 px-4 py-3 rounded-lg text-white placeholder-gray-400"
                   placeholder="Username"
                   value={user}
                   onChange={e=>setUser(e.target.value)} />
            <input type="password"
                   className="w-full bg-gray-700 px-4 py-3 rounded-lg text-white placeholder-gray-400"
                   placeholder="Password"
                   value={pass}
                   onChange={e=>setPass(e.target.value)} />
            {loginErr && <p className="text-center text-red-400">{loginErr}</p>}
            <button type="submit"
                    className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg text-white font-semibold">
              Log In
            </button>
          </form>
        : <div className="bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-4xl space-y-6">
            {/* header */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-extrabold text-white">
                AISF-Lite Evaluator
              </h1>
              <label className="flex items-center space-x-2 text-gray-300">
                <span>Compare Mode</span>
                <input type="checkbox"
                       className="form-checkbox h-5 w-5 text-green-400"
                       checked={compareMode}
                       onChange={()=>{
                         setCompareMode(!compareMode);
                         setRes2(null);
                         setForecast(null);
                         setCompareForecast(null);
                       }} />
              </label>
            </div>

            {/* inputs */}
            <form onSubmit={handleCalculate}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* A */}
              <div className="bg-gray-700 p-6 rounded-2xl space-y-4 max-w-md mx-auto">
                {compareMode && <h2 className="text-xl font-semibold text-white text-center">Investment A</h2>}
                <input className="w-full bg-gray-600 px-4 py-3 rounded-lg text-white placeholder-gray-400"
                       placeholder="Company Name"
                       value={company1}
                       onChange={e=>setCompany1(e.target.value)} />
                <input type="number" step="0.1"
                       className="w-full bg-gray-600 px-4 py-3 rounded-lg text-white placeholder-gray-400"
                       placeholder="YoY Growth %"
                       value={growth1}
                       onChange={e=>setGrowth1(e.target.value)} />
                <input type="number" step="0.1"
                       className="w-full bg-gray-600 px-4 py-3 rounded-lg text-white placeholder-gray-400"
                       placeholder="TAM ($M)"
                       value={tam1}
                       onChange={e=>setTam1(e.target.value)} />
                <input type="number" step="0.1"
                       className="w-full bg-gray-600 px-4 py-3 rounded-lg text-white placeholder-gray-400"
                       placeholder="Revenue ($M)"
                       value={rev1}
                       onChange={e=>setRev1(e.target.value)} />
              </div>

              {/* B */}
              {compareMode
                ? <div className="bg-gray-700 p-6 rounded-2xl space-y-4 max-w-md mx-auto">
                    <h2 className="text-xl font-semibold text-white text-center">Investment B</h2>
                    <input className="w-full bg-gray-600 px-4 py-3 rounded-lg text-white placeholder-gray-400"
                           placeholder="Company Name"
                           value={company2}
                           onChange={e=>setCompany2(e.target.value)} />
                    <input type="number" step="0.1"
                           className="w-full bg-gray-600 px-4 py-3 rounded-lg text-white placeholder-gray-400"
                           placeholder="YoY Growth %"
                           value={growth2}
                           onChange={e=>setGrowth2(e.target.value)} />
                    <input type="number" step="0.1"
                           className="w-full bg-gray-600 px-4 py-3 rounded-lg text-white placeholder-gray-400"
                           placeholder="TAM ($M)"
                           value={tam2}
                           onChange={e=>setTam2(e.target.value)} />
                    <input type="number" step="0.1"
                           className="w-full bg-gray-600 px-4 py-3 rounded-lg text-white placeholder-gray-400"
                           placeholder="Revenue ($M)"
                           value={rev2}
                           onChange={e=>setRev2(e.target.value)} />
                  </div>
                : <div />}

              {/* calculate */}
              <div className="md:col-span-2 text-center">
                <button type="submit"
                        className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-full text-white font-semibold">
                  Calculate
                </button>
              </div>
            </form>

            {/* results */}
            {res1 && (
              <div className="space-y-6">
                {compareMode && res2 ? (
                  <>
                    {/* side-by-side analysis */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {[res1,res2].map((r,i)=>(
                        <div key={i} className="bg-gray-700 p-6 rounded-2xl">
                          <h3 className="text-xl font-semibold text-white mb-2">{r.name}</h3>
                          <p className="text-gray-200"><strong>Score:</strong> {r.score}</p>
                          <p className="mt-2 text-gray-200"><strong>Growth:</strong> {analyzeGrowth(r.gF)}</p>
                          <p className="mt-1 text-gray-200"><strong>TAM:</strong> {analyzeTam(r.tF)}</p>
                          <p className="mt-1 text-gray-200"><strong>Penetration:</strong> {analyzePen(r.rF,r.tF)}</p>
                        </div>
                      ))}
                    </div>
                    {/* compare chart */}
                    {compareForecast && (
                      <div className="bg-gray-700 p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          20-Year @ 5× Exit (start 1×)
                        </h3>
                        <Line
                          data={{
                            labels: compareForecast.years,
                            datasets: compareForecast.datasets.map((ds,idx)=>({
                              ...ds,
                              backgroundColor:'rgba(255,255,255,0.1)',
                              borderColor: idx===0?'#4f46e5':'#10b981',
                              tension:0.3
                            }))
                          }}
                          options={{ responsive:true,
                            plugins:{ legend:{ labels:{ color:'#ddd' } } },
                            scales:{
                              x:{ ticks:{ color:'#bbb' }, title:{ display:true,text:'Years',color:'#ddd'} },
                              y:{ ticks:{ color:'#bbb' }, title:{ display:true,text:'Valuation Multiple',color:'#ddd'} }
                            }
                          }}
                        />
                      </div>
                    )}
                    {/* winner */}
                    <div className="bg-gray-700 p-6 rounded-2xl text-gray-200">
                      <h3 className="text-lg font-semibold text-white mb-2">Recommendation</h3>
                      {res1.score===res2.score
                        ? <p>Both tie at <strong>{res1.score}</strong>. Consider other factors.</p>
                        : <p>
                            <strong>{res1.score>res2.score ? res1.name : res2.name}</strong> wins{' '}
                            with {Math.max(res1.score,res2.score)} vs {Math.min(res1.score,res2.score)}.
                          </p>
                      }
                    </div>
                  </>
                ) : (
                  <>
                    {/* single analysis */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-gray-700 p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-1">Growth</h3>
                        <p className="text-gray-200">{analyzeGrowth(res1.gF)}</p>
                      </div>
                      <div className="bg-gray-700 p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-1">TAM</h3>
                        <p className="text-gray-200">{analyzeTam(res1.tF)}</p>
                      </div>
                      <div className="bg-gray-700 p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-1">Penetration</h3>
                        <p className="text-gray-200">{analyzePen(res1.rF,res1.tF)}</p>
                      </div>
                    </div>
                    {/* multi-multiple forecast */}
                    {forecast && (
                      <div className="bg-gray-700 p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          20-Year Valuation Multiples
                        </h3>
                        <Line
                          data={{
                            labels: forecast.years,
                            datasets: forecast.datasets.map(ds=>({
                              ...ds,
                              backgroundColor:'rgba(255,255,255,0.1)',
                              borderColor:
                                ds.label==='3×'? '#10b981' :
                                ds.label==='5×'? '#4f46e5' :
                                ds.label==='7×'? '#f59e0b' :
                                ds.label==='9×'? '#ef4444' :
                                                 '#3b82f6',
                              tension:0.3
                            }))
                          }}
                          options={{ responsive:true,
                            plugins:{ legend:{ labels:{ color:'#ddd' } } },
                            scales:{
                              x:{ ticks:{ color:'#bbb' }, title:{ display:true,text:'Years',color:'#ddd'} },
                              y:{ ticks:{ color:'#bbb' }, title:{ display:true,text:'Valuation Multiple',color:'#ddd'} }
                            }
                          }}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* CSV */}
                <div className="flex justify-end">
                  <button onClick={handleCopy}
                          className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full text-white">
                    Copy CSV
                  </button>
                  <textarea ref={csvRef} className="hidden" />
                </div>
              </div>
            )}
          </div>
      }
    </div>
  );
}
