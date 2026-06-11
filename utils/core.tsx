import { FormInstance } from "antd";
import moment from "moment-jalaali";

import {
  BadgeError,
  BadgeSecondary,
  BadgeSuccess,
  ChangedBadge,
  CustomTooltip,
  DynamicSelect,
  DynamicTreeWithList,
  InputPassword,
  MultiSelectWithList,
  NeedReloadBadge,
  NewDatePicker,
  SavedBadge,
} from "@components/atoms/defaultElements";
import CustomCheckbox from "@components/atoms/defaultElements/checkbox";
import { DynamicTree } from "@components/atoms/defaultElements/dynamicTree";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import {
  ErrorAddIcon,
  ErrorDeleteIcon,
  ErrorUpdateIcon,
  InfoIcon,
  Media,
  Monitor,
  PendingAddIcon,
  PendingDeleteIcon,
  PendingUpdateIcon,
} from "@components/atoms/iconComponents";
import DynamicRadio from "@components/molecules/dynamicRadioList";
import { Dispatch } from "@reduxjs/toolkit";
import { BadgeTypeEnum, type IColumnConfig } from "@services/generalType/type";
import { resetContainer } from "@slice/container";
import { resetEndYearOperation } from "@slice/endYearOperations";
import { resetInit } from "@slice/init";
import type { IInitialPage } from "@slice/init/type";
import { resetAllItems } from "@slice/items";
import { resetNavigateList } from "@slice/navigateList";
import { resetPages } from "@slice/pages";
import { PageStateEnum } from "@slice/pages/enum";
import { resetFactors } from "@slice/pages/factors";
import type {
  IFormFieldConfig,
  IRequestConfig,
  IRule,
} from "@type/elementType";
import { SystemEnum } from "@type/enum";

import { validateNationalCode } from "./checkingHelper";

export const getColoredIcon = (
  icon: string,
  mode: "light" | "dark" = "light",
): string => {
  if (!icon) return icon;

  const strokeColor = mode === "dark" ? "#FBFBFB" : "#585858";
  const fillColor = mode === "dark" ? "#FBFBFB" : "#585858";

  return icon
    .replace(/stroke\s*=\s*["'].*?["']/gi, `stroke="${strokeColor}"`)
    .replace(/fill\s*=\s*["']#585858["']/gi, `fill="${fillColor}"`);
};
function resolveDynamicProps(obj, context) {
  const copy = { ...obj };
  for (let key in copy) {
    if (typeof copy[key] === "string" && copy[key].startsWith("@")) {
      const varName = copy[key].slice(1); // remove "@"
      if (varName in context) {
        copy[key] = context[varName]; // جایگزینی با متغیر واقعی
      }
    }
  }
  return copy;
}

export const renderFormField = (
  item: IFormFieldConfig,
  form: FormInstance,
  editMode: boolean,
  isFirst: boolean = false,
  primaryColor = "#000",
  highlightColor = "#f4f4f4", // * Highlight color for hover, notification or attention points
  secondaryColor = "#585858", // * Subsidiary or complementary color for secondary emphasis
  backgroundColor = "#fff", // * background color (large area)
  accentColor = "#2563eb", // * blue color to attract attention, e.g. notifications or CTAs
  tertiaryColor = "#939393", // * less important details and elements like text color
) => {
  const {
    name,
    caption,
    // colSpan,
    help,
    // isTitleField,
    order,
    selectEndpoint,
    // value,
    // originalValue,
    placeHolder,
    // radioValues,
    // routing,
    rules,
    props,
    // setFieldValue,
    type,
  } = item;
  const resolved = resolveDynamicProps(props, { editMode });
  switch (item.type) {
    case "text":
      return (
        <InputText
          {...resolved}
          autoFocus={isFirst}
          config={{
            name,
            caption,
            help,
            order,
            placeHolder,
            rules,
            type,
            selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
        />
      );
    case "number":
      return (
        <CustomInputNumber
          controls={false}
          {...resolved}
          autoFocus={isFirst}
          config={{
            name,
            caption,
            help,
            order,
            placeHolder,
            rules,
            type,
            selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
        />
      );
    case "password":
      return (
        <InputPassword
          {...resolved}
          autoFocus={isFirst}
          config={{
            name,
            caption,
            help,
            order,
            placeHolder,
            rules,
            type,
            selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
        />
      );
    case "checkBox":
      return (
        <div className="flex">
          <CustomCheckbox
            {...props}
            config={{
              name: item.name,
              caption: item.caption,
              help: item.help,
              order: item.order,
              placeHolder: item.placeHolder,
              rules: item.rules,
              type: item.type,
              selectEndpoint: item.selectEndpoint,
              setFieldValue: form.setFieldValue,
            }}
            name={item.name}
          />
          <span className="px-2">{item.caption}</span>
          {item.help !== "" ? (
            <div>
              <CustomTooltip title={item.help} arrow>
                <InfoIcon />
              </CustomTooltip>
            </div>
          ) : null}
        </div>
      );
    case "price":
      return (
        <CustomInputNumber
          {...resolved}
          min={0}
          controls={false}
          autoFocus={isFirst}
          parser={(value) =>
            value?.replace(/\$\s?|(,*)/g, "") as unknown as number
          }
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          config={{
            name: item.name,
            caption: item.caption,
            help: item.help,
            order: item.order,
            placeHolder: item.placeHolder,
            rules: item.rules,
            type: item.type,
            selectEndpoint: item.selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
        />
      );
    case "decimal":
      return (
        <CustomInputNumber
          controls={false}
          step={0.01}
          precision={2}
          {...resolved}
          autoFocus={isFirst}
          config={{
            name,
            caption,
            help,
            order,
            placeHolder,
            rules,
            type,
            selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
        />
      );

    case "bool":
      return (
        <DynamicRadio
          {...resolved}
          item={item}
          config={{
            name: item.name,
            caption: item.caption,
            help: item.help,
            order: item.order,
            placeHolder: item.placeHolder,
            rules: item.rules,
            type: item.type,
            selectEndpoint: item.selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
        />
      );
    case "radio":
      return (
        <DynamicRadio
          {...resolved}
          item={item}
          config={{
            name: item.name,
            caption: item.caption,
            help: item.help,
            order: item.order,
            placeHolder: item.placeHolder,
            rules: item.rules,
            type: item.type,
            selectEndpoint: item.selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
        />
      );
    case "date":
      return (
        <NewDatePicker
          {...resolved}
          autoFocus={isFirst}
          accentColor={accentColor}
          primaryColor={primaryColor}
          tertiaryColor={tertiaryColor}
          secondaryColor={secondaryColor}
          highlightColor={highlightColor}
          backgroundColor={backgroundColor}
          config={{
            name: item.name,
            caption: item?.caption,
            help: item.help,
            order: item.order,
            placeHolder: item.placeHolder,
            rules: item.rules,
            type: item.type,
            selectEndpoint: item.selectEndpoint,
            setFieldValue: form.setFieldValue,
            form,
          }}
        />
      );
    case "selectOption": {
      const dynamicValue: IRequestConfig = {
        addWebUrl: item.selectEndpoint.addWebUrl,
        endpoint: item.selectEndpoint.endpoint,
        repoViewId: item.selectEndpoint.repoViewId,
        addButton:
          item.selectEndpoint.addWebUrl && item.selectEndpoint.addButton,
      };
      return (
        <DynamicSelect
          {...resolved}
          autoFocus={isFirst}
          showSearch
          dynamicValue={dynamicValue}
          infinite
          showId
          config={{
            name: item.name,
            caption: item.caption,
            help: item.help,
            order: item.order,
            placeHolder: item.placeHolder,
            rules: item.rules,
            type: item.type,
            selectEndpoint: item.selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
          form={form}
        />
      );
    }
    case "treeOption": {
      const dynamicValue: IRequestConfig = {
        addWebUrl: item.selectEndpoint.addWebUrl,
        endpoint: item.selectEndpoint.endpoint,
        repoViewId: item.selectEndpoint.repoViewId,
        addButton: item.selectEndpoint.addButton,
      };

      return (
        <DynamicTree
          {...resolved}
          dynamicValue={dynamicValue}
          config={{
            name: item.name,
            caption: item.caption,
            help: item.help,
            order: item.order,
            placeHolder: item.placeHolder,
            rules: item.rules,
            type: item.type,
            selectEndpoint: item.selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
        />
      );
    }
    case "multiSelectOption": {
      const dynamicValue: IRequestConfig = {
        addWebUrl: item.selectEndpoint.addWebUrl,
        endpoint: item.selectEndpoint.endpoint,
        repoViewId: item.selectEndpoint.repoViewId,
        addButton: item.selectEndpoint.addButton,
      };
      return (
        // <DynamicMultiSelect
        //   dynamicValue={dynamicValue}
        //   config={{
        //     name: item.name,
        //     caption: item.caption,
        //     help: item.help,
        //     order: item.order,
        //     placeHolder: item.placeHolder,
        //     rules: item.rules,
        //     type: item.type,
        //     selectEndpoint: item.selectEndpoint,
        //     setFieldValue: form.setFieldValue,
        //   }}
        //   form={form}
        // />
        <MultiSelectWithList
          {...resolved}
          dynamicValue={dynamicValue}
          config={{
            name: item.name,
            caption: item.caption,
            help: item.help,
            order: item.order,
            placeHolder: item.placeHolder,
            rules: item.rules,
            type: item.type,
            selectEndpoint: item.selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
          form={form}
        />
      );
    }
    case "multiTreeOption": {
      const dynamicValue: IRequestConfig = {
        addWebUrl: item.selectEndpoint.addWebUrl,
        endpoint: item.selectEndpoint.endpoint,
        repoViewId: item.selectEndpoint.repoViewId,
        addButton: item.selectEndpoint.addButton,
      };
      return (
        // <DynamicTree
        //   multiple
        //   dynamicValue={dynamicValue}
        //   config={{
        //     name: item.name,
        //     caption: item.caption,
        //     help: item.help,
        //     order: item.order,
        //     placeHolder: item.placeHolder,
        //     rules: item.rules,
        //     type: item.type,
        //     selectEndpoint: item.selectEndpoint,
        //     setFieldValue: form.setFieldValue,
        //   }}
        //   // form={form}
        // />
        <DynamicTreeWithList
          {...resolved}
          dynamicValue={dynamicValue}
          config={{
            name: item.name,
            caption: item.caption,
            help: item.help,
            order: item.order,
            placeHolder: item.placeHolder,
            rules: item.rules,
            type: item.type,
            selectEndpoint: item.selectEndpoint,
            setFieldValue: form.setFieldValue,
          }}
          // form={form}
        />
      );
    }
    case "noShow":
      return <div></div>;
      break;

    default:
      break;
  }
};
export function checkShortcutMatch(event: any, shortcut: string): boolean {
  const parts = shortcut
    .toLowerCase()
    .split("+")
    .map((s) => s.trim());
  const key = parts.pop();

  return (
    key === event.key.toLowerCase() &&
    parts.every((mod) => {
      switch (mod) {
        case "ctrl":
          return event.ctrlKey;
        case "alt":
          return event.altKey;
        case "shift":
          return event.shiftKey;
        case "meta":
          return event.metaKey;
        default:
          return false;
      }
    })
  );
}
export const resetData = async (dispatch: Dispatch) => {
  dispatch(resetInit({}));
  dispatch(resetPages({}));
  dispatch(resetAllItems());
  dispatch(resetFactors({}));
  dispatch(resetContainer({}));
  dispatch(resetNavigateList());
  dispatch(resetEndYearOperation());

  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase("ERP_TABLE_DB");
    req.onsuccess = () => resolve();
    req.onerror = () => reject();
    req.onblocked = () => console.log("waiting for connections to close...");
  });
};

export const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: 0,
  }).format(numericValue);
};
export const toman = (rial: number) => Math.round(rial / 10);

export const convertToStringDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const amPm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  const offset = date.getTimezoneOffset();
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(
    2,
    "0",
  );
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, "0");
  const sign = offset < 0 ? "+" : "-";
  const formattedString = `${year}/${month}/${day} ${hours12}:${minutes}:${seconds} ${amPm} ${sign}${offsetHours}:${offsetMinutes}`;
  return formattedString;
};
export const convertToStringDateWithoutTime = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const offset = date.getTimezoneOffset();
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(
    2,
    "0",
  );
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, "0");
  const sign = offset < 0 ? "+" : "-";
  const formattedString = `${year}/${month}/${day}${sign}${offsetHours}:${offsetMinutes}`;

  return formattedString;
};
export const getSystemNameById = (systemId: number) => {
  if (systemId == undefined) {
    return;
  }
  return SystemEnum[systemId];
};

const colorPalette = [
  { background: "#F8EDE9", text: "#954A2C" },
  { background: "#F0FBF7", text: "#1B553E" },
  { background: "#FFF3FF", text: "#742F74" },
  { background: "#EEF1F9", text: "#5B8DA6" },
  { background: "#FFF9F0", text: "#5E3512" },
];

export const convertDate = ({
  dateString,
  locale = "fa",
  includeTime = false,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
}: {
  dateString: string;
  locale?: string;
  includeTime?: boolean;
  timezone?: string;
}): string => {
  const date = new Date(dateString);

  if (locale === "fa") {
    return includeTime
      ? moment(date).locale("fa").format("HH:mm:ss jYYYY/jMM/jDD ")
      : moment(date).locale("fa").format("jYYYY/jMM/jDD");
  } else {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...(includeTime && {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
};

export const stringToColorIndex = (
  str: string,
  paletteLength: number,
): number => {
  let hash = 0;
  for (let i = 0; i < str?.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % paletteLength;
};

export const generateColorsFromString = (
  str: string,
): { backgroundColor: string; textColor: string } => {
  const index = stringToColorIndex(str, colorPalette.length);
  const { background: backgroundColor, text: textColor } = colorPalette[index];

  return { backgroundColor, textColor };
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatBytes = (byteSize) => {
  if (byteSize < 1024) {
    return `${byteSize} B`;
  } else if (byteSize < 1024 ** 2) {
    // Less than 1 MB
    const kbSize = byteSize / 1024;
    return `${kbSize.toFixed(2)} K`;
  } else {
    // 1 MB or more
    const mbSize = byteSize / 1024 ** 2;
    return `${mbSize.toFixed(2)} M`;
  }
};
export const removeExtensionFromFileName = (name) => {
  return name?.split(".").slice(0, -1).join(".");
};
export const generateGUID = () => {
  function random16() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${random16()}${random16()}-${random16()}-${random16()}-${random16()}-${random16()}${random16()}${random16()}`;
};

export function dataURLtoFile(dataUrl: string, filename: string): File {
  if (!dataUrl || !filename) {
    throw new Error("Invalid input: dataUrl and filename are required.");
  }

  const [metadata, base64Data] = dataUrl.split(",");
  const mimeType = metadata.match(/:(.*?);/)?.[1];

  if (!mimeType) {
    throw new Error("Invalid dataUrl: MIME type not found.");
  }
  const binaryString = atob(base64Data);
  const uint8Array = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return new File([uint8Array], filename, { type: mimeType });
}
export function getFileTypeFromBase64(
  base64String: string | null | undefined,
): string | null {
  if (!base64String) {
    return null;
  }

  const [metadata] = base64String.split(",");

  const mimeTypeMatch = metadata?.match(/^data:(.+);base64$/);

  if (mimeTypeMatch && mimeTypeMatch[1]) {
    const [type, subtype] = mimeTypeMatch[1].split("/");
    return subtype || null;
  }

  return null;
}
export function getFileExtension(filename) {
  return filename.split(".").pop();
}
export function iconByFileExtension(fileName) {
  const type = getFileExtension(fileName);
  switch (type) {
    case "mp3":
    case "ogg":
    case "aac":
    case "flac":
    case "wma":
      return <Media />;
    case "jpeg":
    case "jpg":
    case "png":
    case "gif":
    case "bmp":
    case "tiff":
    case "tif":
    case "svg":
    case "webp":
    case "heif":
    case "heic":
    case "ico":
      return <Media />;
    case "pdf":
    case "doc":
    case "docx":
    case "xls":
    case "xlsx":
    case "ppt":
    case "pptx":
    case "txt":
    case "rtf":
    case "odt":
      return <Media />;
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
    case "mkv":
    case "flv":
    case "webm":
    case "mpg":
    case "mpeg":
    case "3gp":
      return <Media />;
    case "zip":
    case "rar":
      return <Monitor />;
    case "exe":
    case "dmg":
    case "apk":
      return <Monitor />;
    case "ttf":
    case "otf":
    case "woff":
      return <Monitor />;
    default:
      return <Monitor />;
  }
}

export const levelUrl = (Level) => {
  const levelUrls = [
    "/api/acc/select/repReviewGroh",
    "/api/acc/select/repReviewCol",
    "/api/acc/select/repReviewMoeen",
    "/api/acc/select/repReviewTafsili",
    "/api/acc/select/repReviewFifth",
    "/api/acc/select/repReviewSixth",
    "/api/acc/select/repReviewSeventh",
    "/api/acc/select/repReviewEight",
    "/api/acc/select/repReviewNine",
    "/api/acc/select/repReviewTen",
    "/api/acc/select/repReviewEleven",
    "/api/acc/select/repReviewTwelve",
    "/api/acc/select/repReviewThirteen",
  ];
  return levelUrls[Level];
};

export function findItemInNestedData<T>(
  array: T[],
  key: keyof T,
  value: unknown,
): T | null {
  const search = (item: T): T | null => {
    if (item[key] === value) {
      return item;
    }

    for (const nestedKey in item) {
      if (Object.prototype.hasOwnProperty.call(item, nestedKey)) {
        const nestedValue = item[nestedKey];

        if (Array.isArray(nestedValue)) {
          const result = findItemInNestedData(nestedValue as T[], key, value);
          if (result) {
            return result;
          }
        } else if (typeof nestedValue === "object" && nestedValue !== null) {
          const result = search(nestedValue as T);
          if (result) {
            return result;
          }
        }
      }
    }

    return null;
  };

  for (const item of array) {
    const result = search(item);
    if (result) {
      return result;
    }
  }

  return null;
}

export function findNearestTrueValue(obj, targetKey) {
  if (obj) {
    const entries = Object?.entries(obj);

    const targetIndex = entries.findIndex(([key]) => key === targetKey);

    if (targetIndex === -1) {
      return null;
    }

    for (let distance = 1; distance < entries.length; distance++) {
      if (
        targetIndex - distance >= 0 &&
        entries[targetIndex - distance][1] === true
      ) {
        return entries[targetIndex - distance][0];
      }
      if (
        targetIndex + distance < entries.length &&
        entries[targetIndex + distance][1] === true
      ) {
        return entries[targetIndex + distance][0];
      }
    }

    return null;
  }
}

export function transformDotNotationToNested<T extends Record<string, any>>(
  obj: T,
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const keys = key.split(".");
      let current = result;

      for (let i = 0; i < keys.length; i++) {
        let k = keys[i];

        const arrayMatch = k.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
          k = arrayMatch[1];
          const index = parseInt(arrayMatch[2], 10);

          if (!current[k]) {
            current[k] = [];
          }
          if (!current[k][index]) {
            current[k][index] = {};
          }
          current = current[k][index];
        } else {
          if (i === keys.length - 1) {
            current[k] = obj[key];
          } else {
            if (!current[k]) {
              current[k] = {};
            }
            current = current[k];
          }
        }
      }
    }
  }

  return result;
}

export const getChangedFields = <T extends Record<string, any>>(
  defaultValue: T,
  newValues: T,
): Array<keyof T> => {
  const changedFields: Array<keyof T> = [];

  (Object.keys(newValues) as Array<keyof T>).forEach((key) => {
    if (defaultValue[key] !== newValues[key]) {
      changedFields.push(key);
    }
  });

  return changedFields;
};

export function findNestedLevel<T>(
  items: T[],
  targetId: unknown,
  options: { idKey?: string; childrenKey?: string } = {},
  level: number = 0,
): number {
  const { idKey = "id", childrenKey = "children" } = options;

  for (const item of items) {
    if (item[idKey as keyof T] == targetId) {
      return level;
    }

    const children = item[childrenKey as keyof T] as T[] | undefined;

    if (children && children.length > 0) {
      const childLevel = findNestedLevel(
        children,
        targetId,
        options,
        level + 1,
      );

      if (childLevel !== -1) {
        return childLevel;
      }
    }
  }

  return -1;
}

export const findingPageState = (state) => {
  switch (state) {
    case "0":
      return PageStateEnum.Saved;
    case "1":
      return PageStateEnum.Pending;
    case "2":
      return PageStateEnum.PendingUpdate;
    case "3":
      return PageStateEnum.PendingDelete;
    case "100":
      return PageStateEnum.PendingError;
    case "101":
      return PageStateEnum.PendingErrorUpdate;
    case "102":
      return PageStateEnum.PendingErrorDelete;
    default:
      return PageStateEnum.Opened;
  }
};

export const renderBadge = ({
  type,
  title,
}: {
  type: BadgeTypeEnum;
  title: string;
}) => {
  if (type === BadgeTypeEnum.Success) return <BadgeSuccess title={title} />;
  if (type === BadgeTypeEnum.Secondary) return <BadgeSecondary title={title} />;
  if (type === BadgeTypeEnum.Error) return <BadgeError title={title} />;
};

export const renderPageState = (pageState: PageStateEnum) => {
  if (pageState === PageStateEnum.Changed) return <ChangedBadge />;
  if (pageState === PageStateEnum.Saved) return <SavedBadge />;
  if (pageState === PageStateEnum.NeedReload) return <NeedReloadBadge />;
  if (pageState === PageStateEnum.Pending) return <PendingAddIcon />;
  if (pageState === PageStateEnum.PendingDelete) return <PendingDeleteIcon />;
  if (pageState === PageStateEnum.PendingUpdate) return <PendingUpdateIcon />;
  if (pageState === PageStateEnum.PendingError) return <ErrorAddIcon />;
  if (pageState === PageStateEnum.PendingErrorDelete)
    return <ErrorDeleteIcon />;
  if (pageState === PageStateEnum.PendingErrorUpdate)
    return <ErrorUpdateIcon />;
  return null; // Default case
};

export const formRulesReturner = (rules: IRule[]) => {
  return rules?.map((item) => {
    switch (item.rule) {
      case "required":
        return {
          required: true,
          message: item.message || "این فیلد الزامی می باشد",
        };
      case "minLength":
        return {
          min: item.condition,
          message: item.message || `حداقل طول باید ${item.condition} باشد`,
        };
      case "maxLength":
        return {
          max: item.condition,
          message: item.message || `حداکثر طول باید ${item.condition} باشد`,
        };
      case "nationalCode":
        return { validator: validateNationalCode };
      default:
        return item;
    }
  });
};

export function convertUrl(url: string): string {
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  return lastPart.charAt(0).toLowerCase() + lastPart.slice(1);
}
export function randomString(length: number = 50): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}
export const hasStoredValue = (val: any) => {
  if (val === undefined) return false;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "string") return val.trim().length > 0;

  return true;
};

export function columnsSorting(columns: IColumnConfig[]): IColumnConfig[] {
  return columns
    .map((col, index) => ({ ...col, _index: index }))
    .sort((a, b) => {
      if (a.order === undefined && b.order === undefined)
        return a._index - b._index;
      if (a.order === undefined) return 1;
      if (b.order === undefined) return -1;
      return a.order - b.order;
    })
    .map(({ _index, ...col }) => col);
}

export function checkAndRedirectIfNeeded(
  initialPage: IInitialPage,
  pathname: string,
): {
  isAdd: boolean;
} {
  const pathParts = pathname.split("/").filter(Boolean);
  const currentUrl = pathParts.length > 1 ? pathParts.slice(1).join("/") : "";
  const normalizedCurrentUrl = currentUrl.replace(/\/$/, "").trim();
  const normalizedExpectedUrl = (initialPage.url || "")
    .split("?")[0]
    .replace(/\/$/, "")
    .trim();
  if (
    normalizedCurrentUrl &&
    normalizedExpectedUrl &&
    normalizedCurrentUrl !== normalizedExpectedUrl
  ) {
    return { isAdd: false };
  } else {
    return { isAdd: true };
  }
}
