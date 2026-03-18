import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
}

interface WizardProgressProps {
  currentStep: number;
  steps: Step[];
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  steps,
}) => {
  const totalSteps = steps.length;
  
  return (
    <div className="mb-6">
      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted 
                      ? 'bg-gradient-to-br from-green-500 to-green-400 text-white' 
                      : isCurrent
                        ? 'bg-gradient-to-br from-orange-500 to-orange-400 text-white scale-110'
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>
                <span 
                  className={`
                    text-xs mt-2 font-medium text-center
                    ${isCurrent ? 'text-orange-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}
                  `}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <div 
                  className={`
                    flex-1 h-0.5 mx-2 transition-colors duration-300
                    ${index < currentStep - 1 ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
