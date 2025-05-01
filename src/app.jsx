import './index.css'
import { Router } from 'preact-router'
import Home from './pages/Home'
import Exam from './pages/Exam'
import Result from './pages/Result'
import Config from './pages/Config'
import UploadPage from './pages/Upload'

export function App() {
  return (
    <>
      <Router>
        <Home path="/" />
        <Exam path="/exam" />
        <Result path="/result" />
        <Config path="/config" />
        <UploadPage path="/upload" />
      </Router>
    </>
  )
}
