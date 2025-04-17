import { Microscope, Download, BarChart4 } from 'lucide-react'

const features = [
  {
    name: 'Navigate phenotype clusters.',
    description:
      'Explore specific segments of the UK Biobank dataset with precision. Seamlessly zoom into phenotype groupings to uncover meaningful patterns.',
    icon: Microscope,
  },
  {
    name: 'Export key insights.',
    description:
      'Select and export nodes, edges, or entire views for offline analysis or integration with your research pipeline.',
    icon: Download,
  },
  {
    name: 'Generate high-level summaries.',
    description:
      'View automatically generated phenotype insights to quickly understand group dynamics and outliers within the dataset.',
    icon: BarChart4,
  },
]

export default function Example() {
  return (
    <div className="overflow-hidden bg-white dark:bg-gray-900 py-24 sm:py-32 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:ml-auto lg:pl-4 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Unlock phenotype insights</h2>
              <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                A new way to explore complex data
              </p>
              <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
                Interactively map, filter, and extract high-impact signals from the
                UK Biobank’s phenotype graph with ease.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 dark:text-gray-300 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900 dark:text-white">
                      <feature.icon aria-hidden="true" className="absolute left-1 top-1 size-5 text-indigo-600 dark:text-indigo-400" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="flex items-start justify-end lg:order-first">
            <img
              alt="Product screenshot"
              src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
              width={2432}
              height={1442}
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 dark:ring-white/10 sm:w-[57rem] transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}