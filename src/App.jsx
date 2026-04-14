import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Cadastro from './pages/Cadastro'
import Upload from './pages/Upload'
import Diagnostico from './pages/Diagnostico'
import Upgrade from './pages/Upgrade'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cadastro />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/diagnostico" element={<Diagnostico />} />
        <Route path="/upgrade" element={<Upgrade />} />
      </Routes>
    </BrowserRouter>
  )
}
