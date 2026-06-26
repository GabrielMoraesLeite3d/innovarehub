import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect, ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';

interface ProtectedDashboardLayoutProps {
  children: ReactNode;
  allowedTeams: ('innovare_team' | 'rocket_team')[];
}

export default function ProtectedDashboardLayout({
  children,
  allowedTeams,
}: ProtectedDashboardLayoutProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setLocation('/login');
      return;
    }

    const userTeamType = (user as any).teamType as 'innovare_team' | 'rocket_team';
    if (!allowedTeams.includes(userTeamType)) {
      // Rocket team só pode acessar Rocket
      if (userTeamType === 'rocket_team') {
        setLocation('/rocket');
      } else {
        setLocation('/');
      }
    }
  }, [user, loading, allowedTeams, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userTeamType = (user as any).teamType as 'innovare_team' | 'rocket_team';
  if (!allowedTeams.includes(userTeamType)) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
