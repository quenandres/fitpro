import { ROUTES } from '../routes/paths';

export type CommunityBackTarget = {
  to: string;
  label: string;
};

/** Rutas hoja dentro de una comunidad: el volver vive en la página, no en el layout. */
export function isCommunityLeafRoute(pathname: string, communityId: string): boolean {
  const base = `/communities/${communityId}`;

  if (pathname === `${base}/posts/create`) return true;
  if (pathname === `${base}/events/create`) return true;
  if (new RegExp(`^${base}/posts/[^/]+$`).test(pathname)) return true;
  if (new RegExp(`^${base}/events/[^/]+/participants$`).test(pathname)) return true;
  if (new RegExp(`^${base}/events/[^/]+$`).test(pathname)) return true;
  if (new RegExp(`^${base}/discussions/[^/]+$`).test(pathname)) return true;

  return false;
}

function communityHomePath(communityId: string) {
  return ROUTES.communities.home(communityId);
}

export function getCommunityExploreBack(): CommunityBackTarget {
  return {
    to: ROUTES.communities.root,
    label: 'Volver a explorar',
  };
}

export function getCommunityHomeBack(communityId: string): CommunityBackTarget {
  return {
    to: communityHomePath(communityId),
    label: 'Volver a la comunidad',
  };
}

/** Volver del shell de comunidad: home → explorar; resto de tabs → home. */
export function resolveCommunityLayoutBack(
  pathname: string,
  communityId: string,
): CommunityBackTarget | null {
  if (isCommunityLeafRoute(pathname, communityId)) return null;

  const base = `/communities/${communityId}`;
  const isHome =
    pathname === base
    || pathname === `${base}/`
    || pathname === `${base}/home`;

  return isHome ? getCommunityExploreBack() : getCommunityHomeBack(communityId);
}

export function getCommunityPostsBack(communityId: string): CommunityBackTarget {
  return {
    to: ROUTES.communities.posts(communityId),
    label: 'Volver a publicaciones',
  };
}

export function getCommunityEventsBack(communityId: string): CommunityBackTarget {
  return {
    to: ROUTES.communities.events(communityId),
    label: 'Volver a eventos',
  };
}

export function getCommunityDiscussionsBack(communityId: string): CommunityBackTarget {
  return {
    to: ROUTES.communities.discussions(communityId),
    label: 'Volver a discusiones',
  };
}

export function getCommunityEventBack(communityId: string, eventId: string): CommunityBackTarget {
  return {
    to: ROUTES.communities.event(communityId, eventId),
    label: 'Volver al evento',
  };
}

/** Pantallas del módulo fuera de una comunidad concreta. */
export function getCommunitiesModuleBack(pathname: string): CommunityBackTarget | null {
  if (pathname === ROUTES.communities.create) {
    return getCommunityExploreBack();
  }
  if (pathname === ROUTES.communities.invitations) {
    return getCommunityExploreBack();
  }
  return null;
}
