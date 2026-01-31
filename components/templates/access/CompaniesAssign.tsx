import {
  useEffect,
  useState,
} from 'react';

import {
  Dropdown,
  MenuProps,
  Skeleton,
} from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import {
  Close,
  DownChevron,
} from '@components/atoms/iconComponents';
import { useDarkMode } from '@hooks/custom';
import { useGetData } from '@services/base';
import type {
  IRequest,
  IRolePlace,
} from '@services/systemManagement/role/type';

import { ISystemId } from './type';

const systemIds: ISystemId[] = [
  {
    id: 1,
    label: "شرکت شماره یک",
    value: 204,
    hasAccess: false,
  },
  {
    id: 2,
    label: "شرکت شماره دو",
    value: 106,
    hasAccess: true,
  },
  {
    id: 3,
    label: "شرکت شماره سه",
    value: 208,
    hasAccess: true,
  },
];

function CompaniesAssign({ ...props }) {
  const { mode = "light" } = useDarkMode();

  const { id } = props;
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [exceptList, setExceptList] = useState([]);
  const [changeExcept, setChangeExcept] = useState([]);

  const { data, isLoading, isSuccess } = useGetData<IRolePlace[], IRequest>({
    url: "api/auth/select/rolePlace",
    body: {
      RoleId: id,
    },
  });
  useEffect(() => {
    if (data?.Data?.[0]?.PlaceAccesses && isSuccess) {
      setExceptList(
        data?.Data?.[0]?.PlaceAccesses.map((item) => ({
          label: item.PlaceDesc,
          hasAccess: item.HasAccess,
          id: item.PlaceDesc,
        }))
      );
    }
  }, [data]);

  const detailDropChange = async (e) => {
    setChangeExcept((prevState) => {
      const itemExists = prevState.some((item) => item.id === e.id);
      if (itemExists) {
        return prevState.filter((item) => item.id !== e.id);
      } else {
        return [...prevState, e];
      }
    });
  };
  const detailDrop = exceptList.map((item) => ({
    label: item.label,
    key: item.id,
    icon: (
      <InnerCheckBox
        onChange={detailDropChange}
        checked={item.hasAccess}
        id={item.id}
        label={item.label}
      />
    ),
  }));
  const submitHandler = () => {
    console.log(changeExcept);
    // setOpen(false);
    // handleSubmit(exceptList)
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <>
          <div className="flex flex-col justify-end w-full">
            <Header setOpen={setOpen} />
            <div className="flex flex-col gap-2 bg-gray-gray05 dark:bg-gray-gray95 px-2 py-3 w-56 max-h-52 overflow-x-hidden overflow-y-auto">
              {detailDrop.map((item, index) => (
                <div key={index} className="flex gap-2">
                  {item.icon}
                  <div className="flex items-center w-full overflow-hidden font-normal text-2xs text-gray-gray9 dark:text-white text-ellipsis whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            <Footer submitHandler={submitHandler} />
          </div>
        </>
      ),
    },
  ];

  return (
    <Dropdown
      trigger={["click"]}
      open={open}
      placement="bottomRight"
      className={`text-xs bg-gray-gray1 dark:bg-gray-gray95 flex ${
        false ? "" : "px-3 border border-main-black"
      }  gap-[4px] !items-center !w-fit  rounded text-main-black dark:text-white`}
      menu={{ items }}
    >
      <CustomButton
        type="text"
        className=""
        onClick={() => {
          setOpen(!open);
        }}
      >
        {isLoading ? (
          <div className="rounded w-fit overflow-hidden">
            <Skeleton.Input active={true} className="!p-0" />
          </div>
        ) : (
          <div className="flex justify-center items-center gap-2">
            <span className="text-xs">{t("general.companiesAssignment")}</span>
            <DownChevron
              config={{ stroke: mode === "dark" ? "#FBFBFB" : "#000" }}
            />
          </div>
        )}
      </CustomButton>
    </Dropdown>
  );
}

export default CompaniesAssign;

const Header = ({ setOpen }) => {
  return (
    <div className="flex gap-8 p-2 border-b">
      <div className="w-full font-medium">شرکت ها</div>
      <div className="">
        <CustomButton
          type="text"
          ghost
          className="hover:!bg-transparent m-0 p-0 cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <Close config={{ width: 16, height: 16 }} />
        </CustomButton>
      </div>
    </div>
  );
};
const Footer = ({ submitHandler }) => {
  return (
    <div className="flex justify-end px-2 py-3 border-t">
      <CustomButton
        type="text"
        ghost
        onClick={() => {
          submitHandler();
        }}
        className="bg-main-black hover:bg-main-white hover:border-main-black w-fit text-main-white hover:text-main-black"
      >
        اعمال
      </CustomButton>
    </div>
  );
};

const InnerCheckBox = ({ onChange, checked, id, label }) => {
  const [tick, setTick] = useState(checked);

  const handleChange = (e) => {
    const temp = {
      checked: e.target.checked,
      id,
      label,
    };
    setTick(e.target.checked);
    onChange(temp);
  };

  return <CustomCheckbox onChange={handleChange} checked={tick} />;
};
