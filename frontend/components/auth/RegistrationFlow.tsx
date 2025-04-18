import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { AuthTemplate } from './AuthTemplate';
import { Breadcrumbs } from './components/breadcrumbs';
import { UserCircle, Microscope, Building2, Dna, CheckCircle } from 'lucide-react';
import { TextInput } from './components/text_field';
import { Checkbox } from './components/checkbox';
import { Dropdown } from './components/dropdown';
import { MultiSelect } from './components/multi-select';
import { RadioGroup } from './components/radio';
import { Button } from './components/button';

// Standard Registration Flow Steps
const standardSteps = [
  { name: 'Account', href: '#' },
  { name: 'Profile', href: '#' },
  { name: 'Affiliation', href: '#' },
  { name: 'Biobank Access', href: '#' },
  { name: 'Finish', href: '#' },
];

// OAuth Registration Flow Steps (skips Account)
const oauthSteps = [
  { name: 'Profile', href: '#' },
  { name: 'Affiliation', href: '#' },
  { name: 'Biobank Access', href: '#' },
  { name: 'Finish', href: '#' },
];

// Registration Flow Container
interface RegistrationFlowProps {
  isOAuth?: boolean;
  provider?: string | null;
}

export function RegistrationFlow({ isOAuth = false, provider = null }: RegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const router = useRouter();

  const steps = isOAuth ? oauthSteps : standardSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (step?: number) => {
    if (step !== undefined) {
      setCurrentStep(step);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleFormChange = (id: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, validateFn?: () => boolean) => {
    e.preventDefault();

    // If validation function is provided, only proceed if validation passes
    if (validateFn && !validateFn()) {
      return;
    }

    // Move to next step on form submit
    handleNext();
  };

  const renderStep = () => {
    if (isOAuth) {
      // OAuth flow starts from Profile step
      switch (currentStep) {
        case 0:
          return (
            <ProfileStep
              provider={provider}
              onSubmit={handleSubmit}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 1:
          return (
            <AffiliationStep
              onSubmit={handleSubmit}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 2:
          return (
            <BiobankAccessStep
              onSubmit={handleSubmit}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 3:
          return <FinishStep formData={formData} isOAuth={true} provider={provider} />;
        default:
          return null;
      }
    } else {
      // Standard flow starts from Account step
      switch (currentStep) {
        case 0:
          return (
            <AccountStep
              onSubmit={(e) =>
                handleSubmit(e, () => {
                  // Validate password match
                  const password = formData.password;
                  const confirmPassword = formData.confirmPassword;
                  if (password !== confirmPassword) {
                    return false;
                  }
                  return true;
                })
              }
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 1:
          return (
            <ProfileStep
              onSubmit={handleSubmit}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 2:
          return (
            <AffiliationStep
              onSubmit={handleSubmit}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 3:
          return (
            <BiobankAccessStep
              onSubmit={handleSubmit}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 4:
          return <FinishStep formData={formData} />;
        default:
          return null;
      }
    }
  };

  // Function to get the appropriate icon for the current step
  const getCurrentStepIcon = () => {
    const stepName = steps[currentStep].name.toLowerCase();
    switch (stepName) {
      case 'account':
        return UserCircle;
      case 'profile':
        return Microscope;
      case 'affiliation':
        return Building2;
      case 'biobank access':
        return Dna;
      case 'finish':
        return CheckCircle;
      default:
        return UserCircle;
    }
  };

  const StepIcon = getCurrentStepIcon();

  return (
    <AuthTemplate
      title="Quick Signup Guide"
    >
      <div className="flex flex-col items-center">
        {/* Single icon representing current step */}
        <div className="mb-6">
          <StepIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
        </div>
        <Breadcrumbs steps={steps} currentStep={currentStep} onStepBack={handlePrevious} />
      </div>
      {renderStep()}
    </AuthTemplate>
  );
}

// Step 1: Account Information (only for standard registration)
interface StepProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formData?: Record<string, any>;
  onFormChange?: (id: string, value: any) => void;
}

export function AccountStep({ onSubmit, formData = {}, onFormChange }: StepProps) {
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (id: string, value: any) => {
    if (onFormChange) {
      onFormChange(id, value);
    }

    // Clear password error when either password field changes
    if (id === 'password' || id === 'confirmPassword') {
      setPasswordError('');

      // Validate passwords match when both fields have values
      const otherField = id === 'password' ? 'confirmPassword' : 'password';
      const otherValue = formData[otherField];

      if (value && otherValue && value !== otherValue) {
        setPasswordError('Passwords do not match');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate passwords match before submitting
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <TextInput id="fullName" label="Full Name" required={true} autoComplete="name" />

      <TextInput
        id="email"
        label="Email Address"
        type="email"
        required={true}
        autoComplete="email"
      />

      <TextInput
        id="password"
        label="Password"
        type="password"
        required={true}
        autoComplete="new-password"
      />

      <div>
        <TextInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          required={true}
          autoComplete="new-password"
        />
        {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
      </div>

      <Checkbox id="acceptTerms" label="I agree to the terms and data use policy" />

      <Button type="submit">Next</Button>
    </form>
  );
}

// Step 2: Profile Information
interface ProfileStepProps extends StepProps {
  provider?: string | null;
}

export function ProfileStep({
  onSubmit,
  provider = null,
  formData = {},
  onFormChange,
}: ProfileStepProps) {
  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'data-scientist', label: 'Data Scientist' },
    { value: 'healthcare', label: 'Healthcare Professional' },
    { value: 'public', label: 'General Public' },
    { value: 'other', label: 'Other' },
  ];

  const experienceOptions = [
    { value: '0-1', label: '0–1 years' },
    { value: '2-4', label: '2–4 years' },
    { value: '5-9', label: '5–9 years' },
    { value: '10+', label: '10+ years' },
  ];

  const countries = [
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' },
    { value: 'in', label: 'India' },
    { value: 'br', label: 'Brazil' },
    { value: 'it', label: 'Italy' },
    { value: 'es', label: 'Spain' },
    { value: 'mx', label: 'Mexico' },
    { value: 'kr', label: 'South Korea' },
    { value: 'ru', label: 'Russia' },
    { value: 'nl', label: 'Netherlands' },
    { value: 'se', label: 'Sweden' },
    { value: 'ch', label: 'Switzerland' },
    { value: 'sg', label: 'Singapore' },
    { value: 'za', label: 'South Africa' },
    { value: 'nz', label: 'New Zealand' },
    { value: 'ie', label: 'Ireland' },
    { value: 'be', label: 'Belgium' },
    { value: 'no', label: 'Norway' },
    { value: 'dk', label: 'Denmark' },
    { value: 'fi', label: 'Finland' },
    { value: 'at', label: 'Austria' },
    { value: 'pt', label: 'Portugal' },
    { value: 'gr', label: 'Greece' },
    { value: 'il', label: 'Israel' },
    { value: 'ae', label: 'United Arab Emirates' },
    // Rest of countries...
  ];

  const handleChange = (id: string, value: any) => {
    if (onFormChange) {
      onFormChange(id, value);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      {provider && (
        <div className="mb-6 rounded-md bg-indigo-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-indigo-700">
                You&apos;ve signed in with {provider}. Please complete your profile information.
              </p>
            </div>
          </div>
        </div>
      )}

      <Dropdown
        id="role"
        label="What best describes you?"
        options={roleOptions}
        value={formData.role}
        onChange={(value) => handleChange('role', value)}
      />

      <Dropdown
        id="experience"
        label="Years of Experience"
        options={experienceOptions}
        value={formData.experience}
        onChange={(value) => handleChange('experience', value)}
      />

      <Dropdown
        id="country"
        label="Country"
        options={countries}
        value={formData.country}
        onChange={(value) => handleChange('country', value)}
      />

      <Button type="submit">Next</Button>
    </form>
  );
}

// Step 3: Affiliation Information
export function AffiliationStep({ onSubmit, formData = {}, onFormChange }: StepProps) {
  const sectorOptions = [
    { value: 'university', label: 'University' },
    { value: 'public', label: 'Public Institute' },
    { value: 'private', label: 'Private' },
    { value: 'ngo', label: 'NGO' },
    { value: 'other', label: 'Other' },
  ];

  const expertiseOptions = [
    { value: 'bioinformatics', label: 'Bioinformatics' },
    { value: 'genomics', label: 'Genomics' },
    { value: 'ml', label: 'Machine Learning' },
    { value: 'public-health', label: 'Public Health' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (id: string, value: any) => {
    if (onFormChange) {
      onFormChange(id, value);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      <TextInput id="institution" label="Institution/Company" required={true} />

      <Dropdown
        id="sector"
        label="Sector"
        options={sectorOptions}
        value={formData.sector}
        onChange={(value) => handleChange('sector', value)}
      />

      <MultiSelect id="expertise" label="Field of Expertise" options={expertiseOptions} />

      <Button type="submit">Next</Button>
    </form>
  );
}

// Step 4: Biobank Access Information
export function BiobankAccessStep({ onSubmit, formData = {}, onFormChange }: StepProps) {
  const yesNoOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  const otherBiobanksOptions = [
    { value: '100k', label: '100K Genomes' },
    { value: 'finngen', label: 'FinnGen' },
    { value: 'all-of-us', label: 'All of Us' },
    { value: 'other', label: 'Other' },
  ];

  const ethicsOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'not-required', label: 'Not Required' },
  ];

  const handleChange = (id: string, value: any) => {
    if (onFormChange) {
      onFormChange(id, value);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      <RadioGroup
        id="ukBiobank"
        label="Are you registered with UK Biobank?"
        options={yesNoOptions}
      />

      <MultiSelect id="otherBiobanks" label="Other biobanks used?" options={otherBiobanksOptions} />

      <Dropdown
        id="ethics"
        label="Ethics approval obtained?"
        options={ethicsOptions}
        value={formData.ethics}
        onChange={(value) => handleChange('ethics', value)}
      />

      <Button type="submit">Next</Button>
    </form>
  );
}

// Step 5: Finish and Summary
interface FinishStepProps {
  formData: Record<string, unknown>;
  isOAuth?: boolean;
  provider?: string | null;
}

export function FinishStep({ formData, isOAuth = false, provider = null }: FinishStepProps) {
  return (
    <div className="space-y-6 w-full">
      <div className="rounded-md bg-green-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Registration Complete</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Your details have been saved. You can now access the explorer.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-gray-50 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Account Summary</h3>

        {isOAuth && (
          <div className="mb-4">
            <p className="text-sm text-gray-700">Signed in with {provider}</p>
          </div>
        )}

        {/* Display summary of entered information */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500">Profile</h4>
            <p className="text-sm text-gray-900">
              Researcher &bull; 5&ndash;9 years &bull; United Kingdom
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-500">Affiliation</h4>
            <p className="text-sm text-gray-900">
              Research Institute • Public • Bioinformatics, Genomics
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-500">Biobank Access</h4>
            <p className="text-sm text-gray-900">UK Biobank: Yes • Ethics: Approved</p>
          </div>
        </div>
      </div>

      <Button>Complete Registration and Launch Explorer</Button>
    </div>
  );
}

// Entry Points for different registration flows
export function StandardRegistration() {
  return <RegistrationFlow isOAuth={false} />;
}

export function GoogleRegistration() {
  return <RegistrationFlow isOAuth={true} provider="Google" />;
}

export function GitHubRegistration() {
  return <RegistrationFlow isOAuth={true} provider="GitHub" />;
}
