import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import { useCUDDataMutation } from '@services/base';
import { showSuccessToast } from '@utils/toast';

import type { IProps } from './type';

export default function SaveButton({ ...props }: IProps) {
  const { saveHandler, isLoading, body, disable } = props;
  const t = useTranslations();
  const [trigger, { isLoading: Loading }] = useCUDDataMutation();
  const handleSave = async () => {
    try {
      const result = await trigger({
        url: "/api/auth/insert/role/roleActions",
        body,
      }).unwrap();

      if (result?.Result == "Success") {
        saveHandler();
        showSuccessToast(t("toast.successTitle"));
      } else {
        saveHandler(body);
      }
    } catch (error) {
      null;
    }
  };

  return (
    <CustomButton
      loading={Loading}
      disabled={Loading || disable}
      type="text"
      className={`${
        disable ? " text-main-black" : "bg-black-black8 text-white"
      }  text-xs !hover:bg-white border hover:border-black-black8 rounded h-full `}
      onClick={handleSave}
    >
      {t("general.save")}
    </CustomButton>
  );
}

// if (
//   formValue &&
//   formValue[item.name] !== undefined &&
//   formValue[item.name] !== null &&
//   item.type !== "noShow"
// ) {
//   if (item.type == "array") {
//     body[item.name] = formValue[item.name];
//   } else if (item.type == "text") {
//     body[item.name] = formValue[item.name].toString();
//   } else if (item.type == "date") {
//     try {
//       body[item.name] = formValue[item.name].from.toISOString();
//     } catch (error) {
//       null;
//     }
//   } else if (item.type == "number") {
//     body[item.name] = +formValue[item.name];
//   } else {
//     body[item.name] = formValue[item.name];
//   }
// } else
// if (formValue) {
//   formData.forEach((item) => {
//     if (
//       (formValue[item.name] !== undefined &&
//         formValue[item.name] !== item.originalValue) ||
//       item.caption === "MainIdField"
//     ) {
//       if (
//         item.caption !== "MainIdField" &&
//         item.name !== "Details" &&
//         item.name !== "BankStatements" &&
//         item.name !== "TafsiliStatements" &&
//         item.name !== "TankhahStatements" &&
//         item.name !== "CashStatements"
//       ) {
//         changedFields.push(item.name);
//       }

//       if (item.type == "array") {
//         body[item.name] = formValue[item.name];
//       } else if (item.type == "text") {
//         body[item.name] = formValue[item.name].toString();
//       } else if (item.type == "date") {
//         try {
//           body[item.name] = formValue[item.name].from.toISOString();
//         } catch (error) {
//           null;
//         }
//       } else if (item.type == "number") {
//         body[item.name] = +formValue[item.name];
//       } else {
//         body[item.name] = item.value;
//       }
//     }
//   });
// } else {

// if (form) {
//   statusHandler(true);
// }

//==============================================================================================
// const dispatch = useDispatch();
// const initializePage = useInitializePage()

// const createBody = (formData: any[]) => {
//   const body = {};
//   const changedFields: string[] = [];

//   formData.forEach((item) => {
//     if (
//       item.value !== undefined &&
//       item.value !== null &&
//       item.type !== "noShow"
//     ) {
//       if (isEdit && item.value === item.originalValue) return;

//       if (isEdit && item.caption === "MainIdField") {
//         changedFields.push(item.name);
//       } else if (isEdit && item.name !== "Details" && item.name !== "BankStatements" && item.name !== "TafsiliStatements" && item.name !== "TankhahStatements" && item.name !== "CashStatements") {
//         changedFields.push(item.name);
//       }

//       if (item.type == "array") {
//         body[item.name] = item.value;
//       } else if (item.type == "text") {
//         body[item.name] = item.value.toString();
//       } else if (item.type == "date") {
//         try {
//           body[item.name] = item.value.from.toISOString();
//         } catch (error) {
//           console.error(error);
//         }
//       } else if (item.type == "number") {
//         body[item.name] = +item.value;
//       } else {
//         body[item.name] = item.value;
//       }
//     }
//   });

//   return { body, changedFields };
// };

// const handleSave = async () => {
//   try {
//     const { body, changedFields } = createBody(formData);
//     const cleanBody = transformDotNotationToNested(body);

//     const result:any = await trigger({
//       url: isEdit ? formInfo.updateEndpoint : formInfo.addEndpoint,
//       body: isEdit
//         ? {
//             ...cleanBody,
//             ChangeFields: changedFields,
//           }
//         : cleanBody,
//     });

//     if (result.data.Result === "Success" || result.data.Result === "Pending") {
//       if (result.data.Result === "Success") {
//         showSuccessToast(t("toast.save"));
//       }
//       if (result.data.Result === "Pending") {
//         showInfoToast({ message: t("toast.Pending"), time: 15000 });
//       }
//     }
//      dispatch(
//         setPageState({
//           ...activePage,
//           caption:
//             activePage.caption +
//             formData.find((i) => i.isTitleField === true)?.value,
//           pageState:
//             !result.data.PendingStatusId || result.data.PendingStatusId === 0
//               ? PageStateEnum.saved
//               : result.data.PendingStatusId === 1 ||
//                 result.data.PendingStatusId === 2 ||
//                 result.data.PendingStatusId === 3
//               ? PageStateEnum.pending
//               : PageStateEnum.pendingError,
//         })
//       );
//       dispatch(
//         setPageState({
//           ...listPage,
//           pageState: PageStateEnum.needReload,
//         })
//       );
//       const u = listPage.url.split("id=");
//       initializePage({
//         config: {
//           repoId: listPage.RepoId,
//           systemId: listPage.SystemId,
//           url: listPage.url,
//           pageId: listPage.pageId,
//           id: u.length > 0 ? Number(u[1]) : 0,
//           originalPageState: listPage.originalPageState,
//           pageState: listPage.pageState,
//         },
//       });
//   } catch (error) {
//     console.error(error);
//   }
// };
