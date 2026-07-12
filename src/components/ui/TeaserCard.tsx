import { Lock } from 'lucide-react';
import { Tag } from './Tag';
import { ProjectPopover } from './ProjectPopover';
import type { Project } from '../../types';
export function TeaserCard({project}:{project:Project}) {
  return (
    <ProjectPopover project={project} locked>
      <div style={{background:'var(--sp-dark2)',borderRadius:'var(--radius-md)',padding:16,position:'relative',opacity:0.65}}>
        <div className={`grad-${project.gradient}`} style={{width:'100%',paddingBottom:'100%',borderRadius:'var(--radius-sm)',position:'relative',marginBottom:14,overflow:'hidden',filter:'grayscale(0.4)'}}>
          <img
            src={project.image}
            alt={project.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div style={{position:'absolute',bottom:8,right:8,width:36,height:36,background:'rgba(0,0,0,.55)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
            <Lock size={14} color="var(--sp-gray)"/>
          </div>
        </div>
        <div style={{fontSize:14,fontWeight:700,color:'var(--sp-gray)',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{project.title}</div>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}><Tag>Coming soon</Tag></div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{project.tags.map(t=><Tag key={t}>{t}</Tag>)}</div>
      </div>
    </ProjectPopover>
  );
}