import './index.css'
import { Router } from 'preact-router'
import { useEffect } from 'preact/hooks'
import Home from './pages/Home'
import Exam from './pages/Exam'
import ExamVer2 from './pages/Exam_model_2'
import Result from './pages/Result'
import Config from './pages/Config'
import UploadPage from './pages/Upload'
import Feedback from './pages/Feedback'

export function App() {
  // useEffect(() => {
  //   const handleCopy = (e) => e.preventDefault();
  //   const handleCut = (e) => e.preventDefault();
  //   const handleContextMenu = (e) => e.preventDefault();

  //   document.addEventListener('copy', handleCopy);
  //   document.addEventListener('cut', handleCut);
  //   document.addEventListener('contextmenu', handleContextMenu);

  //   return () => {
  //     document.removeEventListener('copy', handleCopy);
  //     document.removeEventListener('cut', handleCut);
  //     document.removeEventListener('contextmenu', handleContextMenu);
  //   };
  // }, []);
  return (
    <>
      <Router>
        <Home path="/" />
        <Exam path="/exam" />
        <ExamVer2 path="/exam/ver2" />
        <Result path="/result" />
        <Config path="/config" />
        <UploadPage path="/upload" />
        <Feedback path="/feedback" />
      </Router>
    </>
  )
}
