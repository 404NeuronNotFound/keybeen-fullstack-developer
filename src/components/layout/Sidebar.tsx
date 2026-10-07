import { Lock, Play } from 'lucide-react';
import { useNavStore } from '../../store';
import { useNowCoding }                from '../../hooks';
import { projects }                    from '../../data';
import { NAV_ITEMS }                   from '../../constants';
import type { SectionId }              from '../../types';

export function Sidebar() {
  const navigate     = useNavStore((s) => s.navigate);
  const active       = useNavStore((s) => s.active);
  const nowCoding    = useNowCoding();

  return (
    <aside style={{ width: 'var(--sidebar-w)', background: 'var(--sp-black)', display: 'flex', flexDirection: 'column', padding: '18px 8px 0', flexShrink: 0, overflowY: 'auto' }}>
      {/* logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', marginBottom: 22 }}>
        <div style={{ width: 30, height: 30, background: 'var(--sp-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Play size={14} fill="var(--sp-on-green)" color="var(--sp-on-green)" style={{ marginLeft: 1 }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: '-.3px', color: 'var(--sp-white)' }}>Keybeen</span>
      </div>

      {/* nav */}
      <nav style={{ marginBottom: 4 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as SectionId)}
              style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: isActive ? 'var(--sp-white)' : 'var(--sp-gray)', background: isActive ? 'var(--sp-dark3)' : 'transparent', border: 'none', width: '100%', textAlign: 'left', fontSize: 14, fontWeight: 700, transition: 'color .1s, background .1s' }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--sp-white)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--sp-gray)'; }}
            >
              <Icon
                size={22}
                strokeWidth={2}
                fill={isActive ? 'currentColor' : 'none'}
                style={{ flexShrink: 0 }}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ height: 1, background: 'var(--sp-dark3)', margin: '12px 10px' }} />

      {/* pinned featured projects — in development */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.1px', textTransform: 'uppercase', color: 'var(--sp-gray)' }}>Pinned</span>
        <Lock size={11} color="var(--sp-gray)" />
      </div>
      {projects.filter((p) => p.featured).map((p) => (
        <button
          key={p.id}
          className="pinned-project"
          onClick={() => navigate('projects')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'transparent', border: 'none', color: 'inherit', width: '100%', transition: 'background .1s', opacity: 0.6 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sp-dark3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            flexShrink: 0,
            filter: 'grayscale(0.4)',
          }}
        >
          <img
            src={p.image}
            alt={p.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sp-gray)', overflowWrap: 'anywhere' }}>{p.shortTitle}</div>
            <div style={{ fontSize: 11, color: 'var(--sp-gray)' }}>Coming soon</div>
          </div>
        </button>
      ))}

      {/* now coding widget */}
      <div style={{ marginTop: 'auto', padding: '10px 8px', background: 'linear-gradient(to top, rgba(29,185,84,.1), transparent)', borderRadius: 'var(--radius-sm)', marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--sp-green)', marginBottom: 4, padding: '0 2px' }}>Now coding</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sp-white)', padding: '0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nowCoding}</div>
        <div style={{ fontSize: 11, color: 'var(--sp-gray)', padding: '0 2px', marginBottom: 6 }}>Full-Stack · TypeScript</div>
      </div>
    </aside>
  );
}
