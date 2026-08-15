import { createBrowserRouter } from 'react-router-dom';
import { AttackInference } from './pages/AttackInference';
import { CaseSelection } from './pages/CaseSelection';
import { Dashboard } from './pages/Dashboard';
import { EvidenceSelection } from './pages/EvidenceSelection';
import { Home } from './pages/Home';
import { Results } from './pages/Results';
import { ExerciseModeSelection } from './pages/ExerciseModeSelection';
import { KillChainExercise } from './pages/KillChainExercise';
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
    path: '/exercise/:caseId/evidence',
    element: <EvidenceSelection />,
  },
  {
    path: '/exercise/:caseId',
    element: <TimelineExercise />,
  },
  {
    path: '/exercise/:caseId/kill-chain',
    element: <KillChainExercise />,
  },
  {
    path: '/exercise/:caseId/attack-inference',
    element: <AttackInference />,
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