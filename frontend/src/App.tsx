import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

// Simple router state
type Route = 
  | { type: 'projects' }
  | { type: 'project'; projectId: string };

function App() {
  const [route, setRoute] = useState<Route>({ type: 'projects' });

  const navigateToProjects = () => {
    setRoute({ type: 'projects' });
  };

  const navigateToProject = (projectId: string) => {
    setRoute({ type: 'project', projectId });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors />
      {route.type === 'projects' ? (
        <ProjectsPage onProjectSelect={navigateToProject} />
      ) : (
        <ProjectDetailPage
          projectId={route.projectId}
          onBack={navigateToProjects}
        />
      )}
    </QueryClientProvider>
  );
}

export default App;
