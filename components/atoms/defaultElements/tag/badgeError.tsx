export const BadgeError = ({ title }: { title: string }) => {
  return (
    <span className="flex justify-center items-center bg-state-error7 px-2 py-[4px] border-none rounded w-fit text-3xs text-state-error8">
      {title}
    </span>
  );
};
