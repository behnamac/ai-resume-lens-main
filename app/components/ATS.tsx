import React from 'react'

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const passing = score > 69;
  const partial = score > 49;

  const iconSrc = passing
      ? '/icons/ats-good.svg'
      : partial
          ? '/icons/ats-warning.svg'
          : '/icons/ats-bad.svg';

  const verdict = passing
      ? 'likely to pass most filters'
      : partial
          ? 'some filters will trip on it'
          : 'most filters will drop it';

  const edge = passing
      ? 'border-accent/30 bg-accent/5'
      : partial
          ? 'border-mid/30 bg-mid/5'
          : 'border-flag/30 bg-flag/5';

  return (
      <div className={`border ${edge} px-5 py-4.5 flex flex-col gap-4`}>
        <div className="flex items-start gap-4.5">
          <img src={iconSrc} alt="" className="w-9 h-9 shrink-0" />
          <div>
            <div className="text-lg md:text-[19px] font-medium">
              ATS score {score} — {verdict}
            </div>
            <div className="text-[15px] leading-relaxed text-muted mt-1">
              This is how the resume reads to the software that screens it before a person does.
            </div>
          </div>
        </div>

        {suggestions.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-4 border-t border-hairline">
              {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3.5">
                    <span
                        className={`font-mono text-[13px] leading-6 ${
                            suggestion.type === 'good' ? 'text-accent' : 'text-flag'
                        }`}
                    >
                      {suggestion.type === 'good' ? '✓' : '!'}
                    </span>
                    <p className="text-[15px] leading-relaxed text-muted">{suggestion.tip}</p>
                  </div>
              ))}
            </div>
        )}
      </div>
  )
}

export default ATS
