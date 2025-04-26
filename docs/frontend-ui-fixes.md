# Frontend UI Fixes

## Smooth Scrolling from "Learn More" to FAQ Section

Added a smooth scrolling animation from the "Learn More" button in the top component to the FAQ section. The implementation includes:

- Changed the Link component to a button with an onClick handler
- Added an ID to the FAQ section for targeting
- Implemented a custom scroll animation with easeInOutCubic easing function for a more polished user experience
- Dynamically calculated the scroll offset to center the FAQ section in the viewport

```typescript
// Custom scroll animation with easeInOutCubic easing
onClick={() => {
  const faqElement = document.getElementById('faq');
  if (faqElement) {
    // Get the target position (centered in the viewport)
    const windowHeight = window.innerHeight;
    const faqHeight = faqElement.getBoundingClientRect().height;
    // Calculate offset to center the FAQ in the viewport
    const offset = (windowHeight - faqHeight) / 2;
    const targetPosition = faqElement.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000; // ms
    let start: number | null = null;
    
    // Easing function: easeInOutCubic
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    // Animation function
    function animation(currentTime: number) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * easeProgress);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }
    
    // Start animation
    requestAnimationFrame(animation);
  }
}}
```

## GitHub Link Update

Updated the GitHub link in the footer to point to the Biobankly GitHub organization:

```typescript
// Before
name: 'GitHub',
href: '#',

// After
name: 'GitHub',
href: 'https://github.com/biobankly',
```

This ensures users can easily access the organization's GitHub repositories from the footer.