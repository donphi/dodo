import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Square, Box, Disc2, ListTree, Radar, Dna, Dot } from 'lucide-react'
import { useTheme, Theme } from '../context/ThemeContext'
import React from 'react'

// Extend HTMLElement to include our custom property
declare global {
  interface HTMLElement {
    __THEME_CONTROLLER?: {
      theme: Theme;
      setTheme: (theme: Theme) => void;
    };
  }
}

// Interface for props
interface VisualizationHeaderProps {
  currentView?: '2d' | '3d' | 'tidy' | 'radial';
  onViewChange?: (view: string) => void;
}

// Define the view types with their icons and text
const viewTypes = [
  { id: '2d', name: '2 Dimensional', icon: Square, description: 'Standard 2D visualization' },
  { id: '3d', name: '3 Dimensional', icon: Box, description: '3D spatial representation' },
  { id: 'radial', name: 'Radial Tidy Tree', icon: Disc2, description: 'Circular hierarchy visualization' },
  { id: 'tidy', name: 'Tidy Tree', icon: ListTree, description: 'Organized node-link tree layout' },
  { id: 'sunburst', name: 'Sunburst', icon: Radar, description: 'Radial space-filling visualization' },
]

// Main component combining light and dark modes
export default function VisualizationHeader({ 
  currentView = '2d', 
  onViewChange 
}: VisualizationHeaderProps): JSX.Element {
  // Find the active view based on the currentView prop
  const [activeView, setActiveView] = useState(
    viewTypes.find(v => v.id === currentView) || viewTypes[0]
  );
  const themeContext = useTheme()

  // Update when currentView prop changes
  useEffect(() => {
    const view = viewTypes.find(v => v.id === currentView) || viewTypes[0];
    setActiveView(view);
  }, [currentView]);
  
  // Handle view changes
  const handleViewChange = (viewType: typeof viewTypes[0], close: () => void) => {
    console.log("View change clicked:", viewType.id);
    setActiveView(viewType);
    if (onViewChange) {
      console.log("Calling onViewChange with:", viewType.id);
      onViewChange(viewType.id);
    }
    // Close the popover
    close();
  };
  
  // Expose theme setter to parent via ref
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const appElement = document.getElementById('visualization-app');
      if (appElement) {
        appElement.__THEME_CONTROLLER = themeContext;
      }
    }
  }, [themeContext]);

  return (
    <div className="py-6 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Dimension Deck
          </h2>
          <div className="mt-1 flex flex-wrap items-center">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
              <Dna className="mr-1.5 size-5 shrink-0 text-gray-400 dark:text-gray-500" />
              UK Biobank Features
            </div>
            
            <Dot className="mx-0.5 size-8 text-gray-400 dark:text-gray-500" />
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
              {React.createElement(activeView.icon, { 
                className: "mr-1.5 size-5 shrink-0 text-gray-400 dark:text-gray-500"
              })}
              {activeView.name}
            </div>
          </div>
        </div>

        {/* Desktop Flyout Menu */}
        <Popover className="relative ml-auto hidden sm:block">
          <PopoverButton className="inline-flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <span>View Options</span>
            <ChevronDownIcon aria-hidden="true" className="size-5 text-white" />
          </PopoverButton>

          <PopoverPanel
            transition
            className="absolute right-0 z-10 mt-5 w-screen max-w-md px-4 sm:px-0 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
          >
            {({ close }) => (
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/5">
                <div className="bg-white dark:bg-gray-800">
                  <div className="p-4">
                    {viewTypes.map((viewType) => (
                      <div 
                        key={viewType.id}
                        className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleViewChange(viewType, close)}
                      >
                        <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600">
                          {React.createElement(viewType.icon, { 
                            className: `size-6 ${activeView.id === viewType.id 
                              ? "text-indigo-600 dark:text-indigo-400" 
                              : "text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`
                          })}
                        </div>
                        <div>
                          <button className="font-semibold text-gray-900 dark:text-white">
                            {viewType.name}
                            <span className="absolute inset-0" />
                          </button>
                          <p className="mt-1 text-gray-600 dark:text-gray-300">{viewType.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4">
                    <div className="flex items-center gap-x-3">
                      <div className="flex size-10 flex-none items-center justify-center rounded-lg bg-white dark:bg-gray-600">
                        <Dna className="size-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">UK Biobank Phenotypes</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Explore the complete collection of UK Biobank phenotypic data
                    </p>
                  </div>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Popover>

        {/* Mobile Flyout Menu with Ellipsis Icon */}
        <Popover className="relative ml-auto sm:hidden">
          <PopoverButton className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <span className="sr-only">Open menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </PopoverButton>

          <PopoverPanel
            transition
            className="absolute right-0 z-10 mt-2 w-screen max-w-xs px-0 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
          >
            {({ close }) => (
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/5">
                <div className="bg-white dark:bg-gray-800">
                  <div className="p-3">
                    {viewTypes.map((viewType) => (
                      <div 
                        key={viewType.id}
                        className="group relative flex items-center gap-x-4 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => handleViewChange(viewType, close)}
                      >
                        <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600">
                          {React.createElement(viewType.icon, { 
                            className: `size-5 ${activeView.id === viewType.id 
                              ? "text-indigo-600 dark:text-indigo-400" 
                              : "text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`
                          })}
                        </div>
                        <div className="flex-1">
                          <button className="font-semibold text-gray-900 dark:text-white text-sm">
                            {viewType.name}
                            <span className="absolute inset-0" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3">
                    <div className="flex items-center gap-x-3">
                      <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-white dark:bg-gray-600">
                        <Dna className="size-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">UK Biobank Phenotypes</h3>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Popover>
      </div>
    </div>
  )
}