interface AlertSectionHeaderProps {
  title: string;
  showListings?: boolean;
}

export const AlertSectionHeader = ({
  title,
  showListings = false,
}: AlertSectionHeaderProps) => {
  return (
    <div className="mb-3 grid grid-cols-[1fr_auto] items-center gap-4">
      <p className="text-sm font-medium uppercase tracking-[0.8px] text-slate-400">
        {title}
      </p>
      <div className="flex gap-4">
        {showListings && (
          <p className="w-20 text-center text-sm text-slate-400">Listings</p>
        )}
        <p className="w-12 text-center text-sm text-slate-400">Email</p>
        <p className="w-12 text-center text-sm text-slate-400">In-App</p>
      </div>
    </div>
  );
};
