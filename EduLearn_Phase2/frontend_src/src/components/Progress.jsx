function Progress() {
  const stats = [
    { label: 'Courses Enrolled',  value: 6,    color: 'bg-blue-500'   },
    { label: 'Completed',         value: 2,    color: 'bg-green-500'  },
    { label: 'In Progress',       value: 3,    color: 'bg-yellow-500' },
    { label: 'Average Progress',  value: '47%', color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overall Progress</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col items-center text-center"
          >
            <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mb-3`}>
              <span className="text-white font-bold text-sm">{value}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Progress;
