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
  onComplete?: (formData: Record<string, any>) => void;
}

import { supabase } from '../../lib/supabaseClient';

export function RegistrationFlow({ isOAuth = false, provider = null, onComplete }: RegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Async handler for AccountStep (standard registration)
  const handleAccountSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate all required fields are present
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.acceptTerms) {
      setError('All fields are required and terms must be accepted');
      return;
    }

    // Validate passwords match
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // No longer creating the user account here
    // Just proceed to the next step after validation
    setLoading(true);
    try {
      // Store validated data in formData state
      setFormData((prev) => ({
        ...prev,
        email: formData.email,
      }));
      
      // Proceed to next step
      handleNext();
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  // Validation helpers for each step
  const validateAccountStep = () => {
    const requiredFields = ['fullName', 'email', 'password', 'confirmPassword', 'acceptTerms'];
    for (const field of requiredFields) {
      if (!formData[field] || (field === 'acceptTerms' && formData[field] !== true)) {
        setError('All fields are required and terms must be accepted.');
        return false;
      }
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateProfileStep = () => {
    const requiredFields = ['role', 'experience', 'country'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError('All fields in this step are required.');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const validateAffiliationStep = () => {
    const requiredFields = ['institution', 'sector', 'expertise'];
    for (const field of requiredFields) {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        setError('All fields in this step are required.');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const validateBiobankStep = () => {
    const requiredFields = ['ukBiobank', 'otherBiobanks', 'ethics'];
    for (const field of requiredFields) {
      if (
        formData[field] === undefined ||
        formData[field] === null ||
        (Array.isArray(formData[field]) && formData[field].length === 0) ||
        formData[field] === ''
      ) {
        setError('All fields in this step are required.');
        return false;
      }
    }
    setError(null);
    return true;
  };

  // Generalized handleSubmit for each step
  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    validateFn?: () => boolean
  ) => {
    e.preventDefault();

    if (validateFn && !validateFn()) {
      return;
    }

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
              onSubmit={e => handleSubmit(e, validateProfileStep)}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 1:
          return (
            <AffiliationStep
              onSubmit={e => handleSubmit(e, validateAffiliationStep)}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 2:
          return (
            <BiobankAccessStep
              onSubmit={e => handleSubmit(e, validateBiobankStep)}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 3:
          return <FinishStep formData={formData} isOAuth={true} provider={provider} onComplete={onComplete} />;
        default:
          return null;
      }
    } else {
      // Standard flow starts from Account step
      switch (currentStep) {
        case 0:
          return (
            <AccountStep
              onSubmit={e => handleAccountSubmit(e)}
              formData={formData}
              onFormChange={handleFormChange}
              loading={loading}
              error={error}
            />
          );
        case 1:
          return (
            <ProfileStep
              onSubmit={e => handleSubmit(e, validateProfileStep)}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 2:
          return (
            <AffiliationStep
              onSubmit={e => handleSubmit(e, validateAffiliationStep)}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 3:
          return (
            <BiobankAccessStep
              onSubmit={e => handleSubmit(e, validateBiobankStep)}
              formData={formData}
              onFormChange={handleFormChange}
            />
          );
        case 4:
          return <FinishStep formData={formData} onComplete={onComplete} />;
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
        <Breadcrumbs steps={steps} currentStep={currentStep} />
      </div>
      {error && (
        <div className="w-full flex justify-center">
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 mb-4 text-center w-full">
            <div className="flex justify-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
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

interface AccountStepProps extends StepProps {
  loading?: boolean;
  error?: string | null;
}

export function AccountStep({ onSubmit, formData = {}, onFormChange, loading = false, error = null }: AccountStepProps) {
  // Remove local password error state and validation
  // All validation is now handled at the parent component level
  
  const handleChange = (id: string, value: any) => {
    if (onFormChange) {
      onFormChange(id, value);
    }
  };

  // Remove local handleSubmit, rely on parent validation

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      <TextInput
        id="fullName"
        label="Full Name"
        required={true}
        autoComplete="name"
        value={formData.fullName || ''}
        onChange={handleChange}
      />

      <TextInput
        id="email"
        label="Email Address"
        type="email"
        required={true}
        autoComplete="email"
        value={formData.email || ''}
        onChange={handleChange}
      />

      <TextInput
        id="password"
        label="Password"
        type="password"
        required={true}
        autoComplete="new-password"
        value={formData.password || ''}
        onChange={handleChange}
      />

      <TextInput
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        required={true}
        autoComplete="new-password"
        value={formData.confirmPassword || ''}
        onChange={handleChange}
      />

      <Checkbox
        id="acceptTerms"
        required={true}
        checked={formData.acceptTerms || false}
        onChange={handleChange}
        label={
          <>
            I agree to the{' '}
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-indigo-600 hover:text-indigo-800"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-indigo-600 hover:text-indigo-800"
            >
              Privacy Policy
            </a>
          </>
        }
      />

      {/* Error message is now displayed at the top level component only */}

      <Button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Next'}
      </Button>
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
    { value: 'deep-learning', label: 'Deep Learning' },
    { value: 'nlp', label: 'Natural Language Processing' },
    { value: 'computer-vision', label: 'Computer Vision' },
    { value: 'data-mining', label: 'Data Mining' },
    { value: 'statistics', label: 'Statistics' },
    { value: 'public-health', label: 'Public Health' },
    { value: 'other', label: 'Other' },
    { value: 'none', label: 'None' },
  ];

  const handleChange = (id: string, value: any) => {
    if (onFormChange) {
      onFormChange(id, value);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      <Dropdown
        id="sector"
        label="Sector"
        options={sectorOptions}
        value={formData.sector}
        onChange={(value) => handleChange('sector', value)}
      />

      <TextInput
        id="institution"
        label="Name of your organisation or group you represent"
        required={true}
        value={formData.institution || ''}
        onChange={handleChange}
      />

      <MultiSelect
        id="expertise"
        label="Select the industry or domain you work in"
        options={expertiseOptions}
        value={formData.expertise || []}
        onChange={handleChange}
      />

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
    { value: 'genomics-uk', label: 'Genomics England' },
    { value: '100k', label: '100K Genomes' },
    { value: 'finngen', label: 'FinnGen' },
    { value: 'all-of-us', label: 'All of Us' },
    { value: 'other', label: 'Other' },
  ];

  const ethicsOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'in-progress', label: 'In Progress' },
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
        value={formData.ukBiobank || ''}
        onChange={handleChange}
      />

      <MultiSelect
        id="otherBiobanks"
        label="Other biobanks used?"
        options={otherBiobanksOptions}
        value={formData.otherBiobanks || []}
        onChange={handleChange}
      />

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
  onComplete?: (formData: Record<string, any>) => void;
}

export function FinishStep({ formData, isOAuth = false, provider = null, onComplete }: FinishStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // First check if we have a session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // If no session, we need to create the user first for non-OAuth flow
        if (!isOAuth) {
          // For standard registration, create the user account
          const { data: userData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email as string,
            password: formData.password as string,
            options: {
              data: {
                full_name: formData.fullName as string,
              },
            },
          });
          
          if (signUpError) throw signUpError;
          
          if (!userData.user) {
            throw new Error('Failed to create user account');
          }
          
          // Update the user's profile in Supabase
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: userData.user.id,
              email: userData.user.email,
              fullName: formData.fullName,
              role: formData.role,
              experience: formData.experience,
              country: formData.country,
              institution: formData.institution,
              sector: formData.sector,
              expertise: formData.expertise,
              ukBiobank: formData.ukBiobank,
              otherBiobanks: formData.otherBiobanks,
              ethics: formData.ethics,
              updated_at: new Date().toISOString()
            });
          
          if (profileError) throw profileError;
        } else {
          throw new Error('No authenticated session found. Please try logging in again.');
        }
      } else {
        // We have a session, update the profile for the authenticated user
        const user = sessionData.session.user;
        
        // Update the user's profile in Supabase
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            fullName: formData.fullName || user.user_metadata?.full_name,
            role: formData.role,
            experience: formData.experience,
            country: formData.country,
            institution: formData.institution,
            sector: formData.sector,
            expertise: formData.expertise,
            ukBiobank: formData.ukBiobank,
            otherBiobanks: formData.otherBiobanks,
            ethics: formData.ethics,
            updated_at: new Date().toISOString()
          });
        
        if (profileError) throw profileError;
      }
      
      // Now proceed with completion
      if (onComplete) {
        onComplete(formData as Record<string, any>);
      } else {
        console.log('Registration completed with data:', formData);
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6 w-full">
      <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
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
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Thank You!</h3>
            <div className="mt-2 text-sm text-green-700 dark:text-green-300">
              <p>Your onboarding is complete. You're all set to explore our platform!</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="w-full flex justify-center">
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 mb-4 text-center w-full">
            <div className="flex justify-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleComplete} disabled={loading}>
        {loading ? 'Processing...' : 'Let\'s Go!'}
      </Button>
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
