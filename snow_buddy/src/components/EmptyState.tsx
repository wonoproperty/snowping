import { ReactNode } from 'react';
import { Users, MapPin, Snowflake } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'users' | 'map' | 'snowflake' | ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  users: Users,
  map: MapPin,
  snowflake: Snowflake,
};

export function EmptyState({ icon = 'users', title, description, action }: EmptyStateProps) {
  const IconComponent = typeof icon === 'string' ? icons[icon] : null;

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto mb-6">
          {IconComponent ? (
            <IconComponent className="w-10 h-10 text-slate-400" />
          ) : (
            icon
          )}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
          {title}
        </h3>
        
        <p className="text-slate-400 mb-6 leading-relaxed">
          {description}
        </p>
        
        {action && (
          <button
            onClick={action.onClick}
            className="btn-primary"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}