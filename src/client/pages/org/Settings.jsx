import { useState, useEffect } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getMyOrganization, getOrgConfig } from 'wasp/client/operations';
import { updateOrgConfig } from 'wasp/client/operations';
import { Link } from 'react-router';

export function OrgSettings() {
  const { data: org } = useQuery(getMyOrganization);
  const { data: config, refetch } = useQuery(getOrgConfig, { orgId: org?.id }, { enabled: !!org?.id });
  const updateConfig = useAction(updateOrgConfig);
  const [weights, setWeights] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (config) setWeights({ weightAssignment: config.weightAssignment, weightBehavior: config.weightBehavior, weightPerformance: config.weightPerformance, weightClassTest: config.weightClassTest });
  }, [config]);

  if (!weights) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text3)' }}>Loading...</div>;

  const total = weights.weightAssignment + weights.weightBehavior + weights.weightPerformance + weights.weightClassTest;

  const handleSave = async () => {
    if (Math.abs(total - 1.0) > 0.01) { setError('Weights must sum to 100%'); return; }
    setError('');
    try { await updateConfig({ orgId: org.id, ...weights }); setSaved(true); refetch(); setTimeout(() => setSaved(false), 2000); }
    catch (err) { setError(err.message); }
  };

  const WeightRow = ({ label, field }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--bg0)', borderRadius: '8px', border: '1px solid var(--border2)' }}>
      <span style={{ flex: 1, fontSize: '14px' }}>{label}</span>
      <input type="number" value={Math.round(weights[field] * 100)}
        onChange={e => setWeights({...weights, [field]: (parseFloat(e.target.value) || 0) / 100})}
        className="form-input" style={{ width: '72px', textAlign: 'center', padding: '6px' }} min="0" max="100" step="5" />
      <span style={{ color: 'var(--text3)', fontSize: '13px' }}>%</span>
    </div>
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><div className="page-title">Settings</div><div className="page-subtitle">Configure scoring weights</div></div>
        </div>
      </div>
      <div className="px" style={{ maxWidth: '560px' }}>
        {error && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', background: '#ef444415', color: 'var(--red)', border: '1px solid #ef444430' }}>{error}</div>}
        {saved && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', background: '#22c55e15', color: 'var(--green)', border: '1px solid #22c55e30' }}>Weights saved!</div>}

        <div className="card card-glow">
          <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Score Weight Configuration</div>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>Set how much each category contributes to the combined score. Must total 100%.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <WeightRow label="Assignments" field="weightAssignment" />
            <WeightRow label="Class Behavior" field="weightBehavior" />
            <WeightRow label="Class Performance" field="weightPerformance" />
            <WeightRow label="Class Tests (QR)" field="weightClassTest" />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: Math.abs(total - 1.0) > 0.01 ? 'var(--red)' : 'var(--green)' }}>
            Total: {Math.round(total * 100)}% {Math.abs(total - 1.0) > 0.01 ? '(must be 100%)' : ''}
          </div>
          <button onClick={handleSave} disabled={Math.abs(total - 1.0) > 0.01} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: Math.abs(total - 1.0) > 0.01 ? 0.5 : 1 }}>
            Save Weights
          </button>
        </div>
      </div>
      <div style={{ height: '32px' }} />
    </div>
  );
}
