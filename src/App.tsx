import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { PlansPage } from '@/pages/PlansPage';
import { RecipesPage } from '@/pages/RecipesPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
