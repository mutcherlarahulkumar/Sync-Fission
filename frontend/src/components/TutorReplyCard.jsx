export default function TutorReplyCard({ reply }) {
    return (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-3">
            <p className="text-white text-sm">{reply}</p>
            <p className="text-green-400 text-xs mt-2 font-medium">✓ Tutor's Answer</p>
        </div>
    );
}
