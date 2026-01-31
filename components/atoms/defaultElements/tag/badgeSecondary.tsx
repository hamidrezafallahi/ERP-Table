export const BadgeSecondary = ({ title }: { title: string }) => {
  return (
    <span className="flex justify-center items-center bg-blue-blue10 px-2 py-[4px] border-none rounded w-fit text-3xs text-blue-blue7">
      {title}
    </span>
  );
};
