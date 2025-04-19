import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import React from 'react'
import dynamic from 'next/dynamic'
import Footer from '../hero_landing/footer'
// Import the ThemeSwitcher component but we'll create a custom wrapper for it
import ThemeSwitcherOriginal from '../theme_switch'
import { Sun, Moon, MonitorSmartphone, Box, LayoutGrid } from 'lucide-react'
import { useTheme, Theme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/router'

// Dynamically import the graph components with SSR disabled
const ForceGraph3DComponent = dynamic(() => import('../ForceGraph3D'), { ssr: false })
const ForceGraph2DComponent = dynamic(() => import('../ForceGraph2D'), { ssr: false })

// Function to get user initials
function getUserInitials(name: string) {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
}

const userNavigation = [
  { name: 'Contact Us', href: '/contact-us' },
  { name: 'Logout', href: '#' },
  { name: 'Delete Account', href: '#' }
]

function classNames(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
  const { user, profile, signOut, deleteAccount } = useAuth();
  const router = useRouter();
  
  const userName = profile?.fullName || user?.user_metadata?.full_name || 'User';
  const userEmail = profile?.email || user?.email || '';
  const userImageUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  
  const userInitials = getUserInitials(userName);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  
  // Toggle between 2D and 3D views
  const toggleView = () => {
    setViewMode(viewMode === '3d' ? '2d' : '3d');
  };

  // Check for dark mode on component mount and when theme changes
  useEffect(() => {
    // Initial check
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Set up observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);
  
  // Create a custom dashboard-specific theme switcher component
  const DashboardThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
  
    useEffect(() => {
      setMounted(true);
    }, []);
  
    if (!mounted) return null;
  
    const cycleTheme = () => {
      const modes: Theme[] = ['light', 'dark', 'system'];
      const currentIndex = modes.indexOf(theme);
      const nextIndex = (currentIndex + 1) % modes.length;
      const newTheme = modes[nextIndex];
      setTheme(newTheme);
    };
  
    return (
      <button
        onClick={cycleTheme}
        className="flex h-8 w-8 items-center justify-center rounded-full
        bg-white/70 dark:bg-gray-800/70 shadow-md backdrop-blur transition-all duration-300
        hover:bg-white/90 dark:hover:bg-gray-900/90"
        aria-label="Toggle theme"
      >
        {theme === 'light' && (
          <Sun className="h-4 w-4 text-gray-800 transition-all duration-500 hover:rotate-90 hover:text-indigo-600" />
        )}
        {theme === 'dark' && (
          <Moon className="h-4 w-4 text-indigo-300 transition-all duration-500 hover:rotate-180 hover:text-white" />
        )}
        {theme === 'system' && (
          <MonitorSmartphone className="h-4 w-4 text-gray-500 transition-all duration-500 hover:scale-110 hover:text-indigo-600" />
        )}
      </button>
    );
  };
  
  return (
    <>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
        <Disclosure as="nav" className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-none border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex shrink-0 items-center">
                  <img
                    alt="Dodo"
                    src={isDarkMode ? "/dodo_logo_dark.svg" : "/dodo_logo.svg"}
                    className="block h-8 w-auto lg:hidden"
                  />
                  <img
                    alt="Dodo"
                    src={isDarkMode ? "/dodo_logo_dark.svg" : "/dodo_logo.svg"}
                    className="hidden h-8 w-auto lg:block"
                  />
                </div>
                {/* No navigation items as per requirements */}
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {/* View mode toggle - positioned to the left of theme switcher */}
                <div className="mr-4">
                  <button
                    onClick={toggleView}
                    className="flex h-8 w-8 items-center justify-center rounded-full
                    bg-white/70 dark:bg-gray-800/70 shadow-md backdrop-blur transition-all duration-300
                    hover:bg-white/90 dark:hover:bg-gray-900/90"
                    aria-label="Toggle view mode"
                  >
                    {viewMode === '3d' ? (
                      <LayoutGrid className="h-4 w-4 text-gray-800 dark:text-indigo-300 transition-all duration-500" />
                    ) : (
                      <Box className="h-4 w-4 text-gray-800 dark:text-indigo-300 transition-all duration-500" />
                    )}
                  </button>
                </div>
                
                {/* Theme switcher */}
                <div className="mr-4">
                  <DashboardThemeSwitcher />
                </div>
                
                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <div>
                    <MenuButton className="relative flex rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      {userImageUrl ? (
                        <img alt="" src={userImageUrl} className="size-8 rounded-full" />
                      ) : (
                        <div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                          {userInitials}
                        </div>
                      )}
                    </MenuButton>
                  </div>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    {userNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        {item.name === 'Logout' ? (
                          <button
                            onClick={signOut}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 data-[focus]:bg-gray-100 dark:data-[focus]:bg-gray-700 data-[focus]:outline-none transition-colors"
                          >
                            {item.name}
                          </button>
                        ) : item.name === 'Delete Account' ? (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                deleteAccount();
                              }
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 data-[focus]:bg-gray-100 dark:data-[focus]:bg-gray-700 data-[focus]:outline-none transition-colors"
                          >
                            {item.name}
                          </button>
                        ) : (
                          <a
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(item.href);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 data-[focus]:bg-gray-100 dark:data-[focus]:bg-gray-700 data-[focus]:outline-none transition-colors"
                          >
                            {item.name}
                          </a>
                        )}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-800 p-2 text-gray-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
                  <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
                </DisclosureButton>
              </div>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden">
            {/* No navigation items in mobile menu */}
            <div className="border-t border-gray-200 dark:border-gray-700 pb-3 pt-4">
              <div className="flex items-center px-4">
                {/* Mobile view mode toggle */}
                <div className="mr-3">
                  <button
                    onClick={toggleView}
                    className="flex h-8 w-8 items-center justify-center rounded-full
                    bg-white/70 dark:bg-gray-800/70 shadow-md backdrop-blur transition-all duration-300
                    hover:bg-white/90 dark:hover:bg-gray-900/90"
                    aria-label="Toggle view mode"
                  >
                    {viewMode === '3d' ? (
                      <LayoutGrid className="h-4 w-4 text-gray-800 dark:text-indigo-300 transition-all duration-500" />
                    ) : (
                      <Box className="h-4 w-4 text-gray-800 dark:text-indigo-300 transition-all duration-500" />
                    )}
                  </button>
                </div>
                
                {/* Mobile theme switcher */}
                <div className="mr-3">
                  <DashboardThemeSwitcher />
                </div>
                
                <div className="shrink-0">
                  {userImageUrl ? (
                    <img alt="" src={userImageUrl} className="size-10 rounded-full" />
                  ) : (
                    <div className="size-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                      {userInitials}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{userName}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-300">{userEmail}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {userNavigation.map((item) => (
                  item.name === 'Logout' ? (
                    <DisclosureButton
                      key={item.name}
                      as="button"
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      {item.name}
                    </DisclosureButton>
                  ) : item.name === 'Delete Account' ? (
                    <DisclosureButton
                      key={item.name}
                      as="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                          deleteAccount();
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                    >
                      {item.name}
                    </DisclosureButton>
                  ) : (
                    <DisclosureButton
                      key={item.name}
                      as="a"
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(item.href);
                      }}
                      className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      {item.name}
                    </DisclosureButton>
                  )
                ))}
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>

        <div className="flex flex-col flex-grow">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
            </div>
          </header>
          
          {/* Main content area with force graph taking up most of the space */}
          <main className="flex-grow flex flex-col">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
              {/* Force Graph container that fills the available space between header and footer */}
              <div className="w-full flex-grow border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 transition-colors mb-8 flex flex-col" style={{ minHeight: '500px', maxHeight: 'calc(100vh - 200px)', overflow: 'hidden' }}>
                <div className="w-full h-full flex-grow overflow-hidden">
                  {viewMode === '3d' ? <ForceGraph3DComponent /> : <ForceGraph2DComponent />}
                </div>
              </div>
            </div>
          </main>
        </div>
        
        {/* Footer with reduced prominence */}
        <div className="opacity-70 hover:opacity-100 transition-opacity">
          <Footer />
        </div>
      </div>
    </>
  )
}