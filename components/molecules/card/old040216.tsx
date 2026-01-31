// import {
//     CSSProperties,
//     forwardRef,
//     ReactNode,
//     Ref,
//     RefAttributes,
//     useEffect,
//     useState,
//   } from "react";

//   import { Checkbox, Collapse, Spin } from "antd";
//   import { useTranslations } from "next-intl";
//   import { useDispatch } from "react-redux";

//   import { CustomButton } from "@components/atoms/defaultElements";
//   import {
//     DownChevron,
//     Error,
//     NoData,
//     Pending,
//   } from "@components/atoms/iconComponents";
//   import { useAppSelector } from "@redux/index";
//   import { ErrorStatusEnum, PendingStatusEnum } from "@services/base/enum";
//   import { useCUDDataMutation } from "@services/base/new";
//   import { setItems } from "@slice/items";
//   import { getSystemNameById } from "@utils/core";
//   import { useProcessedData } from "@utils/useProcessedData";

//   import { IChangesField } from "../dataGrid/type";
//   import Tags from "../tags";
//   import { Details } from "./details";
//   import type { IProps } from "./type";

//   const pendingStatusRender = (pendingStatusId: number) => {
//     switch (pendingStatusId) {
//       case PendingStatusEnum.pending1:
//       case PendingStatusEnum.pending2:
//       case PendingStatusEnum.pending3:
//         return (
//           <Spin
//             indicator={<Pending />}
//             className="animate-spin"
//             spinning
//             size="small"
//           />
//         );
//       case ErrorStatusEnum.error100:
//       case ErrorStatusEnum.error101:
//       case ErrorStatusEnum.error102:
//         return (
//           <div>
//             <Error />
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   const Card = forwardRef(function Card<T>(
//     {
//       staticKey,
//       staticKeyII,
//       data,
//       actions,
//       columnsList,
//       onActionClick,
//       rowFieldKey,
//       additionalFieldKey,
//       conditionallyAction,
//       conditionalProperty,
//       containerRef,
//       handleVisibleScrollButton,
//       isSelectMode,
//       setIsSelectMode,
//     }: IProps<T> & { containerRef?: Ref<HTMLDivElement> },
//     ref: RefAttributes<HTMLDivElement>["ref"]
//   ) {
//     const t = useTranslations();
//     const {
//       lang: locale,
//       ShowTags,
//       selectedItems,
//       activePage,
//     } = useAppSelector((state) => ({
//       lang: state.withPersist.config.lang,
//       ShowTags: state.withPersist.pages?.find((page) => page.isActive)?.viewData
//         ?.ShowTags,
//       selectedItems: state.withPersist.listItems.items,
//       activePage: state.withPersist.pages.find((item) => item.isActive === true),
//     }));

//     const systemId = activePage?.SystemId;
//     const repoId = activePage?.RepoId;

//     const dispatch = useDispatch();

//     const columnsConfig = columnsList && columnsList?.column;
//     const processedData = useProcessedData({ data, columnsConfig, locale });

//     const [selectAll, setSelectAll] = useState(false);
//     const [indeterminate, setIndeterminate] = useState(false);

//     const handleSelectRow = (item: number) => {
//       if (selectedItems.includes(item)) {
//         dispatch(setItems({ items: selectedItems.filter((i) => i !== item) }));
//       } else {
//         dispatch(setItems({ items: [...selectedItems, item] }));
//       }
//     };

//     const handleSelectAll = (checked: boolean) => {
//       if (checked) {
//         dispatch(
//           setItems({
//             items: processedData.map((item) => item[rowFieldKey]),
//           })
//         );
//       } else {
//         dispatch(setItems({ items: [] }));
//       }
//     };

//     const [setBookmark, { isLoading: bookmarkIsLoading }] = useCUDDataMutation();

//     const [currentChanges, setCurrentChanges] = useState<IChangesField[]>([]);
//     const [currentId, setCurrentId] = useState(null);

//     const handleSetBookmark = async (id: number, isBookmarked: boolean) => {
//       setCurrentId(id);
//       const isStateBookmark = currentChanges.find((item) => item.id === id);
//       if (isStateBookmark) {
//         isBookmarked = isStateBookmark.HasBookMark;
//       }

//       if (isBookmarked === undefined) {
//         isBookmarked = false;
//       }
//       try {
//         const result = await setBookmark({
//           url: `/api/${getSystemNameById(systemId)}/insert/bookmark`,
//           body: {
//             RepoId: repoId,
//             RefId: id,
//           },
//         }).unwrap();

//         if (result && result.Result === "Success") {
//           setCurrentChanges((prevState) => {
//             const existingChange = prevState.find((item) => item.id === id);

//             if (existingChange) {
//               return prevState.map((item) =>
//                 item.id === id
//                   ? { ...item, HasBookMark: isBookmarked ? false : true }
//                   : item
//               );
//             }

//             return [
//               ...prevState,
//               {
//                 id: id,
//                 HasBookMark: isBookmarked ? false : true,
//               },
//             ];
//           });
//           // dispatch(apiService.util.resetApiState());
//         }
//       } catch (error) {
//         null;
//       }
//     };

//     useEffect(() => {
//       if (
//         processedData?.length > 0 &&
//         selectedItems?.length === processedData?.length
//       ) {
//         setSelectAll(true);
//         setIndeterminate(false);
//       } else if (selectedItems?.length > 0) {
//         setSelectAll(false);
//         setIndeterminate(true);
//       } else {
//         setSelectAll(false);
//         setIndeterminate(false);
//       }
//     }, [selectedItems]);

//     const Header = (item: any, index: number) => {
//       let timer: NodeJS.Timeout;

//       const handleMouseDown = (e) => {
//         timer = setTimeout(() => {
//           setIsSelectMode(true);
//           e.preventDefault();
//         }, 700);
//       };

//       const handleMouseUp = (e) => {
//         if (isSelectMode) {
//           e.preventDefault();
//           e.stopPropagation();
//           handleSelectRow(item[rowFieldKey]);
//         }
//         clearTimeout(timer);
//       };
//       const displayStaticData: ReactNode = item[staticKey] as ReactNode;
//       const displayStaticDataII: ReactNode = item[staticKeyII] as ReactNode;

//       return (
//         <div
//           className="flex justify-between items-start gap-2 w-full"
//           ref={index === processedData.length - 1 ? ref : null}
//           onMouseDown={handleMouseDown}
//           onMouseUp={handleMouseUp}
//           onMouseLeave={handleMouseUp}
//           onTouchStart={handleMouseDown}
//           onTouchEnd={handleMouseUp}
//         >
//           <div className="flex items-center gap-1">
//             {isSelectMode && (
//               <Checkbox
//                 checked={selectedItems.includes(item[rowFieldKey])}
//                 onClick={(event) => event.stopPropagation()}
//                 onChange={() => handleSelectRow(item[rowFieldKey])}
//               />
//             )}
//             <p className="hidden-show-scrollBar max-w-[calc(100dvw-140px)] overflow-autotext-sm text-gray-gray10 whitespace-nowrap">
//               {displayStaticData}
//               {displayStaticDataII ? ` - ${displayStaticDataII}` : null}
//             </p>
//           </div>
//           <div className="flex justify-end gap-1">
//             {pendingStatusRender(item.PendingStatusId)}
//             {ShowTags && (
//               <Tags RefId={item[rowFieldKey]} maxContainerSize={200} />
//             )}
//           </div>

//           {/* <CustomTag
//           className="bg-state-warning2 text-[0.5rem] text-black-black95"
//           bordered={false}
//         >
//           {(item as any).EconomicCode}
//         </CustomTag> */}
//         </div>
//       );
//     };

//     const panelStyle: CSSProperties = {
//       marginBottom: "0.6rem",
//       padding: 0,
//       background: "#FBFBFB",
//       borderRadius: "4px",
//       border: "2px solid",
//       borderColor: "#ECECEC",
//     };

//     const items = processedData?.map((item: T, index: number) => ({
//       key: index.toString(),
//       label: Header(item, index),
//       children: (
//         <Details
//           actions={actions}
//           additionalFieldKey={additionalFieldKey}
//           bookmarkIsLoading={bookmarkIsLoading}
//           columnsConfig={columnsConfig}
//           conditionalProperty={conditionalProperty}
//           conditionallyAction={conditionallyAction}
//           currentChanges={currentChanges}
//           currentId={currentId}
//           handleSetBookmark={handleSetBookmark}
//           item={item}
//           onActionClick={onActionClick}
//           rowFieldKey={rowFieldKey}
//           key={item[rowFieldKey]}
//         />
//       ),
//       style: panelStyle,
//     }));

//     return (
//       <div className="relative mt-2 w-full">
//         {isSelectMode && (
//           <div className="-top-[45px] absolute flex items-center gap-2">
//             <Checkbox
//               indeterminate={indeterminate}
//               checked={selectAll}
//               onChange={(e) => handleSelectAll(e.target.checked)}
//             />
//             <p className="text-[0.7rem]">{t("general.selectAll")}</p>
//           </div>
//         )}
//         <div
//           ref={containerRef}
//           onScroll={handleVisibleScrollButton}
//           className="hidden-show-scrollBar w-full h-[calc(100dvh-185px)] overflow-y-scroll scroll-smooth"
//         >
//           {processedData?.length > 0 ? (
//             <div className="w-full">
//               <Collapse
//                 expandIcon={({ isActive }) => (
//                   <div className={isActive ? "rotate-180" : ""}>
//                     <DownChevron />
//                   </div>
//                 )}
//                 expandIconPosition="end"
//                 style={{
//                   backgroundColor: "white",
//                   padding: 0,
//                   margin: 0,
//                 }}
//                 items={items}
//                 bordered={false}
//               />
//             </div>
//           ) : (
//             <div className="flex flex-col justify-center items-center gap-8 m-6">
//               <NoData />
//               <span className="text-gray-gray9 text-sm">
//                 {t("general.noData")}
//               </span>
//               <CustomButton className="border-0">
//                 {t("general.addNew")}
//               </CustomButton>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   });

//   export default Card;
