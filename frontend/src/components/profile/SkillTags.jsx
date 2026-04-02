export function SkillTags({ skills = [] }) {
  if (!skills || skills.length === 0) {
    return (
      <p className="text-slate-600 text-sm">
        No skills listed
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold text-slate-700 bg-gradient-to-r from-sky-100 to-indigo-100 ring-1 ring-sky-200/70 shadow-sm"
        >
          {skill}
        </span>
      ))}
    </div>
  )
}
