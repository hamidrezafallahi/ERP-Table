export const BadgeSuccess = ({ title }: { title: string }) => {
  return (
    <span className="flex justify-center items-center bg-state-success2 px-2 py-[4px] border-none rounded w-fit text-3xs text-state-success1">
      {title}
    </span>
  );
};
