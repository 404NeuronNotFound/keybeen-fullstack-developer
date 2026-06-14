import { useNavStore } from '../../store';
import { SITE }        from '../../constants';
import { Avatar }      from '../../components/ui';

export function Topbar() {
  const back       = useNavStore((s) => s.back);
  const forward    = useNavStore((s) => s.forward);
  const canBack    = useNavStore((s) => s.canBack)();
  const canForward = useNavStore((s) => s.canForward)();

  const ArrowBtn = ({ label, onClick, enabled, symbol }: { label: string; onClick: () => void; enabled: boolean; symbol: string }) => (
    <button
      onClick={onClick}
      aria-label={label}
      style={{ width: 32, height: 32, background: 'rgba(0,0,0,.7)', border: 'none', borderRadius: '50%', color: enabled ? 'var(--sp-white)' : 'var(--sp-gray2)', cursor: enabled ? 'pointer' : 'default', fontSize: 14, transition: 'background .15s' }}
      onMouseEnter={(e) => enabled && (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,.7)'; }}
    >
      {symbol}
    </button>
  );

  return (
    <div style={{ background: 'rgba(18,18,18,.92)', backdropFilter: 'blur(12px)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1c', flexShrink: 0, height: 'var(--topbar-h)' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <ArrowBtn label="Go back"    onClick={back}    enabled={canBack}    symbol="←" />
        <ArrowBtn label="Go forward" onClick={forward} enabled={canForward} symbol="→" />
      </div>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--sp-dark3)', padding: '4px 10px 4px 4px', borderRadius: 24, cursor: 'pointer', transition: 'background .15s' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#333'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--sp-dark3)'; }}
      >
        <Avatar size={28} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sp-white)' }}>{SITE.role}</span>
        <span style={{ fontSize: 12, color: 'var(--sp-gray)' }}>▾</span>
      </div>
    </div>
  );
}