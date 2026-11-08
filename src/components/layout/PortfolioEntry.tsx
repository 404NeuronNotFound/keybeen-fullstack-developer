import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, Disc3 } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SITE } from '../../constants';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import { shouldPlaySiteIntro, rememberSiteIntro } from '../../utils/siteIntro';
import { focusPageHeading } from '../../utils/pageFocus';
import { useNavStore } from '../../store/navStore';
import '../../styles/entry.css';

gsap.registerPlugin(useGSAP);

function SiteIntro({ reveal, finish, morphing }: { reveal: () => void; finish: () => void; morphing: boolean }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.entry-record', { scale: 0.86, opacity: 0, duration: 0.9 }, 0)
        .fromTo('.entry-record-grooves', { rotation: -140 }, { rotation: 25, duration: 2.15, ease: 'power2.out' }, 0)
        .from('.entry-eyebrow', { y: 8, opacity: 0, duration: 0.65 }, 0.2)
        .fromTo('.entry-name-word', { yPercent: 115 }, { yPercent: 0, duration: 0.95, ease: 'power4.out' }, 0.38)
        .from('.entry-role', { y: 12, opacity: 0, duration: 0.8 }, 0.65)
        .from('.entry-footer', { opacity: 0, duration: 0.65 }, 0.75)
        .call(reveal, [], 1.8);
    }, root);
    media.add('(prefers-reduced-motion: reduce)', finish);
    return () => media.revert();
  }, { scope: root, dependencies: [reveal, finish] });

  useGSAP(() => {
    if (!morphing || !root.current) return;
    const overlay = root.current;
    const app = document.querySelector<HTMLElement>('.entry-app');
    const portrait = app?.querySelector<HTMLElement>('.hero-portrait');
    const name = app?.querySelector<HTMLElement>('.hero-name-word');
    const sourcePortrait = overlay.querySelector<HTMLElement>('.entry-record-label');
    const sourceName = overlay.querySelector<HTMLElement>('.entry-name-word');
    if (!app || !portrait || !name || !sourcePortrait || !sourceName) {
      gsap.to(overlay, { opacity: 0, duration: 0.5, onComplete: finish });
      return;
    }

    // Measure the mounted Home layout, including its sidebar and mobile sizing.
    const photoFrom = sourcePortrait.getBoundingClientRect();
    const photoTo = portrait.getBoundingClientRect();
    const nameFrom = sourceName.getBoundingClientRect();
    const nameTo = name.getBoundingClientRect();
    if (!photoFrom.width || !nameFrom.width || photoTo.bottom < 0 || nameTo.top > window.innerHeight) {
      gsap.to(overlay, { opacity: 0, duration: 0.5, onComplete: finish });
      return;
    }

    // Floating copies bridge the two layouts without moving React-owned nodes.
    const photoCopy = sourcePortrait.cloneNode(true) as HTMLElement;
    const nameCopy = document.createElement('span');
    nameCopy.textContent = SITE.fullName;
    const nameStyle = getComputedStyle(sourceName);
    Object.assign(nameCopy.style, {
      fontFamily: nameStyle.fontFamily, fontSize: nameStyle.fontSize,
      fontWeight: nameStyle.fontWeight, letterSpacing: nameStyle.letterSpacing,
      lineHeight: nameStyle.lineHeight, color: nameStyle.color, whiteSpace: 'nowrap',
    });
    for (const copy of [photoCopy, nameCopy]) {
      copy.setAttribute('aria-hidden', 'true');
      Object.assign(copy.style, { position: 'fixed', inset: 'auto', margin: '0', zIndex: '4', pointerEvents: 'none', transformOrigin: '0 0' });
      overlay.appendChild(copy);
    }
    Object.assign(photoCopy.style, { left: `${photoFrom.left}px`, top: `${photoFrom.top}px`, width: `${photoFrom.width}px`, height: `${photoFrom.height}px` });
    Object.assign(nameCopy.style, { left: `${nameFrom.left}px`, top: `${nameFrom.top}px`, display: 'block' });
    const copyNameBounds = nameCopy.getBoundingClientRect();
    gsap.set([sourcePortrait, sourceName, portrait, name], { opacity: 0 });

    gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: finish })
      .to('.entry-backdrop', { opacity: 0, duration: 0.85 }, 0)
      .to('.entry-brand, .entry-eyebrow, .entry-role, .entry-footer', { opacity: 0, duration: 0.3 }, 0)
      .to('.entry-record-grooves', { scale: 0.72, opacity: 0, duration: 0.55 }, 0)
      .to(photoCopy, {
        x: photoTo.left - photoFrom.left, y: photoTo.top - photoFrom.top,
        scaleX: photoTo.width / photoFrom.width, scaleY: photoTo.height / photoFrom.height,
        borderColor: getComputedStyle(portrait).borderColor, duration: 1,
      }, 0.02)
      .to(nameCopy, {
        x: nameTo.left - nameFrom.left, y: nameTo.top - nameFrom.top,
        scaleX: nameTo.width / copyNameBounds.width, scaleY: nameTo.height / copyNameBounds.height,
        duration: 1,
      }, 0.04)
      .fromTo(app.querySelectorAll('.hero-copy > :not(h1), .hero-stats, .hero-actions'),
        { y: 10, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out', clearProps: 'transform,opacity' }, 0.38)
      .to([portrait, name], { opacity: 1, duration: 0.16 }, 0.94)
      .to([photoCopy, nameCopy], { opacity: 0, duration: 0.16 }, 0.94)
      .to('.entry-header button', { opacity: 0, duration: 0.16 }, 0.94);

    window.addEventListener('resize', finish);
    return () => {
      window.removeEventListener('resize', finish);
      photoCopy.remove();
      nameCopy.remove();
    };
  }, { scope: root, dependencies: [morphing, finish], revertOnUpdate: true });

  useEffect(() => {
    // Neither an animation problem nor a background tab can strand the visitor.
    const timeout = window.setTimeout(finish, 5000);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); finish(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [finish]);

  return <section ref={root} className="portfolio-entry" aria-label="Welcome to Keybeen's portfolio">
    <div className="entry-backdrop" aria-hidden="true" />
    <header className="entry-header"><span className="entry-brand"><Disc3 size={19} aria-hidden="true" />{SITE.name}</span><button type="button" autoFocus onClick={finish}>Skip intro<ArrowRight size={15} aria-hidden="true" /></button></header>
    <div className="entry-stage">
      <div className="entry-record" aria-hidden="true"><div className="entry-record-grooves" /><div className="entry-record-label"><span>{SITE.initials}</span><ResponsiveImage src="/avatar.jpeg" alt="" loading="eager" fetchPriority="high" sizes="192px" onError={event => { event.currentTarget.style.display = 'none'; }} /></div></div>
      <p className="entry-eyebrow">Independent developer</p>
      <h1 className="entry-name"><span className="entry-name-word">{SITE.fullName}<span>.</span></span></h1>
      <p className="entry-role">{SITE.role}</p>
    </div>
    <footer className="entry-footer"><span>Web & mobile</span><span>{SITE.location}</span></footer>
  </section>;
}

export function PortfolioEntry({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'done'>(() => shouldPlaySiteIntro() ? 'intro' : 'done');
  const played = useRef(phase !== 'done');
  const reveal = useCallback(() => {
    useNavStore.getState().recordScroll('home', 0);
    setPhase(current => current === 'intro' ? 'reveal' : current);
  }, []);
  const finish = useCallback(() => {
    useNavStore.getState().recordScroll('home', 0);
    rememberSiteIntro();
    setPhase('done');
  }, []);

  useEffect(() => {
    if (phase !== 'done' || !played.current) return;
    const frame = requestAnimationFrame(() => {
      const main = document.querySelector<HTMLElement>('#main-content');
      if (main) focusPageHeading(main);
    });
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  return <>
    {phase !== 'intro' && <div className="entry-app" data-entry-phase={phase} inert={phase !== 'done'} aria-hidden={phase !== 'done'}>{children}</div>}
    {phase !== 'done' && <SiteIntro reveal={reveal} finish={finish} morphing={phase === 'reveal'} />}
  </>;
}
