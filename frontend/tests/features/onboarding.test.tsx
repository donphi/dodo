import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegistrationFlow } from '../../tempate_components/login/onboarding_flow';
import { supabase } from '../../lib/supabaseClient';
import {
  givenUserIsOnOnboardingPage,
  whenUserSubmitsOnboardingForm,
  thenProfileDataIsSaved,
  thenUserIsRedirectedToDashboard,
  thenErrorMessageIsDisplayed
} from '../step-definitions/auth-steps';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock Supabase client
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Onboarding Data Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Successful onboarding submission saves data and redirects to dashboard', async () => {
    // Given
    const mockRouter = givenUserIsOnOnboardingPage();
    
    // When
    render(<RegistrationFlow />);
    
    // Fill in onboarding form with valid data
    // Note: This will fail until the actual form implementation is complete
    // We're testing based on the Gherkin spec which mentions these fields
    
    // Simulate filling the fullName field
    const fullNameInput = screen.queryByLabelText(/full name/i);
    if (fullNameInput) {
      fireEvent.change(fullNameInput, {
        target: { value: 'John Doe' },
      });
    }
    
    // Simulate selecting a role
    const roleSelect = screen.queryByLabelText(/what best describes you/i);
    if (roleSelect) {
      fireEvent.change(roleSelect, {
        target: { value: 'Data Analyst' },
      });
    }
    
    // Simulate selecting experience
    const experienceSelect = screen.queryByLabelText(/years of experience/i);
    if (experienceSelect) {
      fireEvent.change(experienceSelect, {
        target: { value: '5 years' },
      });
    }
    
    // Mock successful form submission
    await whenUserSubmitsOnboardingForm(true);
    
    // Simulate form submission
    const submitButton = screen.queryByRole('button', { name: /next|submit|finish/i });
    if (submitButton) {
      fireEvent.click(submitButton);
    }
    
    // Then
    await thenProfileDataIsSaved();
    await thenUserIsRedirectedToDashboard(mockRouter);
  });

  test('Failed onboarding submission shows error message', async () => {
    // Given
    givenUserIsOnOnboardingPage();
    
    // When
    render(<RegistrationFlow />);
    
    // Fill in onboarding form with invalid or incomplete data
    // For this test, we'll assume the form is filled but the submission fails
    
    // Mock failed form submission
    await whenUserSubmitsOnboardingForm(false);
    
    // Simulate form submission
    const submitButton = screen.queryByRole('button', { name: /next|submit|finish/i });
    if (submitButton) {
      fireEvent.click(submitButton);
    }
    
    // Then
    await thenErrorMessageIsDisplayed('Failed to save onboarding data. Please try again.');
  });
});