import { useNavStore } from '../../store';
import { NAV_ITEMS }   from '../../constants';

export function BottomNav() {
  const navigate = useNavStore((s) => s.navigate);
  const active   = useNavStore((s) => s.active);

  return (
    <nav
      style={{
        display:        'flex',
        minHeight:      'calc(var(--bottomnav-h) + env(safe-area-inset-bottom, 0px) + 1px)',
        background:     'var(--sp-black)',
        borderTop:      '1px solid var(--sp-dark3)',
        flexShrink:     0,
        paddingBottom:  'env(safe-area-inset-bottom, 0px)',
        paddingLeft:    'env(safe-area-inset-left, 0px)',
        paddingRight:   'env(safe-area-inset-right, 0px)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex:           1,
              minWidth:       0,
              minHeight:      'var(--bottomnav-h)',
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            3,
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              color:          isActive ? 'var(--sp-white)' : 'var(--sp-gray)',
              padding:        '6px 0',
            }}
          >
            <Icon size={20} strokeWidth={2} fill={isActive ? 'currentColor' : 'none'} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.2px', overflowWrap: 'anywhere', lineHeight: 1.2 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
