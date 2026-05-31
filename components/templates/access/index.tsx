import React, {
  useEffect,
  useState,
} from 'react';

import {
  MenuProps,
  Skeleton,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomDropdownButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  DownChevron,
  TickIcon,
} from '@components/atoms/iconComponents';
import ExpandedButton from '@components/molecules/expandedButton';
import SaveButton from '@components/templates/access/saveButton';
import { IBody } from '@components/templates/access/saveButton/type';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import { addNewPage } from '@slice/pages';

import AccessTable from './AccessTable';
import CompaniesAssign from './CompaniesAssign';
import Helper from './helper';
import {
  IRequest,
  ISystemId,
  ISystems,
} from './type';

const systemIds: ISystemId[] = [
  {
    id: 1,
    label: "سلیمانی شرکت",
    value: 204,
    hasAccess: false,
  },
  {
    id: 2,
    label: "عبداملکی شرکت",
    value: 106,
    hasAccess: true,
  },
  {
    id: 3,
    label: "فلاحی شرکت",
    value: 208,
    hasAccess: true,
  },
];

function AccessTemplate() {
  const dispatch = useDispatch();

  const { lang, match, initPage } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
      match: state.withPersist.config.initMatch,
      initPage: state.withPersist.init,
    }),
    shallowEqual
  );
  const { pageId, RepoId, SystemId, url, Id, pageState, originalPageState } =
    initPage;
  const initBody: IBody = {
    ReturnInsertedRow: false,
    RoleId: Id,
    RoleActions: [],
    Places :[]
  };
  const [body, setBody] = useState<IBody>(initBody);
  const [systemId, setSystemId] = useState<number>(null);
  const [options, setOptions] = useState<ISystemId[]>(null);
  const [resetData, setResetData] = useState<number>(0);
  const { data, isLoading } = useGetData<ISystems[], IRequest>({
    url: "/api/mng/select/systemAccount",
    body: {},
  });

  useEffect(() => {
    if (data?.Result == "Success") {
      const temp: ISystemId[] = data.Data.map((item) => ({
        id: item.ManagmentAccountId,
        label: item.System.SystemDesc,
        value: item.SystemId,
        hasAccess: false,
      }));
      setOptions(temp);
      setSystemId(temp[0].value);
    }
  }, [data]);

  useEffect(() => {
    if (Id) {
      dispatch(
        addNewPage({
          pageId: pageId,
          caption: "title.access",
          icon: "AccessIcon",
          pageState,
          originalPageState,
          type: 3,
          RepoId,
          SystemId,
          url,
          pageData: [],
          pageInfo: {
            addEndpoint: "info",
            deleteEndpoint: "info",
            formIdField: "info",
            updateEndpoint: "updateEndpoint",
          },
        })
      );
    }
  }, [Id]);

  const t = useTranslations();

  const items: MenuProps["items"] = options?.map((item, index) => ({
    key: index,
    onClick: () => {
      setSystemId(item.value);
      setBody(initBody);
    },
    className: "!px-0",
    label: (
      <div className="flex items-center">
        <div className="!w-5"> {systemId == item.value && <TickIcon />}</div>
        {item.label}
      </div>
    ),
  }));
  const reBuildHandler = () => {
    setBody(initBody);
    setResetData(resetData + 1);
  };

  return (
    <div className="relative flex flex-col gap-3 w-full h-full">
      <div
        className={`min-w-fit h-9 flex gap-3 ${
          match && `absolute -top-[60px]   end-0`
        }`}
      >
        <CustomTooltip title={t("general.fullScreenMode")}>
          <ExpandedButton />
        </CustomTooltip>
        <CompaniesAssign id={Id} setBody={setBody} />

        <SaveButton
          disable={body.RoleActions.length == 0 && body.Places.length == 0}
          saveHandler={reBuildHandler}
          body={body}

        />
        <div />
      </div>
      <div className="flex flex-row-reverse gap-3 w-full">
        <Helper />
        <CustomDropdownButton
          trigger={["click"]}
          placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
          className={`text-xs bg-gray-gray1 dark:bg-gray-gray95  flex ${
            isLoading ? "" : "px-3 border border-main-black dark:border-white"
          }  gap-[4px] !items-center !w-28  rounded text-main-black dark:text-white`}
          items={items}
          open={true}
        >
          {isLoading ? (
            <div className="rounded w-fit overflow-hidden">
              <Skeleton.Input active={true} className="!p-0" />
            </div>
          ) : (
            <div className="flex cursor-pointer">
              <span className="text-xs">{t("general.systems")}</span>
              <DownChevron />
            </div>
          )}
        </CustomDropdownButton>
      </div>
      {systemId && (
        <AccessTable
          id={Id}
          setBody={setBody}
          systemId={systemId}
          systemIds={systemIds}
          resetData={resetData}
        />
      )}
    </div>
  );
}

export default AccessTemplate;
