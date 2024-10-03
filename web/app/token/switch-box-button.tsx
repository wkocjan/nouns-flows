export const SwitchSwapBoxButton = ({ switchSwapBox }: { switchSwapBox: () => void }) => {
  return (
    <button
      onClick={switchSwapBox}
      className="mx-auto block rounded-xl border-[3px] border-black/90 p-2 dark:bg-gray-900"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </svg>
    </button>
  )
}
