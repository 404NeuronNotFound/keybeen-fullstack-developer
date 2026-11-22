import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowUpRight, Code2, X } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { TOOL_BRANDS } from '../../constants/toolBrands';
import { skills } from '../../data';
import { getSkillProjects } from '../../utils/skillEvidence';
import { createSkillSphere, getSkillSphereLayout, projectSkillSphere, rotateSkillSphere } from '../../utils/skillSphere';
import { useProjectReaderStore } from '../../store';
import '../../styles/skill-orbit.css';

gsap.registerPlugin(useGSAP);

const stack = Object.entries(skills).flatMap(([category, items]) => items.map(skill => ({
  ...skill, category, project: getSkillProjects(skill.name)[0],
})));
const points = createSkillSphere(stack.length);
// Trace in the photo's original coordinate system. SVG's slice sizing follows
// the background's object-fit: cover, keeping the person aligned on every screen.
const personOutline = 'M 794 480 Q 802 474 813 477 L 824 485 Q 840 481 853 486 L 862 486 Q 871 488 880 502 L 892 505 Q 908 506 921 528 L 951 559 Q 969 575 965 586 Q 963 596 951 594 L 922 578 L 900 554 L 904 622 Q 904 645 910 660 L 926 668 Q 947 690 962 714 Q 974 729 968 751 Q 964 770 944 776 Q 907 785 850 781 L 800 781 L 796 799 L 805 826 Q 811 837 804 848 Q 780 860 745 859 Q 726 858 716 846 Q 709 833 718 823 L 730 814 L 728 784 Q 723 760 730 734 L 730 695 Q 724 679 731 654 Q 737 636 752 629 L 770 626 L 772 583 L 751 601 Q 738 613 724 614 Q 711 615 706 603 Q 704 590 719 572 L 742 548 L 757 527 Q 767 513 780 503 L 787 490 Q 789 483 794 480 Z';

export function SkillOrbitScene() {
  const root = useRef<HTMLElement>(null);
  const [photoSource, setPhotoSource] = useState('/images/skills-dock-wide.jpg');
  const openProject = useProjectReaderStore(state => state.openProject);

  useGSAP(() => {
    const scene = root.current;
    if (!scene) return;
    const anchors = gsap.utils.toArray<HTMLElement>('.skill-orbit-anchor', scene);
    const setters = anchors.map(element => ({
      x: gsap.quickSetter(element, 'x', 'px'), y: gsap.quickSetter(element, 'y', 'px'),
      scale: gsap.quickSetter(element, 'scale'), opacity: gsap.quickSetter(element, 'opacity'),
      zIndex: gsap.quickSetter(element, 'zIndex'),
    }));
    gsap.set(anchors, { left: 0, top: 0, xPercent: -50, yPercent: -50 });
    let width = scene.clientWidth, height = scene.clientHeight;
    let visible = true, hovered = -1, focused = -1;
    const rotation = { angle: 0 };
    const pointer = { yaw: 0, pitch: 0 };
    const paint = () => {
      const { centerX, centerY, radiusX, radiusY } = getSkillSphereLayout(width, height);
      points.forEach((point, index) => {
        const projected = projectSkillSphere(point, rotation.angle, -0.1 + pointer.pitch, pointer.yaw);
        const selected = index === focused || index === hovered;
        const set = setters[index];
        set.x(centerX + projected.x * radiusX); set.y(centerY + projected.y * radiusY);
        set.scale(selected ? Math.max(1.12, projected.scale) : projected.scale);
        set.opacity(selected ? 1 : projected.opacity);
        set.zIndex(projected.layer);
      });
    };
    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
      const motion = context.conditions!.motion;
      const spin = motion ? gsap.to(rotation, { angle: Math.PI * 2, duration: 70, repeat: -1, ease: 'none', onUpdate: paint }) : null;
      const yawTo = motion ? gsap.quickTo(pointer, 'yaw', { duration: 1.4, ease: 'power3.out', onUpdate: paint }) : null;
      const pitchTo = motion ? gsap.quickTo(pointer, 'pitch', { duration: 1.4, ease: 'power3.out', onUpdate: paint }) : null;
      const sync = () => { spin?.paused(!visible || document.hidden || hovered >= 0 || focused >= 0); };
      const measure = () => { width = scene.clientWidth; height = scene.clientHeight; paint(); };
      let bounds = scene.getBoundingClientRect();
      const locate = () => { bounds = scene.getBoundingClientRect(); };
      const cardIndex = (target: EventTarget | null) => target instanceof Element ? anchors.indexOf(target.closest<HTMLElement>('.skill-orbit-anchor')!) : -1;
      const onMove = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        hovered = cardIndex(event.target);
        if (hovered < 0 && focused < 0) {
          yawTo?.(((event.clientX - bounds.left) / width - 0.5) * 0.45);
          pitchTo?.(((event.clientY - bounds.top) / height - 0.5) * 0.22);
        }
        sync(); paint();
      };
      const onLeave = () => { hovered = -1; yawTo?.(0); pitchTo?.(0); sync(); paint(); };
      const onFocus = (event: FocusEvent) => {
        focused = cardIndex(event.target);
        if (focused >= 0 && event.target instanceof HTMLElement && event.target.matches(':focus-visible')) {
          // Turn a keyboard-selected tool toward the viewer without overriding its depth.
          const point = rotateSkillSphere(points[focused], rotation.angle);
          const desired = Math.atan2(-point.x, point.z);
          const delta = Math.atan2(Math.sin(desired - pointer.yaw), Math.cos(desired - pointer.yaw));
          if (yawTo) yawTo(pointer.yaw + delta);
          else pointer.yaw += delta;
          if (pitchTo) pitchTo(0.1);
          else pointer.pitch = 0.1;
        }
        sync(); paint();
      };
      const onBlur = (event: FocusEvent) => { focused = cardIndex(event.relatedTarget); sync(); paint(); };
      const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
      observer.observe(scene);
      const resize = new ResizeObserver(() => { measure(); locate(); });
      resize.observe(scene);
      const scroller = scene.closest('.app-content');
      scroller?.addEventListener('scroll', locate, { passive: true });
      scene.addEventListener('pointerenter', locate);
      scene.addEventListener('pointermove', onMove);
      scene.addEventListener('pointerleave', onLeave);
      scene.addEventListener('focusin', onFocus);
      scene.addEventListener('focusout', onBlur);
      document.addEventListener('visibilitychange', sync);
      measure(); sync();
      return () => {
        observer.disconnect(); resize.disconnect();
        scroller?.removeEventListener('scroll', locate);
        scene.removeEventListener('pointerenter', locate);
        scene.removeEventListener('pointermove', onMove);
        scene.removeEventListener('pointerleave', onLeave);
        scene.removeEventListener('focusin', onFocus);
        scene.removeEventListener('focusout', onBlur);
        document.removeEventListener('visibilitychange', sync);
      };
    });
    return () => media.revert();
  }, { scope: root });

  return <section ref={root} className="skill-orbit-scene" aria-labelledby="skills-sphere-title">
    <img className="skill-orbit-photo" src="/images/skills-dock-wide.jpg" srcSet="/images/skills-dock-960.jpg 960w, /images/skills-dock-wide.jpg 1672w" sizes="(max-width: 768px) 100vw, calc(100vw - 260px)" alt="Keybeen sitting on a wooden dock beside a quiet lake" width="1672" height="941" fetchPriority="high" decoding="async" onLoad={event => setPhotoSource(event.currentTarget.currentSrc)} />
    <div className="skill-orbit-shade" aria-hidden="true" />
    <header className="skill-orbit-intro">
      <p className="skill-orbit-eyebrow"><Code2 size={14} aria-hidden="true" />My working toolkit</p>
      <h1 id="skills-sphere-title">Tools of the trade<span>.</span></h1>
      <p className="skill-orbit-description">The tools I reach for, with projects to show how I use them.</p>
    </header>
    <div className="skill-orbit-cards" role="group" aria-label={`All ${stack.length} skills`}>
      {stack.map((skill, index) => {
        const brand = TOOL_BRANDS[skill.name];
        const Icon = brand.icon;
        const point = projectSkillSphere(points[index], 0);
        return <div key={skill.name} className="skill-orbit-anchor" style={{ left: `${50 + point.x * 20}%`, top: `${69 + point.y * 20}%`, zIndex: point.layer, '--skill-color': brand.color, '--skill-surface': brand.surface } as CSSProperties}>
          <button type="button" className="skill-orbit-card" title={`${skill.name} · ${skill.description}`} aria-label={skill.project ? `See ${skill.name} in ${skill.project.shortTitle}` : `${skill.name}: ${skill.description}`} aria-haspopup={skill.project ? 'dialog' : undefined} aria-controls={skill.project ? 'project-overview' : undefined} popoverTarget={skill.project ? undefined : `skill-info-${index}`} onClick={() => { if (skill.project) openProject(skill.project); }}>
            <span className="skill-orbit-art" aria-hidden="true"><span className="skill-orbit-icon"><Icon /></span></span>
            <span className="skill-orbit-name">{skill.name}</span>
            <span className="skill-orbit-category">{skill.category === 'DevTools' ? 'Dev tools' : skill.category}<ArrowUpRight size={9} aria-hidden="true" /></span>
          </button>
        </div>;
      })}
    </div>
    <svg className="skill-orbit-person" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs><clipPath id="skills-person-silhouette"><path d={personOutline} /></clipPath></defs>
      <image href={photoSource} width="1672" height="941" preserveAspectRatio="none" clipPath="url(#skills-person-silhouette)" />
    </svg>
    {stack.map((skill, index) => !skill.project && <div key={skill.name} id={`skill-info-${index}`} popover="auto" className="skill-orbit-detail">
      <button type="button" popoverTarget={`skill-info-${index}`} popoverTargetAction="hide" aria-label={`Close ${skill.name} details`}><X size={18} /></button>
      <h2>{skill.name}</h2><p>{skill.description}</p>
    </div>)}
  </section>;
}
