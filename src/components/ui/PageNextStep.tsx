import { ArrowRight } from 'lucide-react';
import { useNavStore } from '../../store';
import type { SectionId } from '../../types';

export function PageNextStep({ title, description, page, label }: { title: string; description: string; page: SectionId; label: string }) {
  const navigate = useNavStore(state => state.navigate);
  return <section className="page-next-step">
    <div><h2>{title}</h2><p>{description}</p></div>
    <button className="project-reader-button" onClick={() => navigate(page)}>{label}<ArrowRight size={16} aria-hidden="true" /></button>
  </section>;
}
