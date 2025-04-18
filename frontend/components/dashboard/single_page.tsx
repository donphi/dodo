import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl: null, // Will be populated if user logs in through Google
}

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
  { name: 'Contact Us', href: '#' },
  { name: 'Logout', href: '#' },
]

function classNames(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

export default function Dashboard() {
  const userInitials = getUserInitials(user.name);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
  
  return (
    <>
      <div className="min-h-full bg-white dark:bg-gray-900 transition-colors duration-300">
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
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      {user.imageUrl ? (
                        <img alt="" src={user.imageUrl} className="size-8 rounded-full" />
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
                        <a
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 data-[focus]:bg-gray-100 dark:data-[focus]:bg-gray-700 data-[focus]:outline-none transition-colors"
                        >
                          {item.name}
                        </a>
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
                <div className="shrink-0">
                  {user.imageUrl ? (
                    <img alt="" src={user.imageUrl} className="size-10 rounded-full" />
                  ) : (
                    <div className="size-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                      {userInitials}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-300">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {userNavigation.map((item) => (
                  <DisclosureButton
                    key={item.name}
                    as="a"
                    href={item.href}
                    className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    {item.name}
                  </DisclosureButton>
                ))}
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>

        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {/* Chart container with square aspect ratio, rounded corners, and grey border */}
              <div className="w-full aspect-square max-w-4xl mx-auto border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
                {/* This is where your echart will go */}
                <div id="echartContainer" className="w-full h-full"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}