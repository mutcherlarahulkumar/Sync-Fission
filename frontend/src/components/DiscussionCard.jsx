import React from 'react';

export default function DiscussionCard({ discussion }) {
    const studentName = discussion.first_name
        ? `${discussion.first_name} ${discussion.last_name}`
        : 'Student';

    return (
        <div className="bg-gray-700 rounded-lg shadow-sm p-4">
            <p className="text-sm text-white">{discussion.reply}</p>
            <p className="text-gray-400 text-xs mt-2">
                — {studentName}
            </p>
        </div>
    );
}
