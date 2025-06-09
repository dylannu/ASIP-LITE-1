import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

// Analysis helpers
const getGrowthAnalysis = rating => {
  if (rating < 4) return `Low growth (${rating.toFixed(1)}): consider new channels, pricing tests, or sales hires.`;
  if (rating < 7) return `Moderate growth (${rating.toFixed(1)}): optimize pricing, upsell, or target premium segments.`;
  return `Strong growth (${rating.toFixed(1)}): maintain momentum by scaling channels and operational efficiency.`;
};
const getTamAnalysis = rating => {
  if (rating < 4) return `Small market (${rating.toFixed(1)}): research adjacent segments or new geographies.`;
  if (rating < 7) return `Moderate market (${rating.toFixed(1)}): validate additional use cases or expand internationally.`;
  return `Large market (${rating.toFixed(1)}): focus on share acquisition and competitive positioning.`;
};
const getPenAnalysis = rating => {
  if (rating < 4) return `Low penetration (${rating.toFixed(1)}): invest in marketing, partnerships, or product improvements.`;
  if (rating < 7) return `Emerging traction (${rating.toFixed(1)}): double down on retention and refine go-to-market.`;
  return `Strong traction (${rating.toFixed(1)}): leverage partnerships to accelerate scale.`;
};
const getRecommendation = (g, t, p) => {
  const weakestScore = Math.min(g, t, p);
  const weakest = [];
  if (g === weakestScore) weakest.push('Growth');
  if (t === weakestScore) weakest.push('TAM');
  if (p === weakestScore) weakest.push('Penetration');
  if (weakest.length === 1) {
    switch (weakest[0]) {
      case 'Growth': return 'Priority: Accelerate revenue growth—expand sales & marketing initiatives.';
      case 'TAM': return 'Priority: Expand market opportunity—explore new segments or regions.';
      case 'Penetration': return 'Priority: Increase penetration—focus on customer acquisition and retention.';
    }
  }
  return `Priority: Strengthen ${weakest.map(w => w.toLowerCase()).join(' & ')} through targeted strategies.`;
};

export default function AISFLiteApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [company, setCompany] = useState('');
  const [growth, setGrowth] = useState('');
  const [tam, setTam] = useState('');
  const [revenue, setRevenue] = useState('');
  const [result, setResult] = useState(null);
  const textareaRef = useRef(null);

  const handleLogin = () => {
    if (username === 'Rollingthunderventures' && password === 'ADMIN1') {
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };
  const rateGrowth = pct => {
    if (pct <= 0) return 1;
    if (pct <= 20) return 2 + pct / 20;
    if (pct <= 50) return 4 + (pct - 20) / 30;
    if (pct <= 100) return 6 + (pct - 50) / 50;
    if (pct <= 200) return 8 + (pct - 100) / 100;
    return 10;
  };
  const rateTam = m => {
    if (m < 100) return 1 + m / 100;
    if (m < 500) return 3 + (m - 100) / 400;
    if (m < 1000) return 5 + (m - 500) / 500;
    if (m < 5000) return 7 + (m - 1000) / 4000;
    return 10;
  };
  const ratePen = pct => {
    if (pct < 0.01) return 1 + pct / 0.01;
    if (pct < 0.1) return 3 + (pct - 0.01) / 0.09;
    if (pct < 1) return 5 + (pct - 0.1) / 0.9;
    if (pct < 5) return 7 + (pct - 1) / 4;
    return 10;
  };
  const classify = s => (s >= 8 ? 'Excellent' : s >= 6 ? 'Promising' : 'High Risk / Early');

  const calculate = () => {
    const g = parseFloat(growth);
    const t = parseFloat(tam);
    const r = parseFloat(revenue);
    if (!company.trim() || [g, t, r].some(isNaN)) {
      setResult({ error: 'Please fill in all fields with valid values.' });
      return;
    }
    const penetrationPct = (r / t) * 100;
    const gR = rateGrowth(g);
    const tR = rateTam(t);
    const pR = ratePen(penetrationPct);
    const score = parseFloat((gR * 0.4 + tR * 0.3 + pR * 0.3).toFixed(1));
    setResult({
      penetrationPct: penetrationPct.toFixed(2),
      growthRating: gR.toFixed(1),
      tamRating: tR.toFixed(1),
      penRating: pR.toFixed(1),
      score,
      classification: classify(score),
      analysis: { growth: getGrowthAnalysis(gR), tam: getTamAnalysis(tR), penetration: getPenAnalysis(pR) },
      recommendation: getRecommendation(gR, tR, pR)
    });
  };

  const exportToCSV = () => {
    if (!result || result.error) return;
    const headers = ['Company','Growth %','TAM ($M)','Revenue ($M)','Penetration %','Growth Rating','TAM Rating','Penetration Rating','Score','Classification'];
    const row = [company, growth, tam, revenue, result.penetrationPct, result.growthRating, result.tamRating, result.penRating, result.score, result.classification];
    const csvContent = [headers.join(','), row.join(',')].join('\n');
    // Place CSV in hidden textarea and copy
    if (textareaRef.current) {
      textareaRef.current.value = csvContent;
      textareaRef.current.select();
      document.execCommand('copy');
      alert('CSV data copied to clipboard!');
    }
  };

  if (!authenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-50">
        <Card className="w-full max-w-sm p-6">
          <CardContent>
            <h2 className="text-center text-xl mb-4">Login</h2>
            {loginError && <p className="text-red-500 text-center mb-2">{loginError}</p>}
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
            <Label htmlFor="password" className="mt-2">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <Button onClick={handleLogin} className="mt-4 w-full">Unlock</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 min-h-screen">
      <header className="bg-blue-600 text-white p-4 text-center font-bold">Rolling Thunder Ventures AISF-Lite</header>
      <main className="max-w-xl mx-auto p-6">
        <Card className="mb-6"><CardContent>
          <Label>Company Name</Label>
          <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Alpha" />
          <Label className="mt-2">YoY Growth (%)</Label>
          <Input type="number" value={growth} onChange={e => setGrowth(e.target.value)} placeholder="e.g. 75" />
          <Label className="mt-2">TAM ($M)</Label>
          <Input type="number" value={tam} onChange={e => setTam(e.target.value)} placeholder="e.g. 1500" />
          <Label className="mt-2">Revenue ($M)</Label>
          <Input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="e.g. 10" />
          <Button onClick={calculate} className="mt-4 w-full">Calculate Score</Button>
        </CardContent></Card>

        {result && result.error && <p className="text-red-500 text-center mb-4">{result.error}</p>}
        {result && !result.error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card><CardContent>
              <p><strong>Penetration:</strong> {result.penetrationPct}% → Rating {result.penRating}</p>
              <p><strong>Growth Rating:</strong> {result.growthRating}</p>
              <p><strong>TAM Rating:</strong> {result.tamRating}</p>
              <p className="text-lg font-bold mt-2">Overall Score: {result.score}</p>
              <p className="uppercase text-blue-600 mb-4">{result.classification}</p>
              <p><strong>Growth Analysis:</strong> {result.analysis.growth}</p>
              <p><strong>TAM Analysis:</strong> {result.analysis.tam}</p>
              <p><strong>Penetration Analysis:</strong> {result.analysis.penetration}</p>
              <p className="mt-3 font-medium">Recommendation: {result.recommendation}</p>
              <Button onClick={exportToCSV} className="mt-4 w-full">Copy CSV to Clipboard</Button>
              <textarea ref={textareaRef} className="hidden" aria-hidden="true" />
            </CardContent></Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
