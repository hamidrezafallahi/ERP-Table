import {
  useEffect,
  useState,
} from 'react';

import {
  Divider,
  Dropdown,
  MenuProps,
  Skeleton,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  DatabaseCheck,
  DownChevron,
  Level1,
  Level10,
  Level11,
  Level12,
  Level13,
  Level2,
  Level3,
  Level4,
  Level5,
  Level6,
  Level7,
  Level8,
  Level9,
  SpinIcon,
} from '@components/atoms/iconComponents';
import { useInitializePage } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import { setParentPageId } from '@slice/config';
import {
  setLevelFromToolbar,
  setRepoViewIdViewData,
  setViewData,
} from '@slice/pages';
import type { ISelectOption } from '@type/elementType';

function ReportToolbar() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
    }),
    shallowEqual
  );
  const initializePage = useInitializePage();
  const dispatch = useDispatch();

  const setLevel = (level) => {
    dispatch(
      setLevelFromToolbar({
        currentLevel: activePage?.viewData?.Level,
        nextLevel: level,
      })
    );
  };

  const levelComponents = [
    Level1,
    Level2,
    Level3,
    Level4,
    Level5,
    Level6,
    Level7,
    Level8,
    Level9,
    Level10,
    Level11,
    Level12,
    Level13,
  ];

  const lvlButtons = levelComponents.map((Component, index) => ({
    icon:
      activePage?.viewData?.Level == index || activePage?.viewData?.TreeView ? (
        <Component key={index} config={{ stroke: "#ddd" }} />
      ) : (
        <Component />
      ),
    name: "",
    Level: index,
  }));
  // .reverse();

  const handleShowTransaction = () => {
    setLoading(true);
    dispatch(setParentPageId({ parentPageId: activePage.pageId }));

    initializePage({
      config: {
        RepoId: activePage.RepoId,
        SystemId: activePage.SystemId,
        url: `${activePage.listUrl}`,
      },
    });
  };

  return (
    <div className="flex gap-2">
      <ReportDropdown activePage={activePage} />
      <FacilitiesDropdown />
      <div className="flex items-center gap-2">
        {activePage?.viewData?.AccessLevelLoading ? (
          <>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="rounded-lg w-8 h-8 overflow-hidden">
                <Skeleton.Input active block className="m-0 p-0" />
              </div>
            ))}
          </>
        ) : (
          <>
            <CustomTooltip title={t("report.toolbar.showTransaction")}>
              <CustomButton
                onClick={handleShowTransaction}
                type="text"
                ghost
                className="m-0 p-1 w-9 h-9"
              >
                {loading ? <SpinIcon /> : <DatabaseCheck />}
              </CustomButton>
            </CustomTooltip>

            <Divider type="vertical" className="m-0 p-0" />
            <div className="flex flex-row-reverse gap-2">
              {activePage?.viewData?.AccessLevel &&
                lvlButtons.map((item, index) => {
                  if (index < activePage?.viewData?.AccessLevel) {
                    return (
                      <CustomTooltip
                        key={index}
                        title={t(`report.sidebar.level${item.Level + 1}`)}
                      >
                        <CustomButton
                          key={index}
                          disabled={
                            item.Level == activePage?.viewData?.Level ||
                            activePage?.viewData?.TreeView
                          }
                          type="text"
                          ghost
                          className="m-0 p-1 w-9 h-9"
                          onClick={() => {
                            setLevel(item.Level);
                          }}
                        >
                          {item.icon}
                        </CustomButton>{" "}
                      </CustomTooltip>
                    );
                  }
                  return null;
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportToolbar;

const ReportDropdown = ({ activePage }) => {
  const t = useTranslations();
  const [display, setDisplay] = useState(t("report.toolbar.reportType"));
  const dispatch = useDispatch();
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div className="text-gray-gray10 dark:text-white text-xs">
          {t("report.toolbar.accountReport")}
        </div>
      ),
      onClick: () => {
        dispatch(
          setViewData({
            ...activePage?.viewData,
            url: "/api/acc/select/repReviewGroh",
            Level: 0,
            TreeView: false,
            steps: [],
            selectedItems: [],
            FilterIds: [],
          })
        );
        setDisplay(t("report.toolbar.accountReport"));
      },
    },
    {
      key: "2",
      label: (
        <div className="text-gray-gray10 dark:text-white text-xs">
          {t("report.toolbar.followup")}
        </div>
      ),
      onClick: () => {
        dispatch(
          setViewData({
            ...activePage?.viewData,
            url: "api/acc/select/repReviewReferDate",
            TreeView: false,
            steps: [],
            selectedItems: [],
            FilterIds: [],
          })
        );
        setDisplay(t("report.toolbar.followup"));
      },
    },
    {
      key: "3",
      label: (
        <div className="text-gray-gray10 dark:text-white text-xs">
          {t("report.toolbar.treediagram")}
        </div>
      ),
      onClick: () => {
        dispatch(
          setViewData({
            ...activePage?.viewData,
            url: "/api/acc/select/repReviewGroh",
            TreeView: true,
            Level: 0,
            steps: [],
            selectedItems: [],
            FilterIds: null,
          })
        );
        setDisplay(t("report.toolbar.treediagram"));
      },
    },
    {
      key: "4",
      label: (
        <div className="text-gray-gray10 dark:text-white text-xs">
          {t("report.toolbar.detailedperformance")}
        </div>
      ),
      onClick: () => {
        setDisplay(t("report.toolbar.detailedperformance"));
      },
    },
  ];
  return (
    <Dropdown menu={{ items }}>
      <CustomButton
        type="text"
        ghost
        className="flex gap-2 bg-gray-gray2 dark:bg-gray-gray10 m-0 p-1 border border-gray-gray5 h-full text-gray-gray10 dark:text-white text-xs"
      >
        <div>{display}</div>
        <DownChevron />
      </CustomButton>
    </Dropdown>
  );
};
const FacilitiesDropdown = () => {
  const t = useTranslations();
  const [items, setItems] = useState();
  const [display, setDisplay] = useState(t("report.toolbar.simple"));
  const { direction } = useAppSelector(
    (state) => ({
      direction: state.withPersist.config.direction,
    }),
    shallowEqual
  );
  const dispatch = useDispatch();
  const { data, isFetching } = useGetData<ISelectOption[], null>({
    url: "/api/acc/select/ReportType",
    body: {},
  });
  useEffect(() => {
    if (data?.Result == "Success") {
      const temp = data?.Data?.map((item) => ({
        key: item._SelectDisplay,
        label: (
          <div className="text-gray-gray10 dark:text-white text-xs">
            {item._SelectDisplay}
          </div>
        ),
        onClick: () => {
          dispatch(
            setRepoViewIdViewData({
              RepoViewId: item._SelectId,
            })
          );
          setDisplay(item._SelectDisplay);
        },
      }));
      setItems(temp as any);

    }
  }, [data, isFetching]);
  return (
    <Dropdown
    
      menu={{ items }}
      destroyOnHidden
      placement={direction == "rtl" ? "bottomRight" : "bottomLeft"}
    >
      <div className="flex items-center gap-2 bg-gray-gray2 dark:bg-gray-gray10 m-0 p-1 border border-gray-gray5 rounded-lg h-full text-gray-gray10 dark:text-white text-xs">
        {display}
        <DownChevron />
      </div>
    </Dropdown>
  );
};
