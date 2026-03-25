import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

type Route = { type: 'projects' } | { type: 'project'; projectId: string };

function App() {
  const [route, setRoute] = useState<Route>({ type: 'projects' });

  const navigateToProjects = () => {
    setRoute({ type: 'projects' });
  };

  const navigateToProject = (projectId: string) => {
    setRoute({ type: 'project', projectId });
  };

  const selectedProjectId =
    route.type === 'project' ? route.projectId : undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors />
      <AppLayout
        selectedProjectId={selectedProjectId}
        onProjectSelect={navigateToProject}
      >
        {route.type === 'projects' ? (
          <ProjectsPage onProjectSelect={navigateToProject} />
        ) : (
          <ProjectDetailPage
            projectId={route.projectId}
            onBack={navigateToProjects}
          />
        )}
      </AppLayout>
    </QueryClientProvider>
  );
}

export default App;