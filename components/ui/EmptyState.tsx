interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-10 px-6">
      <div className="text-[36px] mb-[10px]">{icon}</div>
      <div className="text-[14px] font-semibold mb-[6px]" style={{ color: 'var(--text)' }}>
        {title}
      </div>
      {description && (
        <div className="text-[12px] mb-4" style={{ color: 'var(--muted2)' }}>
          {description}
        </div>
      )}
      {action}
    </div>
  )
}
