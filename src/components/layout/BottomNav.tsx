import { useNavStore } from '../../store';
import { NAV_ITEMS }   from '../../constants';
import { MoreHorizontal } from 'lucide-react';

const primaryItems = NAV_ITEMS.filter(item => ['home', 'about', 'projects', 'mixtape'].includes(item.id));
const moreItems = NAV_ITEMS.filter(item => !primaryItems.includes(item));

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
      {primaryItems.map((item) => {
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
      <button type="button" popoverTarget="mobile-navigation-more" aria-label="More pages" className="mobile-nav-more-trigger" data-active={moreItems.some(item => item.id === active)}><MoreHorizontal size={20} aria-hidden="true" /><span>More</span></button>
      <div id="mobile-navigation-more" popover="auto" className="mobile-nav-more"><p>Explore</p>{moreItems.map(item => {
        const Icon = item.icon;
        return <button key={item.id} type="button" aria-current={active === item.id ? 'page' : undefined} onClick={event => { event.currentTarget.closest<HTMLElement>('[popover]')?.hidePopover(); navigate(item.id); }}><Icon size={18} aria-hidden="true" />{item.label}</button>;
      })}</div>
    </nav>
  );
}
