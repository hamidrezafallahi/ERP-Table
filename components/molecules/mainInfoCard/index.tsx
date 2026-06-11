import {
  CircleList,
  CirclePlus,
  FilledCircleList,
  FilledCirclePlus,
} from "@components/atoms/iconComponents";
import TextContainer from "./textContainer";
import ProfileDisplay from "./profileDisplay";
import CustomButtonWithIcons from "./customButtonWithIcons";

export const MainInfoCard = ({
  temp,
  titleGroup,
}: {
  temp: any;
  titleGroup?: string;
}) => {
  return (
    <div className="flex justify-between w-full p-3 h-12 border border-gray-gray4 rounded-lg">
      <div className="flex flex-1 min-w-0">
        {temp?.type && (
          <div className="flex gap-2 ps-2 h-10 shrink-0">
            <ProfileDisplay
              Component={temp.type}
              componentProps={{ url: temp.url }}
            />
          </div>
        )}
        <div className="flex gap-2 flex-1 min-w-0">
          <TextContainer
            label={temp.label}
            titleGroup={titleGroup}
            description={temp.description}
          />
        </div>
      </div>
      <div className="flex gap-1 shrink-0 items-center">
        {temp.formUrl && (
          <CustomButtonWithIcons
            icon1={
              <CirclePlus
                config={{ width: 20, height: 20, stroke: "#939393" }}
              />
            }
            icon2={
              <FilledCirclePlus
                config={{ width: 20, height: 20, stroke: "#939393" }}
              />
            }
            form={temp}
          />
        )}
        {temp.listUrl && (
          <CustomButtonWithIcons
            icon1={<CircleList config={{ width: 20, height: 20 }} />}
            icon2={<FilledCircleList config={{ width: 20, height: 20 }} />}
            list={temp}
          />
        )}
      </div>
    </div>
  );
};
