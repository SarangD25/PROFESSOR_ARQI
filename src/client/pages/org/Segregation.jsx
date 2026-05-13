import { useQuery } from 'wasp/client/operations';
import { getMyOrganization, getStudentSegregation } from 'wasp/client/operations';
import { Link } from 'react-router';

const tierOrder = ['Excellent', 'Good', 'Average', 'Needs Improvement'];
const tierColors = {
  'Excellent':          { dot: '#22c55e', badge: 'badge-green', card: 'tier-excellent' },
  'Good':              { dot: '#3b82f6', badge: 'badge-blue', card: 'tier-good' },
  'Average':           { dot: '#eab308', badge: 'badge-amber', card: 'tier-avg' },
  'Needs Improvement': { dot: '#ef4444', badge: 'badge-red', card: 'tier-low' }
};

export function OrgSegregation() {
  const { data: org } = useQuery(getMyOrganization);
  const { data: students, isLoading } = useQuery(getStudentSegregation, { orgId: org?.id }, { enabled: !!org?.id });

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text3)' }}>Computing student scores...</div>;

  const grouped = {};
  for (const tier of tierOrder) grouped[tier] = [];
  students?.forEach(s => { grouped[s.tier.name]?.push(s); });

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div><div className="page-title">Student Segregation</div><div className="page-subtitle">Grouped by performance tier</div></div>
        </div>
      </div>
      <div className="px">
        {/* Summary */}
        <div className="grid-4" style={{ marginBottom: '32px' }}>
          {tierOrder.map(tier => (
            <div key={tier} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div className="tier-dot" style={{ background: tierColors[tier].dot }} />
                <span className="stat-label">{tier}</span>
              </div>
              <div className="stat-num">{grouped[tier].length}</div>
            </div>
          ))}
        </div>

        {/* Tier Sections */}
        {tierOrder.map(tier => (
          grouped[tier].length > 0 && (
            <div key={tier} style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: tierColors[tier].dot }}>
                {tier} ({grouped[tier].length})
              </h2>
              <div className="grid-3">
                {grouped[tier].map(s => (
                  <Link key={s.id} to={'/org/student/' + s.id + '/report'} className="card card-glow"
                    style={{ textDecoration: 'none', color: 'var(--text1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{s.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Roll: {s.rollNo} {s.section && `| Sec: ${s.section}`}</div>
                      </div>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: tierColors[tier].dot }}>{s.combinedScore}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge ${tierColors[tier].badge}`}>{tier}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Difficulty: <span style={{ textTransform: 'capitalize' }}>{s.recommendedDifficulty}</span></span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        ))}

        {!students?.length && (
          <div className="card-static" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No students in this organization yet.</p>
          </div>
        )}
      </div>
      <div style={{ height: '32px' }} />
    </div>
  );
}
