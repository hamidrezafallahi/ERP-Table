"use client";
import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
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
  MenuAlt,
  Notes,
} from '@components/atoms/iconComponents';
import Title from '@components/atoms/Title';
import { AccountConnection } from '@components/molecules/accounting';
import NestedList from '@components/organisms/nestedList';
import {
  AccountTypeEnum,
  FundTypeEnum,
} from '@components/organisms/nestedList/enum';
import type { INestedListConfig } from '@components/organisms/nestedList/types';
import SideBarFormContext
  from '@components/organisms/sideBarForm/sideBarFormContext';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import type { IAccount } from '@services/acc/account/type';
import { addNewPage } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';

import { defaultDescriptionsConfig } from './defaultDescriptionsConfig';

export default function AccountTemplate() {
  const t = useTranslations();
  const dispatch = useDispatch();

  const { match, initPage } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const initPage = state.withPersist.init;

    return { match, initPage };
  }, shallowEqual);
  const pageType = PageTypeEnum.NestedList;

  const repoId = initPage?.RepoId;
  const pageId = initPage?.pageId;
  const systemId = initPage?.SystemId;
  const baseUrl = initPage?.url;
  const Id = initPage?.Id;

  const levelMapping = {
    1: "accountGroh",
    2: "accountKol",
    3: "accountMoeen",
  };
  const accountConfig: INestedListConfig = {
    pageIcon: "UnitOfMeasurementIcon",
    getUrl: "/api/acc/select/account",
    createUrl: "/api/acc/insert/account",
    updateUrl: "/api/acc/update/account",
    deleteUrl: "/api/acc/delete/account",
    repoViewId: 10001,
    uniqueKey: "AccountId",
    displayKey: "AccountFullCode",
    descriptionKey: "AccountDesc",
    nestedKey: "Accounts",
    fatherKey: "AccountFatherId",
    levelKey: "AccountLevel",
    tooltips: {
      level1: t("general.group"),
      level2: t("general.total"),
      level3: t("general.subtotal"),
    },
    formConfig: [
      {
        caption: t("general.accountCode"),
        name: "AccountFullCode",
        type: "text",
        rules: [
          {
            required: true,
            message: t("general.enter-", {
              field: t("general.accountCode"),
            }),
          },
        ],
        order: 1,
      },

      {
        caption: t("general.accountType"),
        name: "AccountTypeId",
        rules: [
          {
            required: true,
            message: t("general.select-", {
              field: t("general.accountType"),
            }),
          },
        ],
        type: "selectOption",
        conditionalDynamicValue: (level) => ({
          endpoint: `api/com/select/commonInfo/${levelMapping[level]}`,
          repoViewId: 106070,
        }),
        order: 2,
      },
      {
        caption: t("general.accountDescription"),
        name: "AccountDesc",
        rules: [
          {
            required: true,
            message: t("general.enter-", {
              field: t("general.accountDescription"),
            }),
          },
        ],
        type: "text",
      },
      {
        type: "group",
        renderConditionally: (level) => level === 2,
        groupItems: [
          {
            title: t("general.type"),
            groupFields: [
              {
                name: "AccountType",
                type: "radio",
                options: [
                  {
                    label: t("general.asset"),
                    value: AccountTypeEnum.Asset,
                  },
                  {
                    label: t("general.liability"),
                    value: AccountTypeEnum.Liability,
                  },
                  {
                    label: t("general.equity"),
                    value: AccountTypeEnum.Equity,
                  },
                  {
                    label: t("general.revenue"),
                    value: AccountTypeEnum.Revenue,
                  },
                  {
                    label: t("general.expense"),
                    value: AccountTypeEnum.Expense,
                  },
                  {
                    label: t("general.regulatoryORStatistical"),
                    value: AccountTypeEnum.RegulatoryORStatistical,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "group",
        renderConditionally: (level) => level === 3,
        groupItems: [
          {
            title: t("general.setting"),
            groupFields: [
              {
                name: "IsError",
                caption: t("general.natureError"),
                type: "checkbox",
              },
              {
                name: "IsWarning",
                caption: t("general.natureWarning"),
                type: "checkbox",
              },
              {
                name: "IsCurrencyVoucher",
                caption: t("general.interpretable"),
                type: "checkbox",
              },
            ],
          },
          {
            title: t("general.accountFeatures"),
            groupFields: [
              {
                name: "IsCurrency",
                caption: t("general.currency"),
                type: "checkbox",
              },
              {
                name: "IsFollow",
                caption: t("general.followUp"),
                type: "checkbox",
              },
              {
                name: "IsBudget",
                caption: t("general.budget"),
                type: "checkbox",
              },
              {
                name: "IsNumber",
                caption: t("general.number"),
                type: "checkbox",
              },
              {
                name: "IsRefer",
                caption: t("general.refer"),
                type: "checkbox",
              },
              {
                name: "IsInsurance",
                caption: t("general.insurance"),
                type: "checkbox",
              },
            ],
          },
          {
            title: t("general.type"),
            groupFields: [
              {
                name: "FundType",
                type: "radio",
                defaultValue: FundTypeEnum.None,
                options: [
                  {
                    label: t("general.none"),
                    value: FundTypeEnum.None,
                  },
                  {
                    label: t("general.cashRial"),
                    value: FundTypeEnum.CashRial,
                  },
                  {
                    label: t("general.cashCurrency"),
                    value: FundTypeEnum.CashCurrency,
                  },
                  {
                    label: t("general.bankRial"),
                    value: FundTypeEnum.BankRial,
                  },
                  {
                    label: t("general.bankCurrency"),
                    value: FundTypeEnum.BankCurrency,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isDefaultDescriptionModalOpen, setIsDefaultDescriptionModalOpen] =
    useState(false);
  const [id, setId] = useState<number>(null);

  const addChildCondition = (item: IAccount) => {
    return item.AccountLevel !== 3;
  };
  const renderConnectionAction = (item: IAccount) => {
    if (item.AccountLevel !== 3) return null;
    return (
      <>
        <CustomTooltip title={t("general.accountConnection")}>
          <CustomButton
            type="link"
            icon={
              <MenuAlt
                config={
                  !match ? { width: 18, height: 18 } : { width: 16, height: 16 }
                }
              />
            }
            onClick={() => handleAccountConnectionAction(item.AccountId)}
          />
        </CustomTooltip>
        <CustomTooltip title={t("general.defaultDescription")}>
          <CustomButton
            type="link"
            icon={
              <Notes
                config={
                  !match ? { width: 18, height: 18 } : { width: 16, height: 16 }
                }
              />
            }
            onClick={() => handleDefaultDescriptionAction(item.AccountId)}
          />
        </CustomTooltip>
      </>
    );
  };
  const conditionalActivation = (item: IAccount) => {
    if (item.AccountLevel === 3) return true;
    return false;
  };
  const handleAccountConnectionAction = (id: number) => {
    setId(id);
    setIsConnectionModalOpen(true);
  };
  const handleDefaultDescriptionAction = (id: number) => {
    setId(id);
    setIsDefaultDescriptionModalOpen(true);
  };

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: pageId,
        caption: "title.account",
        icon: "HeadOfAccountsIcon",
        pageState: PageStateEnum.Opened,
        type: pageType,
        RepoId: repoId,
        SystemId: systemId,
        pageData: [],
        url: baseUrl,
        viewData: {
          url: "/api/acc/select/account",
          deletedItems: [],
          statusItems: [],
        },
      }),
    );
  }, [Id]);

  return (
    <>
      <Title caption="title.account" />
      <NestedList
        caption="title.account"
        config={accountConfig}
        addChildCondition={addChildCondition}
        customAction={renderConnectionAction}
        conditionalActivation={conditionalActivation}
        titleKey={["AccountFullCode", "AccountDesc"]}
      />
      {isConnectionModalOpen && (
        <CustomModal
          contentClassName={`lg:min-w-[520px] lg:h-full`}
          headerName={t("general.accountConnection")}
          closeModal={() => setIsConnectionModalOpen(false)}
          isModalOpen={isConnectionModalOpen}
          width={"fit-content"}
          content={
            <AccountConnection
              id={id}
              onClose={() => setIsConnectionModalOpen(false)}
            />
          }
        />
      )}
      {isDefaultDescriptionModalOpen && (
        <CustomModal
          contentClassName={`lg:min-w-[520px] lg:h-full`}
          headerName={t("title.detailedDescription")}
          closeModal={() => setIsDefaultDescriptionModalOpen(false)}
          isModalOpen={isDefaultDescriptionModalOpen}
          content={
            <SideBarFormContext
              config={defaultDescriptionsConfig(id)}
              typeId={id}
              isModal={true}
            />
          }
        />
      )}
    </>
  );
}
