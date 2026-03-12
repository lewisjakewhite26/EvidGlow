import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import SubjectsPage from './pages/SubjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<SubjectsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
