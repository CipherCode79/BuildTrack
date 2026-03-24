import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { BuildingsPage } from './pages/BuildingsPage';
import { ContractorsPage } from './pages/ContractorsPage';
import { DocumentsWizardPage } from './pages/DocumentsWizardPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/documents" replace />} />
        <Route path="/documents" element={<DocumentsWizardPage />} />
        <Route path="/contractors" element={<ContractorsPage />} />
        <Route path="/buildings" element={<BuildingsPage />} />
        <Route path="/work-orders" element={<WorkOrdersPage />} />
      </Routes>
    </Layout>
  );
}
