export interface SegmentedOption {
  value: string;
  label: string;
  isActive: boolean;
  select: () => void;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
}

export function SegmentedControl({ options }: SegmentedControlProps) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.isActive}
          className="segmented__option"
          onClick={option.select}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
