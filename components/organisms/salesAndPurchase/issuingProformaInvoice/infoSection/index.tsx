import { documentInfoConfig } from "../config";
import { MainInfoCard } from "@components/molecules/mainInfoCard";
import { useAppSelector } from "@redux/index";
import { shallowEqual } from "react-redux";

export default function InfoSection() {
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  return (
    <div
      className={`${
        match
          ? "gap-3 grid grid-cols-3 h-fit max-h-full"
          : "flex flex-col gap-2"
      }`}
    >
      {documentInfoConfig.map((item, index) => (
        <MainInfoCard
          temp={item}
          key={index}
          titleGroup="title"
        />
      ))}
    </div>
  );
}
