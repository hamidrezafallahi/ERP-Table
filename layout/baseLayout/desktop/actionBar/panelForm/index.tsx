import {
  ReactNode,
  useEffect,
  useState,
} from 'react';

import {
  Skeleton,
  TourProps,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomModal,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  InfoIcon,
  Link,
  UserCheck,
} from '@components/atoms/iconComponents';
import AssignForm from '@components/molecules/forms/AssignForm';
import GuidanceButton from '@components/molecules/guidanceButton';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  FormImage,
} from '@layout/baseLayout/desktop/actionBar/panelForm/formImage';
import { useGetData } from '@services/base';
import { setMinimize as setMinimizeAction } from '@slice/container/index';

import Bookmarker from './bookmarker';
import ShortcutsCollapse from './shortcutCollapse';
import TagCollapse from './tagCollapse';
import Uploader from './uploader';

interface Content {
  title: ReactNode;
  content: ReactNode;
}
export default function PanelForm() {
  const dispatch = useDispatch();
  const setMinimize = () => {
    dispatch(setMinimizeAction(false));
  };

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<Content>();
  const t = useTranslations();
  const params = useSearchParams();
  const isEditMode = !!params.get("id");
  const { activePage, minimize } = useAppSelector(
    (state) => ({
      minimize: state.withoutPersist.container.minimize,
      activePage: state?.withPersist?.pages?.find((item) => item.isActive),
    }),
    shallowEqual,
  );

  const RefId = Number(params.get("id"));
  const [modalTitle, setModalTitle] = useState(t("sidebar.drag"));
  const [attachmentsCount, setAttachmentsCount] = useState(0);
  const { data, isLoading, refetch } = useGetData<null, null>({
    url: "/api/file/select/file",
    body: {
      RepoId: activePage.RepoId,
      RefId,
      PagingInfo: {
        PageRecordCount: 10000,
        PageNumber: 1,
        OnlyTotalCount: true,
      },
    },
    skip: !RefId,
  });

  const Assign = {
    title: (
      <div className="font-extrabold text-black-black5 text-base">
        {t("sidebar.assign")}
      </div>
    ),
    content: <AssignForm />,
  };
  const attachment = {
    title: (
      <div className="font-extrabold text-black-black5 text-base">
        {modalTitle}
      </div>
    ),
    content: (
      <Uploader
        setModalTitle={setModalTitle}
        counterRefetch={refetch}
        RepoId={activePage.RepoId}
        RefId={RefId}
      />
    ),
  };
  const keyActionHelp = [
    {
      key: "1",
      label: t("general.save"),
      extra: "Alt + S",
      className: "bg-white !cursor-help dark:bg-gray-gray11",
    },
    {
      key: "2",
      label: t("formToolbar.saveAndNew"),
      extra: "Alt + C",
      className: "bg-white !cursor-help dark:bg-gray-gray11",
    },
    {
      key: "3",
      label: t("general.new"),
      extra: "Alt + N",
      className: "bg-white !cursor-help dark:bg-gray-gray11",
    },
    {
      key: "4",
      label: t("formToolbar.revalidate"),
      extra: "Alt + R",
      className: "bg-white !cursor-help dark:bg-gray-gray11",
    },
    {
      key: "5",
      label: t("general.fullScreenMode"),
      extra: "Alt + Y",
      className: "bg-white !cursor-help dark:bg-gray-gray11",
    },
    {
      key: "6",
      label: t("general.formFocus"),
      extra: "Alt + B",
      className: "bg-white !cursor-help dark:bg-gray-gray11",
    },
    {
      key: "7",
      label: t("general.searchMenuFocus"),
      extra: "Alt + F",
      className: "bg-white !cursor-help dark:bg-gray-gray11",
    },
    {
      key: "8",
      label: t("general.menuFocus"),
      extra: "Alt + M",
      className: "bg-white !cursor-help dark:bg-gray-gray11",
    },
  ];
  const guidanceTour: TourProps["steps"] = [
    {
      title: t("general.keyboardOperationGuide"),
      description: t("general.thisSectionExplainsKeyboardOperations"),
      target: () => document.getElementById("keyActionHelp"),
    },
    {
      title: t("general.closeButtonGuide"),
      description: t("general.usingThisSectionYouCanCloseThePage"),
      target: () => document.getElementById("closeButton"),
    },
    {
      title: t("general.fullScreenGuide"),
      description: t(
        "general.usingThisSection,youCanViewThePageContentInFullScreen",
      ),
      target: () => document.getElementById("fullScreenMode"),
    },
    {
      title: t("general.guideToFormActions"),
      description: t("general.youCanDoSomeFormActionsUsingThisSection"),
      target: () => document.getElementById("formActions"),
    },
    {
      title: t("general.selectFormType"),
      description: t(
        "general.usingThisSection,youCanSelectAndViewOneOfTheAvailableForms",
      ),
      target: document.getElementById("chooseTypeForm"),
    },
    {
      title: t("general.reportButtonGuide"),
      description: t("general.usingThisSectionYouCanViewTheReportOfThePage"),
      target: () => document.getElementById("reportButton"),
    },
    {
      title: t("general.printButtonGuide"),
      description: t("general.usingThisSectionYouCanPrintThePage"),
      target: () => document.getElementById("printButton"),
    },
    {
      title: t("general.nextRecord"),
      description: t("general.usingThisSectionYouCanViewTheNextRecord"),
      target: () => document.getElementById("nextRecord"),
    },
    {
      title: t("general.previousRecord"),
      description: t("general.usingThisSectionYouCanViewThePreviousRecord"),
      target: () => document.getElementById("previousRecord"),
    },

    {
      title: t("general.updateGuide"),
      description: t("general.usingThisSectionYouCanUpdateTheContentOfThePage"),
      target: () => document.getElementById("reload"),
    },
    {
      title: t("general.help"),
      description: t("general.youCanAddANewItemUsingThisSection"),
      target: () => document.getElementById("newRecord"),
    },
    {
      title: t("general.saveAndNewButtonGuide"),
      description: t(
        "general.usingThisSection,youCanCreateNewContentAndRestoreContent",
      ),
      target: () => document.getElementById("SavePlus"),
    },
  ];
  const openAttachmentFormModal = () => {
    setOpenModal(true);
    setModalContent(attachment);
  };
  const openAssignFormModal = () => {
    setOpenModal(true);
    setModalContent(Assign);
  };

  const closeModal = () => {
    setOpenModal(false);
    setModalContent(null);
  };

  useEffect(() => {
    if (data?.Result === "Success") {
      setAttachmentsCount(data.TotalCount);
    }
  }, [data]);

  const withImage = activePage?.withImage;
  return (
    <>
      {!isEditMode ? (
        minimize ? (
          <InfoIcon />
        ) : (
          <div className="text-blue-blue5 text-sm text-center">
            {t("sidebar.noContent")}
          </div>
        )
      ) : (
        <>
          <div
            className={` flex flex-col gap-6 !h-full ${
              minimize
                ? " items-center justify-start"
                : " overflow-x-hidden overflow-y-auto"
            }`}
          >
            {withImage && <FormImage minimize={minimize} />}
            <Bookmarker minimize={minimize} />
            <CustomButton
              type="text"
              className={`hover:!bg-transparent ${
                minimize ? "justify-center" : "flex justify-between  p-0 w-full"
              }`}
              onClick={openAssignFormModal}
            >
              <div className="flex items-center gap-2">
                <span title="اختصاص">
                  {minimize ? (
                    <UserCheck config={{ width: 28, height: 28 }} />
                  ) : (
                    <UserCheck />
                  )}
                </span>
                <span
                  className={` ${
                    minimize
                      ? "hidden"
                      : "text-gray-gray85 hover:text-main-black text-sm transition-all duration-300 dark:text-white "
                  } `}
                >
                  {t("sidebar.assign")}
                </span>
              </div>
            </CustomButton>
            {isLoading ? (
              <Skeleton.Input active={true} block className="z-50 relative" />
            ) : (
              <CustomButton
                type="text"
                className={`hover:!bg-transparent  ${
                  minimize
                    ? "justify-center"
                    : "flex justify-between p-0 w-full"
                }`}
                onClick={openAttachmentFormModal}
              >
                <div className="flex items-center gap-2">
                  <span title="ضمیمه">
                    {minimize ? (
                      <Link config={{ width: 28, height: 28 }} />
                    ) : (
                      <Link />
                    )}
                  </span>
                  <span
                    className={` ${
                      minimize
                        ? "hidden"
                        : "text-gray-gray85 hover:text-main-black text-sm transition-all duration-300 dark:text-white "
                    }`}
                  >
                    {t("sidebar.attachment")}
                  </span>
                  <span
                    className={`flex justify-center ${
                      minimize && "hidden"
                    } items-center bg-state-success2 shadow rounded-sm w-6 h-5 text-logo-green6`}
                  >
                    {attachmentsCount}
                  </span>
                </div>
              </CustomButton>
            )}
            <TagCollapse minimize={minimize} setMinimize={setMinimize} />
            <div className="flex flex-col gap-6 pt-2">
              <CustomTooltip title={t("general.guide")}>
                <GuidanceButton
                  tourStepItems={guidanceTour}
                  minimize={minimize}
                />
              </CustomTooltip>
              <ShortcutsCollapse
                minimize={minimize}
                setMinimize={setMinimize}
                keyActionHelp={keyActionHelp}
              />
            </div>
          </div>

          <CustomModal
            contentClassName={`lg:!min-w-[520px] lg:h-full !min-w-max w-[800px] !max-h-[600px] rounded-b-lg overflow-hidden `}
            className="!top-[50px]"
            closeModal={closeModal}
            isModalOpen={openModal}
            headerName={t("sidebar.modalUpload")}
            headerDescription={modalTitle}
            content={modalContent?.content}
            {...(modalContent?.title ? { title: modalContent.title } : {})}
          />
        </>
      )}
    </>
  );
}
