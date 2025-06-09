import { useState, useRef } from 'react';

export default function Home() {
  // --- Authentication state ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- Input state ---
  const [companyName, setCompanyName] = useState('');
  const [growth, setGrowth] = useState('');
  const [tam, setTam] = useState('');
  const [revenue, setRevenue] = useState('');

  // --- Computed results ---
  const [results, setResults] = useState(null);

  // --- Ref for CSV copy fallback ---
  const hiddenTextarea = useRef(null);

  // --- Rating functions ---
  function rateGrowth(g) {
    if (g <= 0) return 1;
    if (g <= 20) return Math.round(2 + ((g - 1) / 19) * 1);
    if (g <= 50) return Math.round(4 + ((g - 21) / 29) * 1);
    if (g <= 100) return Math.round(6 + ((g - 51) / 49) * 1);
    if (g <= 200) return Math.round(8 + ((g - 101) / 99) * 1);
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

  // --- Recommendation logic ---
  function makeRecommendation(gR, tR, pR) {
    const lowest = Math.min(gR, tR, pR);
    if (lowest === gR) {
      if (gR < 4)
        return 'Your YoY growth is low—focus on customer acquisition or pricing pivots.';
      if (gR < 7) return 'Growth is moderate—consider expanding channels or partnerships.';
      return 'Growth is strong—maintain momentum and optimize unit economics.';
    }
    if (lowest === tR) {
      if (tR < 4)
        return 'TAM is small—reevaluate market sizing or pivot to adjacent, larger markets.';
      if (tR < 7) return 'TAM is decent—explore new verticals within your sector.';
      return 'TAM is very strong—ready to scale broadly.';
    }
    // Penetration weakest
    if (pR < 4)
      return 'Early penetration—accelerate marketing and sales efforts for initial traction.';
    if (pR < 7)
      return 'Moderate penetration—leverage referrals or enterprise pilots.';
    return 'High penetration—consider raising price or upselling.';
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

  // --- Calculate and analyze ---
  function handleCalculate(e) {
    e.preventDefault();
    const g = parseFloat(growth);
    const t = parseFloat(tam);
    const r = parseFloat(revenue);
    if (!companyName || isNaN(g) || isNaN(t) || isNaN(r)) {
      return alert('Please fill all fields with valid numbers.');
    }
    const gR = rateGrowth(g);
    const tR = rateTam(t);
    const pR = ratePenetration(r, t);
    const score = ((gR * 0.4 + tR * 0.3 + pR * 0.3)).toFixed(1);
    const recommendation = makeRecommendation(gR, tR, pR);
    setResults({ g, t, r, gR, tR, pR, score, recommendation });
  }

  // --- Copy CSV fallback ---
  function copyCSV() {
    if (!results) return;
    const { g, t, r, gR, tR, pR, score } = results;
    const headers = [
      'Company',
      'YoY Growth %',
      'TAM ($M)',
      'Revenue ($M)',
      'Growth Rating',
      'TAM Rating',
      'Penetration Rating',
      'AISF Score',
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {!isAuthenticated ? (
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
        >
          <h2 className="text-center text-xl mb-4">Login</h2>
          <label className="block mb-2">
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </label>
          <label className="block mb-4">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </label>
          {loginError && (
            <p className="text-red-500 text-center mb-2">{loginError}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Log In
          </button>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
          <h1 className="text-2xl font-bold mb-6">
            AISF-Lite Investment Evaluator
          </h1>
          <form onSubmit={handleCalculate} className="space-y-4">
            <label className="block">
              Company Name
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </label>
            <label className="block">
              YoY Growth %
              <input
                type="number"
                step="0.1"
                value={growth}
                onChange={(e) => setGrowth(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </label>
            <label className="block">
              TAM ($M)
              <input
                type="number"
                step="0.1"
                value={tam}
                onChange={(e) => setTam(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </label>
            <label className="block">
              Revenue ($M)
              <input
                type="number"
                step="0.1"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </label>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Calculate
            </button>
          </form>

          {results && (
            <div className="mt-6 space-y-3">
              <h2 className="text-xl font-semibold">Results &amp; Analysis</h2>
              <p>
                <strong>Company:</strong> {companyName}
              </p>
              <p>
                <strong>AISF-Lite Score:</strong> {results.score}
              </p>
              <ul className="list-disc pl-5">
                <li>
                  Growth Rating ({results.gR}):{' '}
                  {results.gR <= 3
                    ? 'Needs improvement'
                    : results.gR <= 7
                    ? 'Moderate'
                    : 'Strong'}
                </li>
                <li>
                  TAM Rating ({results.tR}):{' '}
                  {results.tR <= 3
                    ? 'Small market'
                    : results.tR <= 7
                    ? 'Decent market'
                    : 'Large market'}
                </li>
                <li>
                  Penetration Rating ({results.pR}):{' '}
                  {results.pR <= 3
                    ? 'Early traction'
                    : results.pR <= 7
                    ? 'Moderate traction'
                    : 'High traction'}
                </li>
              </ul>
              <p className="mt-2">
                <strong>Recommendation:</strong> {results.recommendation}
              </p>
              <button
                onClick={copyCSV}
                className="mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Copy CSV to Clipboard
              </button>
              <textarea ref={hiddenTextarea} className="hidden"></textarea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
