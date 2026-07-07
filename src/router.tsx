import { createBrowserRouter } from 'react-router-dom';
import { CaseSelection } from './pages/CaseSelection';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Results } from './pages/Results';
import { ExerciseModeSelection } from './pages/ExerciseModeSelection';
import { TimelineExercise } from './pages/TimelineExercise';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/cases',
    element: <CaseSelection />,
  },
  {
    path: '/exercise/:caseId/mode',
    element: <ExerciseModeSelection />,
  },
  {
    path: '/exercise/:caseId',
    element: <TimelineExercise />,
  },
  {
    path: '/results',
    element: <Results />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
]);
