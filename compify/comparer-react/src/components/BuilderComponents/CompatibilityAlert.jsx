import { getCompatibilityClass } from '../../utils/formatters';

function CompatibilityAlert({ issues }) {
  if (!issues || issues.length === 0) return null;

  // Agrupar issues por nivel
  const critical = issues.filter(i => i.level === 'critical');
  const warnings = issues.filter(i => i.level === 'warning');
  const info = issues.filter(i => i.level === 'info');

  return (
    <div className="space-y-3">
      {/* Issues Críticos */}
      {critical.map((issue, index) => (
        <div
          key={`critical-${index}`}
          className={`border-2 rounded-lg p-4 ${getCompatibilityClass('critical')}`}
        >
          <div
            className="font-semibold mb-2"
            dangerouslySetInnerHTML={{ __html: issue.message }}
          />
          {issue.solution && (
            <div
              className="text-sm mt-2"
              dangerouslySetInnerHTML={{ __html: issue.solution }}
            />
          )}
          {issue.details && (
            <div className="text-xs mt-2 opacity-75">
              {issue.details}
            </div>
          )}
        </div>
      ))}

      {/* Advertencias */}
      {warnings.map((issue, index) => (
        <div
          key={`warning-${index}`}
          className={`border-2 rounded-lg p-4 ${getCompatibilityClass('warning')}`}
        >
          <div
            className="font-semibold mb-2"
            dangerouslySetInnerHTML={{ __html: issue.message }}
          />
          {issue.solution && (
            <div
              className="text-sm mt-2"
              dangerouslySetInnerHTML={{ __html: issue.solution }}
            />
          )}
          {issue.details && (
            <div className="text-xs mt-2 opacity-75">
              {issue.details}
            </div>
          )}
        </div>
      ))}

      {/* Información */}
      {info.map((issue, index) => (
        <div
          key={`info-${index}`}
          className={`border-2 rounded-lg p-4 ${getCompatibilityClass('info')}`}
        >
          <div
            className="font-semibold mb-2"
            dangerouslySetInnerHTML={{ __html: issue.message }}
          />
          {issue.details && (
            <div className="text-xs mt-2 opacity-75">
              {issue.details}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CompatibilityAlert;
