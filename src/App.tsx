import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { PlansPage } from '@/pages/PlansPage';
import { RecipesPage } from '@/pages/RecipesPage';
import { ToTryPage } from '@/pages/ToTryPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/to-try" element={<ToTryPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
