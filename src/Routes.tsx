import { createBrowserRouter } from 'react-router-dom';

import App from './routes/App.tsx';
import DataSource from './routes/datasources/DataSource.tsx';
import ErrorPage from './ErrorPage.tsx';
import RiskLevels from './routes/risklevels/RiskLevels.tsx';
import { LastUpdate } from './routes/lastupdate/LastUpdate.tsx';
import Learn from './routes/learn/Learn.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'datasource/:sourceName',
        element: <DataSource />
      },
      {
        path: 'risklevels/:pair?',
        element: <RiskLevels />
      },
      {
        path: 'lastupdate',
        element: <LastUpdate />
      },
      {
        path: 'learn',
        element: <Learn />
      }
    ]
  }
]);

export default router;
