export type TabKey = "resumen" | "notas" | "sesiones" | "avances" | "tareas";

interface TabDef {
  key: TabKey;
  label: string;
  count: string;
}

interface PatientTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  notesCount: number;
  sessionsCount: number;
  objectivesCompleted: number;
  objectivesTotal: number;
  tasksPending: number;
  tasksTotal: number;
}

export default function PatientTabs({
  activeTab,
  onTabChange,
  notesCount,
  sessionsCount,
  objectivesCompleted,
  objectivesTotal,
  tasksPending,
  tasksTotal,
}: PatientTabsProps) {
  const tabs: TabDef[] = [
    { key: "resumen", label: "Resumen", count: "" },
    { key: "notas", label: "Notas", count: `${notesCount}` },
    { key: "sesiones", label: "Sesiones", count: `${sessionsCount}` },
    { key: "avances", label: "Avances", count: objectivesTotal > 0 ? `${objectivesCompleted}/${objectivesTotal}` : "0" },
    { key: "tareas", label: "Tareas", count: tasksTotal > 0 ? `${tasksPending} pend.` : "0" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-x-auto">
      <div className="flex min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "text-green border-b-2 border-green font-semibold"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {tab.count && (
              <span className={`ml-1.5 ${activeTab === tab.key ? "text-green" : "text-gray-300"}`}>
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
