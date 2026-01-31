import {
  FC,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  CircleList,
  CirclePlus,
  FilledCircleList,
  FilledCirclePlus,
  ProfileIcon,
} from '@components/atoms/iconComponents';
import { useInitializePage } from '@hooks/custom';
import { PageStateEnum } from '@slice/pages/enum';

interface ProfileDisplayProps {
  url?: string; // The URL of the image
  expirationTime?: number; // The expiration time in milliseconds (e.g., Date.now() + 60000 for 1 minute)
}

export const MainInfoCard = ({ temp }) => {
  return (
    <div className="flex flex-col p-1 border border-gray-gray6 rounded-lg !h-fit">
      <div className="flex overflow-hidden">
        {temp?.type && (
          <div className="flex gap-2 ps-2 h-10">
            <ProfileDisplay
              Component={temp.type}
              componentProps={{ url: temp.url }}
            />
          </div>
        )}
        <div className="flex gap-2 ps-2 w-full h-10">
          <TextContainer label={temp.label} record={temp.record} />
        </div>
      </div>

      <div className="flex justify-end items-start gap-2 px-2 h-fit">
        {temp.formUrl && (
          <CustomButtonWithIcons
            icon1={<CirclePlus config={{ width: 20, height: 20 }} />}
            icon2={<FilledCirclePlus config={{ width: 20, height: 20 }} />}
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

const ProfileDisplay = ({
  Component,
  componentProps,
}: {
  Component: any;
  componentProps: any;
}) => {
  return (
    <div className="flex justify-center items-center bg-main-white rounded-md overflow-hidden">
      <Component {...componentProps} />
    </div>
  );
};

export const ProfileImg: FC<ProfileDisplayProps> = ({
  url,
  expirationTime,
}) => {
  const [disableImage, setDisableImage] = useState(false);
  const imgBugHandler = () => {
    setDisableImage(true);
  };

  return (
    <div className="bg-gray-gray5 rounded-full overflow-hidden">
      {disableImage ? (
        <ProfileIcon />
      ) : (
        <Image
          onError={imgBugHandler}
          src={url}
          alt="Profile Image"
          width={40}
          height={40}
        />
      )}
    </div>
  );
};

const TextContainer = ({ label, record }) => {
  const t = useTranslations();
  return (
    <div className="flex flex-col justify-center gap-1 w-full overflow-hidden">
      <div className="overflow-hidden text-gray-gray9 text-xs text-ellipsis whitespace-nowrap">
        {label}
      </div>
      <div className="text-2xs text-gray-gray7 whitespace-nowrap">
        <span className="px-1 text-gray-gray10">{record}</span>{" "}
        {t(`receiptsAndPayments.todayDocuments`)}
      </div>
    </div>
  );
};

const CustomButtonWithIcons = ({ icon1, icon2, form = null, list = null }) => {
  const initializePage = useInitializePage();
  const t = useTranslations();

  const handleRouting = () => {
    console.log("handleRouting")
    if (form) {
      initializePage({
        config: {
          RepoId: form.formRepoId,
          SystemId: form.formSystemId,
          url: `${form.formUrl}`,
          originalPageState: PageStateEnum.Opened,
          pageState: PageStateEnum.Opened,
          keyName: form.keyName,
          keyValue: form.keyValue,
          caption: form.label,
          data:form
        },
      });
    } else {
      initializePage({
        config: {
          RepoId: list.listRepoId,
          SystemId: list.listSystemId,
          url: list.listUrl,
          data: list,
          originalPageState: PageStateEnum.Opened,
          pageState: PageStateEnum.Opened,
          keyName: list.keyName,
          keyValue: list.keyValue,
          caption: `${t("general.list")} ${list.label}`,
        },
      });
    }
  };

  return (
    <CustomButton
      type="text"
      className="group relative active:!bg-transparent m-0 -mt-3 mb-1 p-0 rounded-full w-6 h-6"
      onClick={handleRouting}
    >
      <div className="absolute inset-0 flex justify-center items-center group-hover:opacity-0 transition-opacity duration-300">
        {icon1}
      </div>
      <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {icon2}
      </div>
    </CustomButton>
  );
};
