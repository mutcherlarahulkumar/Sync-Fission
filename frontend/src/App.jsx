import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import ClassRoomTutor from './pages/ClassRoomTutor'
import ClassRoomStudent from './pages/ClassRoomStudent'
import TutorAnnouncement from './pages/TutorAnnouncement'
import StudentAnnouncement from './pages/StudentAnnouncement'
import ViewParticipants from './pages/ViewParticipants'
import TutorResources from './pages/TutorResources'
import StudentResources from './pages/StudentResources'
import ViewParticipantsStudent from './pages/ViewParticipantsStudent'
import TutorAssignment from './pages/TutorAssignment'
import StudentAssignment from './pages/StudentAssignment'
import DoubtTutor from './pages/DoubtTutor'
import DoubtStudent from './pages/DoubtStudent'
import DoubtDiscussionPage from './pages/DoubtDiscussionPage'
import DoubtDiscussionPageTutor from './pages/DoubtDiscussionPageTutor'
import AIAssistant from './components/AIAssistant'
import Navbar from './components/Navbar'

function App() {
    return (
        <div className='bg-[#03040e] min-h-screen'>
            <Router>
                <Navbar />
                <AIAssistant />
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/signup' element={<Signup />} />
                    <Route path='/signin' element={<Signin />} />
                    <Route path='/student-dashboard' element={<StudentDashboard />} />
                    <Route path='/tutor-dashboard' element={<TeacherDashboard />} />
                    <Route path='/classroom-tutor' element={<ClassRoomTutor />} />
                    <Route path='/classroom-student' element={<ClassRoomStudent />} />
                    <Route path='/tutor-announcement' element={<TutorAnnouncement />} />
                    <Route path='/student-announcement' element={<StudentAnnouncement />} />
                    <Route path='/view-participants' element={<ViewParticipants />} />
                    <Route path='/tutor-resources' element={<TutorResources />} />
                    <Route path='/student-resources' element={<StudentResources />} />
                    <Route path='/view-participants-student' element={<ViewParticipantsStudent />} />
                    <Route path='/tutor-assignment' element={<TutorAssignment />} />
                    <Route path='/student-assignment' element={<StudentAssignment />} />
                    <Route path='/doubt-tutor' element={<DoubtTutor />} />
                    <Route path='/doubt-student' element={<DoubtStudent />} />
                    <Route path='/doubt-discussion' element={<DoubtDiscussionPage />} />
                    <Route path='/doubt-discussion-tutor' element={<DoubtDiscussionPageTutor />} />
                </Routes>
            </Router>
        </div>
    )
}

export default App
