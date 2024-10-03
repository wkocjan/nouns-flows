export const CurrencyDisplay = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-shrink-0 items-center space-x-1 rounded-full bg-white px-2 py-1 text-lg font-medium shadow-sm dark:border dark:border-gray-700 dark:bg-black/30 dark:text-gray-50">
    {children}
  </div>
)
