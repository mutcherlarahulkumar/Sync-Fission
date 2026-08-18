import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
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
import RequireAuth from './components/RequireAuth'

// Registers the axios interceptor that signs you out on an expired token.
import './api'

const tutor = (element) => <RequireAuth role="tutor">{element}</RequireAuth>
const student = (element) => <RequireAuth role="student">{element}</RequireAuth>

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

                    <Route path='/student-dashboard' element={student(<StudentDashboard />)} />
                    <Route path='/classroom-student' element={student(<ClassRoomStudent />)} />
                    <Route path='/student-announcement' element={student(<StudentAnnouncement />)} />
                    <Route path='/student-resources' element={student(<StudentResources />)} />
                    <Route path='/view-participants-student' element={student(<ViewParticipantsStudent />)} />
                    <Route path='/student-assignment' element={student(<StudentAssignment />)} />
                    <Route path='/doubt-student' element={student(<DoubtStudent />)} />
                    <Route path='/doubt-discussion' element={student(<DoubtDiscussionPage />)} />

                    <Route path='/tutor-dashboard' element={tutor(<TeacherDashboard />)} />
                    <Route path='/classroom-tutor' element={tutor(<ClassRoomTutor />)} />
                    <Route path='/tutor-announcement' element={tutor(<TutorAnnouncement />)} />
                    <Route path='/view-participants' element={tutor(<ViewParticipants />)} />
                    <Route path='/tutor-resources' element={tutor(<TutorResources />)} />
                    <Route path='/tutor-assignment' element={tutor(<TutorAssignment />)} />
                    <Route path='/doubt-tutor' element={tutor(<DoubtTutor />)} />
                    <Route path='/doubt-discussion-tutor' element={tutor(<DoubtDiscussionPageTutor />)} />

                    {/* Anything else goes home rather than rendering a blank page. */}
                    <Route path='*' element={<Navigate to='/' replace />} />
                </Routes>
            </Router>
        </div>
    )
}

export default App
