import { useState } from 'react';

function Courses() {
  const [courses] = useState([
    { id: 1, name: 'Internet Programming',          progress: 60 },
    { id: 2, name: 'Operating System',              progress: 80 },
    { id: 3, name: 'Analysis of Algorithm',         progress: 20 },
    { id: 4, name: 'Database Systems',              progress: 30 },
    { id: 5, name: 'Cryptography',                  progress: 50 },
    { id: 6, name: 'Object Oriented Programming',   progress: 40 },
  ]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 capitalize">
              {course.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Progress: {course.progress}%
            </p>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;
