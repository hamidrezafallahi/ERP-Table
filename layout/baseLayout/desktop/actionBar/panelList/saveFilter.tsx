import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import {
  Collapse,
  Skeleton,
} from 'antd';
import { CollapseProps } from 'antd/lib';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  Close,
  DownChevron,
  SavedFilterIcon,
  SpinIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { setViewData } from '@slice/pages';
import { getSystemNameById } from '@utils/core';

interface IProps {
  minimize?: boolean;
  setMinimize?: Dispatch<SetStateAction<boolean>>;
}
export default function SaveFilter({ ...props }: IProps) {
  const { minimize, setMinimize } = props;

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state?.withPersist?.pages?.find(
        (item) => item.isActive === true
      ),
    }),
    shallowEqual
  );
  const t = useTranslations();
  const FullSearchPhrase = activePage?.viewData?.FullSearchPhrase?.length > 0;
  const ShowOnlyBookmarked = activePage?.viewData?.Filters?.ShowOnlyBookmarked;
  const TagIdsFilter = activePage?.viewData?.Filters?.TagIdsFilter?.length > 0;
  const FilterInfo = activePage?.viewData?.Filters?.FilterInfo?.length > 0;
  const anyConditionIsTrue =
    FullSearchPhrase || ShowOnlyBookmarked || TagIdsFilter || FilterInfo;
  const [collapseSavedFilters, setCollapseSavedFilters] = useState(true);
  const [options, setOptions] = useState([]);
  //TODO: add type
  const {
    data: savedFilterResponse,
    isSuccess: savedFilterGetIsSuccess,
    isLoading,
    refetch,
  } = useGetData<any, any>({
    url: `/api/${getSystemNameById(activePage.SystemId)}/select/userFilter`,
    body: {
      RepoId: activePage.RepoId,
    },
  });

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: (
        <CollapseLabel
          setMinimize={setMinimize}
          minimize={minimize}
          setCollapseSavedFilters={setCollapseSavedFilters}
          collapseSavedFilters={collapseSavedFilters}
        />
      ),
      children: (
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            collapseSavedFilters
              ? "max-h-full  opacity-100 "
              : "max-h-0 opacity-0"
          }
           ${minimize && "hidden"}
          `}
        >
          <div className="flex flex-col gap-4 first:gap-2">
            {anyConditionIsTrue ? (
              <>
                <div
                  className={`${
                    minimize ? "hidden" : "text-3xs text-blue-blue4"
                  }`}
                >
                  {t("sidebar.saveFilterHint")}
                </div>
                <SaveNewFilter activePage={activePage} refetch={refetch} />
              </>
            ) : (
              <div
                className={`${
                  minimize ? "hidden" : "text-3xs text-blue-blue4"
                }`}
              >
                {t("sidebar.noFilterToSave")}
              </div>
            )}
            <RenderFilters
              options={options}
              activePage={activePage}
              refetch={refetch}
            />
          </div>
        </div>
      ),
      showArrow: false,
    },
  ];
  useEffect(() => {
    if (savedFilterResponse && savedFilterGetIsSuccess) {
      if (savedFilterResponse?.Data?.length > 0) {
        setCollapseSavedFilters(true);
      }
      const temp = [];
      savedFilterResponse.Data?.map((item) => {
        const option = {
          title: item.UserFilterDesc,
          id: item.UserFilterId,
          value: JSON.parse(item.FilterExpression),
          isShowToEveryone: true,
        };
        temp.push(option);
      });
      setOptions(temp);
    }
  }, [savedFilterResponse, savedFilterGetIsSuccess]);

  return (
    <>
      {isLoading ? (
        <Skeleton.Button
          active={true}
          size={"default"}
          shape={"default"}
          block={true}
        />
      ) : (
        <Collapse
          className={`[&>.ant-collapse-item>.ant-collapse-header]:!p-[1px] !text-sm relative w-full  h-full`}
          defaultActiveKey={["1"]}
          rootClassName=""
          style={{
            backgroundColor: "white",
            padding: 0,
            margin: 0,
          }}
          items={items}
          bordered={false}
        />
      )}
    </>
  );
}
const CollapseLabel = ({
  setCollapseSavedFilters,
  collapseSavedFilters,
  minimize,
  setMinimize,
}) => {
  const t = useTranslations();

  return (
    <div
      className={`flex items-center   ${
        minimize ? " justify-center" : " justify-between  "
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setCollapseSavedFilters(!collapseSavedFilters);
        setMinimize?.(false);
      }}
    >
      <div
        className={`flex items-center gap-2 text-gray-gray10 dark:text-white    `}
        title="فیلتر های ذخیره شده"
      >
        <SavedFilterIcon config={{ width: 22, height: 22 }} />
        {!minimize && (
          <>
            <span className="text-sm text-nowrap">
              {t("sidebar.savedFilters")}
            </span>
            <span
              className={` ${
                collapseSavedFilters &&
                "rotate-180 transition-transform duration-200 ease-in-out"
              }
          `}
            >
              <DownChevron />
            </span>
          </>
        )}
      </div>
    </div>
  );
};
const SaveNewFilter = ({ activePage, refetch }) => {
  const t = useTranslations();
  const [saveFilterDesc, setSaveFilterDesc] = useState({
    title: "",
    publish: false,
  });
  const [trigger, { isLoading }] = useCUDDataMutation();
  const handleSaveFilter = async () => {
    //TODO : check please without refetch
    try {
      const saveFilterResponse = await trigger({
        url: `/api/${getSystemNameById(activePage.SystemId)}/insert/userFilter`,
        body: {
          RepoId: activePage.RepoId,
          UserFilterDesc: saveFilterDesc.title,
          FilterExpression: JSON.stringify(activePage.viewData),
          IsShowToEveryOne: saveFilterDesc.publish,
        },
      }).unwrap();

      if (saveFilterResponse?.Result === "Success") {
        refetch();
        setSaveFilterDesc({ title: "", publish: false });
      }
    } catch (err) {
      null;
    }
  };

  const handleTitleChange = (e) => {
    setSaveFilterDesc({ ...saveFilterDesc, title: e.target.value });
  };
  const handlePublish = (e) => {
    setSaveFilterDesc({ ...saveFilterDesc, publish: e.target.checked });
  };
  return (
    <div className="flex flex-col gap-2 h-full">
      <InputText
        onChange={handleTitleChange}
        value={saveFilterDesc?.title}
        className="w-full"
      />
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center gap-2">
          <CustomCheckbox
            onChange={(e) => {
              handlePublish(e);
            }}
            checked={saveFilterDesc?.publish}
          />
          <div className="w-16 text-3xs text-gray-gray9">
            {t("sidebar.showPublish")}
          </div>
        </div>
        <CustomButton
          disabled={isLoading}
          type="text"
          className="flex justify-center items-center bg-black-black8 !hover:bg-white px-3 py-1 border hover:border-black-black8 rounded h-full text-[10px] text-white"
          onClick={handleSaveFilter}
        >
          {isLoading ? (
            <SpinIcon
              config={{
                width: 24,
                height: 16,
              }}
            />
          ) : (
            t("general.save")
          )}
        </CustomButton>
      </div>
    </div>
  );
};
const RenderFilters = ({ options, refetch, activePage }) => {
  const dispatch = useDispatch();
  const [loadingForDelete, setLoadingForDelete] = useState("");
  const [trigger] = useCUDDataMutation();

  const handlerSetFilter = (savedFilter) => {
    dispatch(setViewData(savedFilter));
  };
  const handlerDeleteFilter = async (deleteFilter) => {
    setLoadingForDelete(deleteFilter.title);
    try {
      //TODO : check please without refetch
      const deleteFilterResponse = await trigger({
        url: `/api/${getSystemNameById(activePage.SystemId)}/delete/userFilter`,
        body: {
          Id: deleteFilter.id,
          RepoId: activePage.RepoId,
        },
      }).unwrap();

      if (deleteFilterResponse?.Result === "Success") {
        refetch();
      }
    } catch (err) {
      null;
    }
    setLoadingForDelete("");
  };

  return (
    <div className="flex flex-col gap-2">
      {options.map((option, index) => (
        <div
          key={index}
          className="flex justify-between items-center gap-3 w-full h-10"
        >
          <CustomButton
            type="text"
            onClick={() => {
              handlerSetFilter(option.value);
            }}
            className="flex justify-start border border-gray-gray6 hover:border-gray-gray10 w-full h-full overflow-hidden text-gray-gray9 text-xs text-end text-ellipsis hover:text-clip"
          >
            {option.title}
          </CustomButton>
          <CustomButton
            disabled={option.title == loadingForDelete}
            type="text"
            className="flex justify-center items-center p-0 border border-gray-gray6 hover:border-gray-gray10 !w-14 h-full"
            onClick={() => {
              handlerDeleteFilter(option);
            }}
          >
            {option.title == loadingForDelete ? (
              <SpinIcon
                config={{
                  width: 8,
                  height: 8,
                }}
              />
            ) : (
              <Close
                config={{
                  width: 8,
                  height: 8,
                }}
              />
            )}
          </CustomButton>
        </div>
      ))}
    </div>
  );
};
