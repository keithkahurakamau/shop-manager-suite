import { ReactNode } from "react";

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageWrapper({ title, subtitle, actions, children }: PageWrapperProps) {
  return (
    <div className="flex-1 p-6 lg:p-8 overflow-auto">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
