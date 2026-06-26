import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

type TeamType = 'innovare_team' | 'rocket_team';

export function useProtectedRoute(allowedTeams: TeamType[]) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setLocation('/login');
      return;
    }

    const userTeamType = (user as any).teamType as TeamType;
    if (!allowedTeams.includes(userTeamType)) {
      setLocation('/');
    }
  }, [user, loading, allowedTeams, setLocation]);

  return { user, loading };
}
