import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { PostCard } from '../../components/communities/cards/PostCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Fab } from '../../components/common/Fab';
import { ROUTES } from '../../routes/paths';
import { useCommunityPosts } from '../../store/useCommunitiesStore';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import type { TipoPost } from '../../types/community';

const PAGE_SIZE = 5;

const FILTROS: Array<{ key: TipoPost | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'anuncio', label: 'Anuncios' },
  { key: 'logro', label: 'Logros' },
  { key: 'pregunta', label: 'Preguntas' },
  { key: 'general', label: 'General' },
];

export function CommunityPostsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const posts = useCommunityPosts(id);
  const { puedeParticipar } = useCommunityPermissions(id ?? '');
  const [filtro, setFiltro] = useState<TipoPost | 'todos'>('todos');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const list = filtro === 'todos' ? posts : posts.filter((p) => p.tipo === filtro);
    return [...list].sort((a, b) => {
      if (a.fijado !== b.fijado) return a.fijado ? -1 : 1;
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
  }, [posts, filtro]);

  const handleFiltroChange = (next: TipoPost | 'todos') => {
    setFiltro(next);
    setVisibleCount(PAGE_SIZE);
  };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Publicaciones
        </h1>
        {puedeParticipar ? (
          <Link
            to={ROUTES.communities.postCreate(id ?? '')}
            className="hidden md:inline-flex fp-btn text-sm items-center gap-2"
            style={{ background: 'var(--accent-pink)', color: '#fff' }}
          >
            <Plus size={15} />
            Publicar
          </Link>
        ) : null}
      </div>

      <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {FILTROS.map((f) => (
          <button
            key={f.key}
            type="button"
            className="fp-com-tab"
            style={filtro === f.key ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' } : undefined}
            onClick={() => handleFiltroChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Aún no hay publicaciones" description="Sé el primero en compartir algo con la comunidad." />
      ) : (
        <div className="fp-com-feed">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {visibleCount < filtered.length ? <div ref={sentinelRef} style={{ height: 1 }} /> : null}
        </div>
      )}

      {puedeParticipar ? (
        <div className="md:hidden">
          <Fab
            ariaLabel="Nueva publicación"
            icon={Plus}
            onClick={() => navigate(ROUTES.communities.postCreate(id ?? ''))}
            accent="var(--accent-pink)"
          />
        </div>
      ) : null}
    </div>
  );
}
