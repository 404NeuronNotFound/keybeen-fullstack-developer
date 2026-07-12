import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import type { Project } from '../../types';
import { Tag } from './Tag';
import { ProjectPopover } from './ProjectPopover';
interface Props { project:Project; onPlay:(p:Project)=>void; isPlaying:boolean; isCurrent:boolean; }
export function ProjectCard({project,onPlay,isPlaying,isCurrent}:Props) {
  const [hov,setHov]=useState(false);
  const showPlay=hov||(isCurrent&&isPlaying);
  return (
    <ProjectPopover project={project} onPlay={onPlay}>
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onPlay(project)}
        style={{background:hov?'var(--sp-dark3)':'var(--sp-dark2)',borderRadius:'var(--radius-md)',padding:16,cursor:'pointer',transition:'background .2s',position:'relative'}}>
        <div className={`grad-${project.gradient}`} style={{width:'100%',paddingBottom:'100%',borderRadius:'var(--radius-sm)',position:'relative',marginBottom:14,overflow:'hidden'}}>
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
          <button onClick={(e)=>{e.stopPropagation();onPlay(project);}} aria-label={`Play ${project.title}`}
            style={{position:'absolute',bottom:8,right:8,width:40,height:40,background:'var(--sp-green)',border:'none',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',opacity:showPlay?1:0,transform:showPlay?'translateY(0)':'translateY(8px)',transition:'opacity .2s,transform .2s',color:'#000'}}>
            {isCurrent&&isPlaying?<Pause size={16} fill="#000" color="#000"/>:<Play size={16} fill="#000" color="#000" style={{marginLeft:1}}/>}
          </button>
        </div>
        <div style={{fontSize:14,fontWeight:700,color:isCurrent?'var(--sp-green)':'var(--sp-white)',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{project.title}</div>
        <div style={{fontSize:12,color:'var(--sp-gray)',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',marginBottom:8}}>{project.description}</div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{project.tags.map(t=><Tag key={t}>{t}</Tag>)}</div>
      </div>
    </ProjectPopover>
  );
}