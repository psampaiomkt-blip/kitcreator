import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Cadastro from './pages/Cadastro'
import Upload from './pages/Upload'
import Diagnostico from './pages/Diagnostico'
import Upgrade from './pages/Upgrade'
import Completo from './pages/Completo'
import Privacidade from './pages/Privacidade'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cadastro />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/diagnostico" element={<Diagnostico />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/completo" element={<Completo />} />
        <Route path="/privacidade" element={<Privacidade />} />
      </Routes>
    </BrowserRouter>
  )
}
