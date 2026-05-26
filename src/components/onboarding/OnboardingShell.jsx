'use client';

import { useState } from 'react';
import Step01Welcome from './steps/Step01Welcome';
import Step02Auth from './steps/Step02Auth';
import Step03Signup from './steps/Step03Signup';
import Step04Name from './steps/Step04Name';
import Step05Reach from './steps/Step05Reach';
import Step06Gender from './steps/Step06Gender';
import Step07Location from './steps/Step07Location';
import Step08Field from './steps/Step08Field';
import Step09Topics from './steps/Step09Topics';
import Step10Learn from './steps/Step10Learn';
import Step11Finance from './steps/Step11Finance';
import Step12Ready from './steps/Step12Ready';
import Step13Plans from './steps/Step13Plans';

const STEP_COMPONENTS = {
  1: Step01Welcome,
  2: Step02Auth,
  3: Step03Signup,
  4: Step04Name,
  5: Step05Reach,
  6: Step06Gender,
  7: Step07Location,
  8: Step08Field,
  9: Step09Topics,
  10: Step10Learn,
  11: Step11Finance,
  12: Step12Ready,
  13: Step13Plans,
};

// Steps 4–12 show progress bar (9 segments). Segment index = step - 3.
const PROGRESS_STEPS = [4, 5, 6, 7, 8, 9, 10, 11, 12];
// Steps 2–11 show back button (step 12 topnav is centered wordmark only)
const BACK_STEPS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// Steps 4–12 show "Step X of 9" label
const LABEL_STEPS = [4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function OnboardingShell() {
  const [currentStep, setCurrentStep] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  const [state, setState] = useState({
    name: { first: '', last: '' },
    email: '',
    confirmEmail: '',
    gender: '',
    location: { city: '', state: '', zip: '' },
    field: '',
    fieldOther: '',
    topics: [],
    learning: [],
    finance: [],
  });

  function goToStep(n) {
    window.scrollTo(0, 0);
    setCurrentStep(n);
    setAnimKey(k => k + 1);
  }

  function onNext() { goToStep(currentStep + 1); }
  function onBack() { goToStep(currentStep - 1); }

  const StepComponent = STEP_COMPONENTS[currentStep];
  const showProgress = PROGRESS_STEPS.includes(currentStep);
  const showBack     = BACK_STEPS.includes(currentStep);
  const showLabel    = LABEL_STEPS.includes(currentStep);
  const isStep12     = currentStep === 12;
  const isStep2      = currentStep === 2;
  // Progress segment: step 4 = seg 1, step 12 = seg 9
  const progressSeg  = currentStep - 3;

  // Step 1 and 13 render without any shared topnav chrome
  const bareStep = currentStep === 1 || currentStep === 13;

  return (
    <div
      key={animKey}
      className="ob-step active"
      style={{ margin: '0 auto' }}
    >
      {/* Top nav — shown on steps 2–12 */}
      {!bareStep && (
        <nav className={`ob-topnav${isStep12 ? ' centered' : ''}${isStep2 ? ' auth' : ''}`}>
          {showBack && (
            <button
              type="button"
              className="ob-back-btn"
              aria-label="Go back"
              onClick={onBack}
            >
              <i className="ph-bold ph-arrow-left" />
            </button>
          )}

          {isStep12 ? (
            <span className="ob-wordmark lg">Nook</span>
          ) : showLabel ? (
            <span className="ob-step-label">Step {progressSeg} of 9</span>
          ) : null}
        </nav>
      )}

      {/* Progress bar — steps 4–12 */}
      {showProgress && (
        <div
          className="ob-progress"
          role="progressbar"
          aria-valuenow={progressSeg}
          aria-valuemin={1}
          aria-valuemax={9}
          aria-label={`Step ${progressSeg} of 9`}
        >
          {Array.from({ length: 9 }, (_, i) => {
            const seg = i + 1;
            let cls = 'ob-prog-seg';
            if (seg < progressSeg) cls += ' done';
            else if (seg === progressSeg) cls += ' active';
            return <div key={seg} className={cls} />;
          })}
        </div>
      )}

      {/* Active step content */}
      <StepComponent
        state={state}
        setState={setState}
        onNext={onNext}
        onBack={onBack}
        goToStep={goToStep}
        currentStep={currentStep}
      />
    </div>
  );
}
