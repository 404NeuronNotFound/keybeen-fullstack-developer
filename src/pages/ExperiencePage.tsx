import { useState } from 'react';
import { GraduationCap, Monitor, Sparkles, ChevronDown, CpuIcon  } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Tag } from '../components/ui';
import { experience } from '../data';

/** One icon + gradient per entry, keeping the Spotify "cover art" feel */
const ICONS: LucideIcon[] = [CpuIcon, GraduationCap, Monitor, Sparkles];
const GRADIENTS = ['emerald', 'blue', 'purple'];

export function ExperiencePage() {
  const [openId, setOpenId] = useState<number | null>(experience[0]?.id ?? null);
  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div style={{ padding: '40px 32px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sp-green)', marginBottom: 10 }}>
        Experience
      </p>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--sp-white)', letterSpacing: '-1px', marginBottom: 4 }}>
        My journey
      </h1>
      <p style={{ fontSize: 14, color: 'var(--sp-gray)', marginBottom: 36 }}>
        From "Hello, World!" to shipping full-stack projects.
      </p>

      {/* ── vertical timeline ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 640, position: 'relative' }}>
        {experience.map((job, i) => {
          const isOpen = openId === job.id;
          const Icon = ICONS[i % ICONS.length];
          const gradient = GRADIENTS[i % GRADIENTS.length];
          const isLast = i === experience.length - 1;

          return (
            <div key={job.id} style={{ display: 'flex', gap: 20 }}>
              {/* connector column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div
                  className={`grad-${gradient}`}
                  style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isOpen ? '0 0 0 3px var(--sp-dark), 0 0 0 5px var(--sp-green)' : '0 0 0 3px var(--sp-dark)', transition: 'box-shadow .2s' }}
                >
                  <Icon size={20} color="#fff" strokeWidth={2} />
                </div>
                {!isLast && (
                  <div style={{ flex: 1, width: 2, background: 'var(--sp-dark3)', marginTop: 6, marginBottom: 6, minHeight: 24 }} />
                )}
              </div>

              {/* content */}
              <button
                onClick={() => toggle(job.id)}
                aria-expanded={isOpen}
                style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', paddingBottom: isLast ? 0 : 28, color: 'inherit', font: 'inherit' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--sp-green)', marginBottom: 4 }}>
                      {job.period} · {job.type}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sp-white)', marginBottom: 2 }}>
                      {job.role}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--sp-gray)' }}>{job.company}</div>
                  </div>
                  <ChevronDown
                    size={18}
                    style={{ color: 'var(--sp-gray)', flexShrink: 0, marginTop: 4, transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                  />
                </div>

                {/* expandable detail */}
                <div
                  style={{
                    maxHeight:  isOpen ? 320 : 0,
                    opacity:    isOpen ? 1 : 0,
                    overflow:   'hidden',
                    transition: 'max-height .3s ease, opacity .2s ease',
                  }}
                >
                  <p style={{ fontSize: 14, color: 'var(--sp-gray)', lineHeight: 1.7, margin: '14px 0 12px' }}>
                    {job.description}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {job.tags.map((t) => <Tag key={t} variant="green">{t}</Tag>)}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}