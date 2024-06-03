import tutorandstudentimage from '../assets/both.png'
import studentimage from '../assets/students.jpg'
import tutorimage from '../assets/tutor.png'
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
  return (
    <div className='bg-[#03040e]'>
        <div className='bg-gray-300 flex rounded-full'>
            <div className='bg-[#03040e] text-white w-1/2 h-screen'>
                <div className="flex flex-col  justify-center h-full pr-3 ml-6">
                    <div className="font-bold text-6xl addgradiant pb-5">
                        Empower Your Learning Journey
                    </div>
                    <div className="my-4 text-gray-500">
                        Our educational platform provides a seamless experience for
                        both tutors and students, enabling personalized learning and
                        collaborative growth.
                    </div>
                    <div className="w-full flex">
                        <button type="button" className="text-white bg-[#5b21b6] hover:bg-[#6b46c1] focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-9 py-2.5 me-2 mb-2 " onClick={()=>{navigate('/signup',{state:{role:'tutor'}})}}>Tutor Sign Up</button>
                        <button type="button" className="text-white  border border-[#5b21b6] focus:outline-none hover:bg-[#6b46c1] focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-9 py-2.5 me-2 mb-2 " onClick={()=>{navigate('/signup',{state:{role:'student'}})}}>Student Sign Up</button>
                    </div>
                </div>
            </div>
            <div className='w-1/2'>
                <img src={tutorandstudentimage} alt="teacher and student" className='h-full tilttheimage' />
            </div>
        </div>
        <div className='pt-12'>
        <div className='flex pt-10'>
            <img src={tutorimage} alt="teacher" className='h-5/6 w-1/2 rounded-2xl m-9 p-2  light-on-hover'/>
            <div className='bg-[#03040e] text-white w-1/2 h-screen flex flex-col  justify-center p-12 mr-2'>
                <div className='font-bold text-6xl addgradiantsign pb-6'>Tutor Sign In</div>
                <div className='text-gray-500 mt-4'>Seamlessly access your teaching dashboard and connect with your students.</div>
                <button type="button" className="text-white bg-[#5b21b6] hover:bg-[#6b46c1] focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm  py-2.5 me-2 mt-6 " onClick={()=>{
                    navigate('/signin',{state:{role:'tutor'}});
                }}>Tutor Sign In</button>
            </div>
        </div>
    </div>
        <div className='pt-12'>
            <div className='flex pt-10'>
                <div className='bg-[#03040e] text-white w-1/2 h-screen flex flex-col  justify-center p-10'>
                    <div className='font-bold text-6xl addgradiantsign pb-6'>Student Sign In</div>
                    <div className='text-gray-500 mt-4'>Access your personalized learning dashboard and engage with your teachers and peers.</div>
                    <button type="button" className="text-white bg-[#5b21b6] hover:bg-[#6b46c1] focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm py-2.5 me-2 mt-6" onClick={()=>{
                    navigate('/signin',{state:{role:'student'}});
                }}>Student Sign In</button>
                </div>
                <img src={studentimage} alt="student" className='h-5/6 w-1/2 rounded-2xl m-12 p-1 light-on-hover'/>
            </div>
        </div>

    </div>
  )
}