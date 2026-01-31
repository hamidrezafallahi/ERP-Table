// "use client";
// import { useEffect, useReducer, useRef, useState } from "react";

// import { useTranslations } from "next-intl";
// import { shallowEqual, useDispatch } from "react-redux";

// import { CustomModal, CustomSpin } from "@components/atoms/defaultElements";
// import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
// import { New } from "@components/atoms/iconComponents";
// import Card from "@components/molecules/card";
// import Confirmation from "@components/molecules/confirmation";
// import DataGrid from "@components/molecules/dataGrid";
// import GoodExtraInfo from "@components/molecules/goodExtraInfo";
// import GoodVariantValues from "@components/molecules/goodVariantValues";
// import ListToolbar from "@components/organisms/listToolbar";
// import { useInitializePage } from "@customHook/useInitializePage";
// import Uploader from "@layout/partials/panelForm/attachmentModal/uploader";
// import { useAppSelector } from "@redux/index";
// import { useGetData, useGetInfinite } from '@services/base';
// import { useCUDDataMutation } from "@services/base/new";
// import { IBaseDto } from "@services/base/type";
// import { setPageState, setViewData } from "@slice/pages";
// import { addSpecificTags } from "@slice/tags";
// import type { IToolbarMenu } from "@type/toolbar";
// import { showInfoToast, showSuccessToast } from "@utils/core";

// import { PageStateEnum } from "../../../slice/pages/enum";
// import DynamicModal from "../dynamicModal";
// import { dynamicModalConfig } from "../dynamicModal/config";
// import { GridToolbar } from "../gridToolbar";
// import { ActionLabelsEnum } from "./enum";
// import type { Action, IProps, IState } from "./type";

// export default function List<T extends IBaseDto, K>({
//   url,
//   deleteUrl,
//   confirmUrl,
//   staticKey,
//   staticKeyII,
//   rowFieldKey,
//   additionalFieldKey,
//   recordPerPage,
//   formUrl,
//   addCaption,
//   repoId,
//   systemId,
//   baseRepoId,
//   conditionallyAction,
//   conditionalProperty,
//   EditField,
// }: IProps<T, K>) {
//   const t = useTranslations();
//   const initializePage = useInitializePage();
//   const observer = useRef<IntersectionObserver | null>(null);
//   const lastItemRef = useRef<HTMLDivElement | null>(null);
//   const [toolbarConfig, setToolbarConfig] = useState();
//   const [columnsList, setColumnsList] = useState();
//   const [selectedId, setSelectedId] = useState(null);
//   const [additionalValue, setAdditionalValue] = useState(null);
//   const [attachmentTitle, setAttachmentTitle] = useState(t("general.pictures"));
//   const [confirmMode, setConfirmMode] = useState<"Delete" | "Confirm">(
//     "Delete"
//   );
//   const [isSelectMode, setIsSelectMode] = useState(false);
//   const { activePage, direction } = useAppSelector((state) => {
//     const activePage = state.withPersist.pages.find(
//       (item) => item.isActive === true
//     );
//     const direction = state.withPersist.config.direction;

//     return { activePage, direction };
//   }, shallowEqual);

//   const toolbarData = activePage?.toolbarData;

//   useEffect(() => {
//     if (toolbarData?.List?.Config) {
//       setToolbarConfig(JSON.parse(toolbarData?.List?.Config));
//     }
//     const repoViewConfig =
//       toolbarData?.List?.ListProp &&
//       toolbarData?.List?.ListProp?.find(
//         (item) => item.Id === activePage?.viewData?.RepoViewId
//       );
//     if (repoViewConfig?.Config) {
//       setColumnsList(JSON.parse(repoViewConfig?.Config));
//     }
//   }, [
//     activePage?.viewData?.RepoViewId,
//     toolbarData?.List?.Config,
//     toolbarData?.List?.ListProp,
//   ]);

//   const {
//     data: gridTotal,
//     isFetching: totalIsFetching,
//     isLoading: totalIsLoading,
//   } = useGetData<null, null>({
//     url: url,
//     body: {
//       Filters: {
//         FilterInfo: activePage?.viewData?.Filters?.FilterInfo
//           ? activePage?.viewData?.Filters?.FilterInfo
//           : [],
//         ShowOnlyBookmarked: activePage?.viewData?.Filters?.ShowOnlyBookmarked
//           ? activePage?.viewData?.Filters?.ShowOnlyBookmarked
//           : false,
//         TagIdsFilter: activePage?.viewData?.Filters?.TagIdsFilter
//           ? activePage?.viewData?.Filters?.TagIdsFilter
//           : null,
//       },

//       RepoViewId: activePage?.viewData?.RepoViewId,
//       ShowMode: 10,
//       ShowTags: activePage?.viewData?.ShowTags
//         ? activePage?.viewData?.ShowTags
//         : true,
//       ShowBookmarked: activePage?.viewData?.ShowBookmarked
//         ? activePage?.viewData?.ShowBookmarked
//         : true,
//       PagingInfo: {
//         PageRecordCount: activePage?.viewData?.PagingInfo?.PageRecordCount
//           ? activePage?.viewData?.PagingInfo?.PageRecordCount
//           : 10,

//         OnlyTotalCount: true,
//       },
//       FullSearchPhrase: activePage?.viewData?.FullSearchPhrase
//         ? activePage?.viewData?.FullSearchPhrase
//         : "",
//     },
//     skip:
//       // !match ||
//       !activePage?.viewData?.RepoViewId || baseRepoId !== activePage.RepoId,
//   });
//   const { data: gridData, isFetching: gridIsLoading } = useGetData<T[], K>({
//     url: url,
//     body: {
//       Filters: {
//         FilterInfo: activePage?.viewData?.Filters?.FilterInfo
//           ? activePage?.viewData?.Filters?.FilterInfo
//           : [],
//         ShowOnlyBookmarked: activePage?.viewData?.Filters?.ShowOnlyBookmarked
//           ? activePage?.viewData?.Filters?.ShowOnlyBookmarked
//           : false,
//         TagIdsFilter: activePage?.viewData?.Filters?.TagIdsFilter
//           ? activePage?.viewData?.Filters?.TagIdsFilter
//           : null,
//       },
//       OrderInfo: activePage?.viewData?.OrderInfo
//         ? activePage?.viewData?.OrderInfo
//         : [],
//       RepoViewId: activePage?.viewData?.RepoViewId,
//       ShowMode: 10,
//       ShowTags: activePage?.viewData?.ShowTags
//         ? activePage?.viewData?.ShowTags
//         : true,
//       ShowBookmarked: activePage?.viewData?.ShowBookmarked
//         ? activePage?.viewData?.ShowBookmarked
//         : true,
//       PagingInfo: {
//         PageNumber: activePage?.viewData?.PagingInfo?.PageNumber
//           ? activePage?.viewData?.PagingInfo?.PageNumber
//           : 1,
//         PageRecordCount: activePage?.viewData?.PagingInfo?.PageRecordCount
//           ? activePage?.viewData?.PagingInfo?.PageRecordCount
//           : 10,
//       },
//       FullSearchPhrase: activePage?.viewData?.FullSearchPhrase
//         ? activePage?.viewData?.FullSearchPhrase
//         : "",
//     },
//     skip:
//       !match ||
//       !activePage?.viewData?.RepoViewId ||
//       baseRepoId !== activePage.RepoId,
//   });

//   const {
//     data: cardData,
//     isFetching: cardIsFetching,
//     isLoading: cardIsLoading,
//   } = useGetInfinite<T[], K>({
//     url: url,
//     body: {
//       Filters: {
//         FilterInfo: activePage?.viewData?.Filters?.FilterInfo
//           ? activePage?.viewData?.Filters?.FilterInfo
//           : [],
//         ShowOnlyBookmarked: activePage?.viewData?.Filters?.ShowOnlyBookmarked
//           ? activePage?.viewData?.Filters?.ShowOnlyBookmarked
//           : false,
//         TagIdsFilter: activePage?.viewData?.Filters?.TagIdsFilter
//           ? activePage?.viewData?.Filters?.TagIdsFilter
//           : null,
//       },
//       OrderInfo: activePage?.viewData?.OrderInfo
//         ? activePage?.viewData?.OrderInfo
//         : [],
//       RepoViewId: activePage?.viewData?.RepoViewId,
//       ShowMode: 10,
//       ShowTags: activePage?.viewData?.ShowTags
//         ? activePage?.viewData?.ShowTags
//         : true,
//       ShowBookmarked: activePage?.viewData?.ShowBookmarked
//         ? activePage?.viewData?.ShowBookmarked
//         : true,
//       PagingInfo: {
//         PageNumber: activePage?.viewData?.PagingInfo?.PageNumber
//           ? activePage?.viewData?.PagingInfo?.PageNumber
//           : 1,
//         PageRecordCount: activePage?.viewData?.PagingInfo?.PageRecordCount
//           ? activePage?.viewData?.PagingInfo?.PageRecordCount
//           : 10,
//       },
//       FullSearchPhrase: activePage?.viewData?.FullSearchPhrase
//         ? activePage?.viewData?.FullSearchPhrase
//         : "",
//     },
//     skip:
//       match ||
//       !activePage?.viewData?.RepoViewId ||
//       baseRepoId !== activePage.RepoId,
//   });

//   const [confirmationItem, { isLoading: confirmationIsLoading }] =
//     useCUDDataMutation();
//   const dispatch = useDispatch();

//   const initialState: IState = {
//     actionConfig: null,
//     isConfirmModalOpen: false,
//     isConfirmDrawerOpen: false,
//     isDynamicModal: false,
//     isAttachmentModal: false,
//     isGoodVariantValuesModalOpen: false,
//     isGoodExtraInfoModalOpen: false,
//   };

//   function reducer(state: IState, action: Action): IState {
//     switch (action.type) {
//       case "OPEN_CONFIRM_MODAL":
//         return { ...state, isConfirmModalOpen: true, actionConfig: null };
//       case "CLOSE_CONFIRM_MODAL":
//         return { ...state, isConfirmModalOpen: false, actionConfig: null };
//       case "OPEN_CONFIRM_DRAWER":
//         return { ...state, isConfirmDrawerOpen: true, actionConfig: null };
//       case "CLOSE_CONFIRM_DRAWER":
//         return { ...state, isConfirmDrawerOpen: false, actionConfig: null };
//       case "OPEN_ATTACHMENT_MODAL":
//         return { ...state, isAttachmentModal: true, actionConfig: null };
//       case "CLOSE_ATTACHMENT_MODAL":
//         return { ...state, isAttachmentModal: false, actionConfig: null };
//       case "OPEN_GOOD_VARIANT_VALUES_MODAL":
//         return {
//           ...state,
//           isGoodVariantValuesModalOpen: true,
//           actionConfig: action.payload,
//         };
//       case "CLOSE_GOOD_VARIANT_VALUES_MODAL":
//         return {
//           ...state,
//           isGoodVariantValuesModalOpen: false,
//           actionConfig: null,
//         };
//       case "OPEN_GOOD_EXTRA_INFO_MODAL":
//         return {
//           ...state,
//           isGoodExtraInfoModalOpen: true,
//           actionConfig: action.payload,
//         };
//       case "CLOSE_GOOD_EXTRA_INFO_MODAL":
//         return {
//           ...state,
//           isGoodExtraInfoModalOpen: false,
//           actionConfig: null,
//         };
//       case "OPEN_DYNAMIC_MODAL":
//         return {
//           ...state,
//           isDynamicModal: true,
//           actionConfig: action.payload,
//         };
//       case "CLOSE_DYNAMIC_MODAL":
//         return {
//           ...state,
//           isDynamicModal: false,
//           actionConfig: null,
//         };

//       default:
//         return state;
//     }
//   }

//   const [state, dispatchState] = useReducer(reducer, initialState);

//   useEffect(() => {
//     if (
//       !match &&
//       cardData?.Data?.length > 0 &&
//       cardData?.Data?.length < gridTotal?.TotalCount &&
//       cardData?.ReturnCount ===
//         Number(activePage?.viewData?.PagingInfo?.PageRecordCount)
//     ) {
//       const pageNumberCount = Number(
//         activePage?.viewData?.PagingInfo?.PageNumber
//       );
//       const pageRecordCount = Number(
//         activePage?.viewData?.PagingInfo?.PageRecordCount
//       );

//       const observerCallback = (entries: IntersectionObserverEntry[]) => {
//         if (entries[0].isIntersecting && !cardIsFetching) {
//           dispatch(
//             setViewData({
//               ...activePage?.viewData,
//               PagingInfo: {
//                 PageNumber: pageNumberCount ? pageNumberCount + 1 : 1,
//                 PageRecordCount: pageRecordCount ? pageRecordCount : 10,
//               },
//             })
//           );
//         }
//       };

//       observer.current = new IntersectionObserver(observerCallback);
//       const currentLastItem = lastItemRef.current;

//       if (currentLastItem) observer.current.observe(currentLastItem);

//       return () => {
//         if (observer.current && currentLastItem)
//           observer.current.unobserve(currentLastItem);
//       };
//     }
//   }, [
//     cardIsFetching,
//     activePage?.viewData?.PagingInfo?.PageNumber,
//     activePage?.viewData,
//     dispatch,
//     cardData?.Data?.length,
//     gridTotal?.TotalCount,
//   ]);

//   const prevGridDataRef = useRef(gridData);
//   const prevCardDataRef = useRef(cardData);
//   useEffect(() => {
//     if (activePage && gridData?.Data?.length < 1) {
//       const pageNumberCount = Number(
//         activePage?.viewData?.PagingInfo?.PageNumber
//       );
//       const pageRecordCount = Number(
//         activePage?.viewData?.PagingInfo?.PageRecordCount
//       );
//       if (pageNumberCount > 1) {
//         dispatch(
//           setViewData({
//             ...activePage?.viewData,
//             PagingInfo: {
//               PageNumber: pageNumberCount ? pageNumberCount - 1 : 1,
//               PageRecordCount: pageRecordCount ? pageRecordCount : 10,
//             },
//           })
//         );
//       }
//     }
//     if (activePage && cardData?.Data?.length < 1) {
//       const pageNumberCount = Number(
//         activePage?.viewData?.PagingInfo?.PageNumber
//       );
//       const pageRecordCount = Number(
//         activePage?.viewData?.PagingInfo?.PageRecordCount
//       );
//       if (pageNumberCount > 1) {
//         dispatch(
//           setViewData({
//             ...activePage?.viewData,
//             PagingInfo: {
//               PageNumber: pageNumberCount ? pageNumberCount - 1 : 1,
//               PageRecordCount: pageRecordCount ? pageRecordCount : 10,
//             },
//           })
//         );
//       }
//     }

//     if (prevGridDataRef.current !== gridData) {
//       if (gridData?.Data?.length > 0) {
//         gridData.Data.map((item) =>
//           dispatch(
//             addSpecificTags({
//               RepoId: repoId,
//               RefId: Number(item[rowFieldKey]),
//               tags: item?.TagsInfo,
//             })
//           )
//         );
//       }
//     }
//     if (prevCardDataRef.current !== cardData) {
//       const fetchAndDispatchTags = async () => {
//         if (cardData?.Data?.length > 0) {
//           try {
//             const CardTags = await Promise.all(
//               cardData.Data.map((item) =>
//                 dispatch(
//                   addSpecificTags({
//                     RepoId: repoId,
//                     RefId: Number(item[rowFieldKey]),
//                     tags: item.TagsInfo,
//                   })
//                 )
//               )
//             );
//           } catch (error) {
//             null;
//           }
//         }
//       };
//       fetchAndDispatchTags();
//     }
//     prevGridDataRef.current = gridData;
//     prevCardDataRef.current = cardData;
//   }, [gridData, cardData]);

//   const handleAction = (
//     action: IToolbarMenu,
//     id: number | null,
//     additionalId: number | null,
//     PendingStatusId: number | null
//   ) => {
//     setSelectedId(id);
//     additionalFieldKey && additionalId && setAdditionalValue(additionalId);

//     try {
//       switch (action.MenuDesc) {
//         case ActionLabelsEnum.Edit as string:
//           initializePage({
//             config: {
//               repoId: repoId,
//               systemId: systemId,
//               url: `${formUrl}?id=${id}`,
//               pageState:
//                 !PendingStatusId || PendingStatusId === 0
//                   ? PageStateEnum.opened
//                   : PendingStatusId === 1 ||
//                     PendingStatusId === 2 ||
//                     PendingStatusId === 3
//                   ? PageStateEnum.pending
//                   : PageStateEnum.pendingError,
//               originalPageState:
//                 !PendingStatusId || PendingStatusId === 0
//                   ? PageStateEnum.opened
//                   : PendingStatusId === 1 ||
//                     PendingStatusId === 2 ||
//                     PendingStatusId === 3
//                   ? PageStateEnum.pending
//                   : PageStateEnum.pendingError,
//               id: Number(id),
//             },
//           });

//           break;
//         case ActionLabelsEnum.Access as string:
//           initializePage({
//             config: {
//               repoId: repoId,
//               systemId: SystemEnum.inv,
//               url: `${action.WebLink}?id=${id}`,
//               pageState:
//                 !PendingStatusId || PendingStatusId === 0
//                   ? PageStateEnum.opened
//                   : PendingStatusId === 1 ||
//                     PendingStatusId === 2 ||
//                     PendingStatusId === 3
//                   ? PageStateEnum.pending
//                   : PageStateEnum.pendingError,
//               originalPageState:
//                 !PendingStatusId || PendingStatusId === 0
//                   ? PageStateEnum.opened
//                   : PendingStatusId === 1 ||
//                     PendingStatusId === 2 ||
//                     PendingStatusId === 3
//                   ? PageStateEnum.pending
//                   : PageStateEnum.pendingError,
//               id: Number(id),
//             },
//           });
//           break;

//         case ActionLabelsEnum.Delete as string:
//           setConfirmMode("Delete");
//           if (match) {
//             dispatchState({ type: "OPEN_CONFIRM_MODAL" });
//           } else {
//             dispatchState({ type: "OPEN_CONFIRM_DRAWER" });
//           }
//           break;

//         case ActionLabelsEnum.Confirm1 as string:
//         case ActionLabelsEnum.Confirm2 as string:
//           setConfirmMode("Confirm");
//           if (match) {
//             dispatchState({ type: "OPEN_CONFIRM_MODAL" });
//           } else {
//             dispatchState({ type: "OPEN_CONFIRM_DRAWER" });
//           }
//           break;

//         case ActionLabelsEnum.Attachment as string:
//           dispatchState({ type: "OPEN_ATTACHMENT_MODAL" });
//           break;

//         case ActionLabelsEnum.GoodVariantValues as string:
//           dispatchState({
//             type: "OPEN_GOOD_VARIANT_VALUES_MODAL",
//             payload: action,
//           });
//           break;
//         case ActionLabelsEnum.GoodExtraInfo as string:
//           dispatchState({
//             type: "OPEN_GOOD_EXTRA_INFO_MODAL",
//             payload: action,
//           });
//           break;

//         default:
//           dispatchState({ type: "OPEN_DYNAMIC_MODAL", payload: action });
//           break;
//       }
//     } catch (error) {
//       null;
//     }
//   };

//   const handleConfirmation = async () => {
//     try {
//       const confirmationResult = await confirmationItem({
//         url: confirmMode === "Delete" ? deleteUrl : confirmUrl,
//         body: { Id: selectedId },
//       }).unwrap();

//       if (confirmationResult.Result === "Pending") {
//         showInfoToast(t("toast.Pending"));
//         setSelectedId(null);
//         additionalFieldKey && setAdditionalValue(null);

//         if (state.isConfirmModalOpen) {
//           dispatchState({ type: "CLOSE_CONFIRM_DRAWER" });
//         }
//         if (state.isConfirmModalOpen) {
//           dispatchState({ type: "CLOSE_CONFIRM_MODAL" });
//         }
//         dispatch(
//           setPageState({
//             ...activePage,
//             pageState: PageStateEnum.needReload,
//           })
//         );
//       } else if (confirmationResult.Result === "Success") {
//         if (confirmMode !== "Delete") {
//           showSuccessToast("", t("toast.successTitle"), 500);
//           setSelectedId(null);
//           additionalFieldKey && setAdditionalValue(null);

//           if (state.isConfirmModalOpen) {
//             dispatchState({ type: "CLOSE_CONFIRM_DRAWER" });
//           }
//           if (state.isConfirmModalOpen) {
//             dispatchState({ type: "CLOSE_CONFIRM_MODAL" });
//           }
//           dispatch(
//             setPageState({
//               ...activePage,
//               pageState: PageStateEnum.needReload,
//             })
//           );
//         }
//         if (confirmationResult.DeleteResults[0].IsDelete === true) {
//           showSuccessToast("", t("toast.successTitle"), 500);
//           setSelectedId(null);
//           additionalFieldKey && setAdditionalValue(null);

//           if (state.isConfirmModalOpen) {
//             dispatchState({ type: "CLOSE_CONFIRM_DRAWER" });
//           }
//           if (state.isConfirmModalOpen) {
//             dispatchState({ type: "CLOSE_CONFIRM_MODAL" });
//           }
//           dispatch(
//             setPageState({
//               ...activePage,
//               pageState: PageStateEnum.needReload,
//             })
//           );
//         }
//       }
//     } catch (error) {
//       null;
//     }
//   };

//   const handleAddNew = () => {
//     initializePage({
//       config: {
//         repoId: repoId,
//         systemId: systemId,
//         url: formUrl,
//       },
//     });
//   };

//   const [visible, setVisible] = useState(false);
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const handleScroll = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (containerRef && visible) {
//       containerRef.current.scrollTop = 0;
//       setVisible(false);
//     }
//   };

//   const handleVisibleButton = () => {
//     if (containerRef) {
//       containerRef.current.scrollTop !== 0
//         ? setVisible(true)
//         : setVisible(false);
//     }
//   };
//   return (
//     <div className="flex flex-col items-center">
//       {toolbarData && (
//         <>
//           <div className={`${match ? "relative" : ""} w-full`}>
//             <div
//               className={
//                 match
//                   ? `absolute -top-[60px] ${
//                       direction == "rtl" ? "-left-[10px]" : "-right-[10px]"
//                     } `
//                   : ""
//               }
//             >
//               <ListToolbar
//                 formUrl={formUrl}
//                 addCaption={addCaption}
//                 deleteUrl={deleteUrl}
//                 confirmUrl={confirmUrl}
//                 toolbarData={toolbarData}
//                 repoId={repoId}
//                 systemId={systemId}
//                 isSelectMode={isSelectMode}
//                 setIsSelectMode={setIsSelectMode}
//                 // conditionallyAction={conditionallyAction}
//                 // conditionalProperty={conditionalProperty as string}
//                 // fieldKey={rowFieldKey}
//               />
//             </div>
//             <GridToolbar
//               viewData={activePage?.viewData}
//               config={toolbarConfig}
//               rowFieldKey={rowFieldKey as string}
//             />
//           </div>

//           {!match ? (
//             !cardIsLoading ? (
//               <Card
//                 staticKey={staticKey as string}
//                 staticKeyII={staticKeyII as string}
//                 data={cardData?.Data}
//                 columnsList={columnsList}
//                 actions={toolbarData?.GridMenu}
//                 ref={lastItemRef}
//                 onActionClick={handleAction}
//                 rowFieldKey={rowFieldKey as string}
//                 additionalFieldKey={additionalFieldKey}
//                 conditionallyAction={conditionallyAction}
//                 conditionalProperty={conditionalProperty as string}
//                 containerRef={containerRef}
//                 handleVisibleScrollButton={handleVisibleButton}
//                 isSelectMode={isSelectMode}
//                 setIsSelectMode={setIsSelectMode}
//               />
//             ) : (
//               <div className="flex items-center w-full h-[500px]">
//                 <CustomSpin className="w-full" size="large" />
//               </div>
//             )
//           ) : (
//             <DataGrid
//               columnsList={columnsList}
//               viewData={activePage?.viewData}
//               totalCount={gridTotal?.TotalCount}
//               totalIsLoading={
//                 totalIsLoading ? true : totalIsFetching ? true : false
//               }
//               data={gridData?.Data}
//               actions={toolbarData?.GridMenu}
//               loading={gridIsLoading}
//               onActionClick={handleAction}
//               rowFieldKey={rowFieldKey}
//               additionalFieldKey={additionalFieldKey}
//               recordPerPage={recordPerPage}
//               conditionallyAction={conditionallyAction}
//               conditionalProperty={conditionalProperty as string}
//               EditField={EditField}
//               formUrl={formUrl}
//             />
//           )}
//           {!cardIsLoading && cardIsFetching && (
//             <div className="absolute inset-0 flex justify-center items-center backdrop-blur-sm">
//               <CustomSpin size="large" />
//             </div>
//           )}

//           {!match && (
//             <div className="bottom-1 absolute flex justify-end bg-opacity-0 mt-2 px-6 w-full">
//               {/* <div
//                 className={`${
//                   visible ? "opacity-100" : "opacity-30"
//                 } flex justify-center items-center bg-gray-gray8 p-[5px] rounded h-full text-white  text-xs rotate-180`}
//                 onClick={handleScroll}
//               >
//                 <ScrollDownIcon
//                   config={{ width: 35, height: 35, stroke: "#fff" }}
//                 />
//               </div> */}
//               <div
//                 className="flex justify-center items-center bg-black-black8 p-[12px] border-1 border-black-black95 rounded-full h-full text-white text-xs fullShadow"
//                 onClick={handleAddNew}
//               >
//                 <New config={{ width: 25, height: 25, stroke: "#fff" }} />
//               </div>
//             </div>
//           )}

//           {state.isConfirmModalOpen && (
//             <CustomModal
//               width={300}
//               centered
//               disableTitle
//               closeModal={() => dispatchState({ type: "CLOSE_CONFIRM_MODAL" })}
//               isModalOpen={state.isConfirmModalOpen}
//               content={
//                 <Confirmation
//                   itemsToConfirm={selectedId}
//                   mode={confirmMode}
//                   onLoading={confirmationIsLoading}
//                   onCancel={() =>
//                     dispatchState({ type: "CLOSE_CONFIRM_MODAL" })
//                   }
//                   onConfirm={handleConfirmation}
//                 />
//               }
//             />
//           )}

//           {state.isConfirmDrawerOpen && (
//             <CustomDrawer
//               isOpen={state.isConfirmDrawerOpen}
//               onClose={() => dispatchState({ type: "CLOSE_CONFIRM_DRAWER" })}
//               content={
//                 <Confirmation
//                   itemsToConfirm={selectedId}
//                   mode={confirmMode}
//                   onLoading={confirmationIsLoading}
//                   onCancel={() =>
//                     dispatchState({ type: "CLOSE_CONFIRM_DRAWER" })
//                   }
//                   onConfirm={handleConfirmation}
//                 />
//               }
//             />
//           )}
//           {state.isDynamicModal && (
//             <CustomModal
//               contentClassName={`${
//                 match ? "w-[520px] h-[470px]" : ""
//               }`}
//               headerName={state.actionConfig.MenuDesc}
//               headerIcon={
//                 match && (
//                   <div
//                     dangerouslySetInnerHTML={{
//                       __html: state.actionConfig.Icon,
//                     }}
//                     style={{ width: "18px", height: "17px" }}
//                   />
//                 )
//               }
//               headerDescription={`${
//                 match
//                   ? gridData?.Data?.find(
//                       (item) => item[rowFieldKey] === selectedId
//                     )[staticKey]
//                   : cardData?.Data?.find(
//                       (item) => item[rowFieldKey] === selectedId
//                     )[staticKey]
//               }
//               `}
//               closeModal={() => dispatchState({ type: "CLOSE_DYNAMIC_MODAL" })}
//               isModalOpen={state.isDynamicModal}
//               content={
//                 <DynamicModal
//                   id={selectedId}
//                   sourceKey={rowFieldKey as string}
//                   additionalId={additionalValue}
//                   additionalFieldKey={additionalFieldKey}
//                   config={
//                     dynamicModalConfig.find(
//                       (item) => item.name === state.actionConfig.MenuDesc
//                     ).config
//                   }
//                 />
//               }
//             />
//           )}
//           {state.isGoodVariantValuesModalOpen && (
//             <CustomModal
//               contentClassName={`${
//                 match ? "w-[520px] h-[470px]" : ""
//               }`}
//               headerName={state.actionConfig.MenuDesc}
//               headerIcon={
//                 match && (
//                   <div
//                     dangerouslySetInnerHTML={{
//                       __html: state.actionConfig.Icon,
//                     }}
//                     style={{ width: "18px", height: "17px" }}
//                   />
//                 )
//               }
//               headerDescription={`${
//                 match
//                   ? gridData?.Data?.find(
//                       (item) => item[rowFieldKey] === selectedId
//                     )[staticKey]
//                   : cardData?.Data?.find(
//                       (item) => item[rowFieldKey] === selectedId
//                     )[staticKey]
//               }
//               `}
//               closeModal={() =>
//                 dispatchState({ type: "CLOSE_GOOD_VARIANT_VALUES_MODAL" })
//               }
//               isModalOpen={state.isGoodVariantValuesModalOpen}
//               content={
//                 <GoodVariantValues
//                   id={selectedId}
//                   sourceKey={rowFieldKey as string}
//                 />
//               }
//             />
//           )}
//           {state.isGoodExtraInfoModalOpen && (
//             <CustomModal
//               contentClassName={`${
//                 match ? "w-[520px] h-[470px]" : ""
//               }`}
//               headerName={state.actionConfig.MenuDesc}
//               headerIcon={
//                 match && (
//                   <div
//                     dangerouslySetInnerHTML={{
//                       __html: state.actionConfig.Icon,
//                     }}
//                     style={{ width: "18px", height: "17px" }}
//                   />
//                 )
//               }
//               headerDescription={`${
//                 match
//                   ? gridData?.Data?.find(
//                       (item) => item[rowFieldKey] === selectedId
//                     )[staticKey]
//                   : cardData?.Data?.find(
//                       (item) => item[rowFieldKey] === selectedId
//                     )[staticKey]
//               }
//               `}
//               closeModal={() =>
//                 dispatchState({ type: "CLOSE_GOOD_EXTRA_INFO_MODAL" })
//               }
//               isModalOpen={state.isGoodExtraInfoModalOpen}
//               content={
//                 <GoodExtraInfo
//                   id={selectedId}
//                   sourceKey={rowFieldKey as string}
//                 />
//               }
//             />
//           )}
//           {state.isAttachmentModal && (
//             <CustomModal
//               contentClassName={`${
//                 match ? "!min-w-max h-full" : ""
//               }`}
//               headerName={attachmentTitle}
//               headerDescription={`${
//                 match
//                   ? gridData?.Data?.find(
//                       (item) => item[rowFieldKey] === selectedId
//                     )[staticKey]
//                   : cardData?.Data?.find(
//                       (item) => item[rowFieldKey] === selectedId
//                     )[staticKey]
//               }
//               `}
//               closeModal={() =>
//                 dispatchState({ type: "CLOSE_ATTACHMENT_MODAL" })
//               }
//               isModalOpen={state.isAttachmentModal}
//               content={
//                 <Uploader
//                   onlyAcceptImage
//                   RefId={selectedId}
//                   setModalTitle={setAttachmentTitle}
//                   RepoId={repoId}
//                 />
//               }
//             />
//           )}
//         </>
//       )}
//     </div>
//   );
// }
