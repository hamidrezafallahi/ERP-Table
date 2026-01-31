"use client";
import "./customStyle.css";

import React, { useEffect, useState } from "react";

import { Table, TableColumnsType } from "antd";
import { useTranslations } from "next-intl";

import { Dots, NoData, SpinIcon } from "@components/atoms/iconComponents";
import { IAccessRepo, IRequest } from "@services/auth/access/type";
import { useGetData } from "@services/base";

import AccessByAuthorizedList from "./AccessByAuthorizedList";
import CircularButton from "./circularButton";
import MoreActionList from "./moreActionList";
import type { Action, IChecker, IRepos, ISystemId } from "./type";

interface IProps {
  id: number;
  setBody: any;
  systemId: number;
  systemIds: ISystemId[];
  resetData: number;
}
interface IRepoAccess {
  RepoId: number;
  RepoName: string;
  Actions: IActions[];
}
interface IActions {
  ActionId: number;
  ActionName: string;
  ActionType: number;
  AccessLevel: number;
  HasAccess: boolean;
  HasPlace: boolean;
}

function AccessTable({ ...props }: IProps) {
  const [roleAccessItems, setRoleAccessItems] = useState([]);
  const t = useTranslations();
  const { id, setBody, systemId, systemIds, resetData } = props;
  const { data, isLoading, isFetching, refetch } = useGetData<
    IAccessRepo,
    IRequest
  >({
    url: "/api/auth/select/role/roleActions",
    body: {
      RepoViewId: 20001,
      RoleId: id,
      SystemId: systemId,
    },
  });
  useEffect(() => {
    if (data?.Result == "Success") {
      const sample2: IRepoAccess[] = data.Data[0].RoleAccessItems.map(
        (item) => ({
          key: item.RepoId,
          title: item.RepoName,
          showAccess: {
            ...item,
            originalValue:
              item.Actions.find((item) => item.ActionType == 1)?.AccessLevel ??
              0,
          },
          insert: {
            ...item.Actions.find((item) => item.ActionType == 2),
            originalValue: item.Actions.find((item) => item.ActionType == 2)
              ?.HasAccess,
            RepoId: item.RepoId,
          },
          edit: {
            ...item.Actions.find((item) => item.ActionType == 3),
            originalValue: item.Actions.find((item) => item.ActionType == 3)
              ?.HasAccess,
            RepoId: item.RepoId,
          },
          delete: {
            ...item.Actions.find((item) => item.ActionType == 4),
            originalValue: item.Actions.find((item) => item.ActionType == 4)
              ?.HasAccess,
            RepoId: item.RepoId,
          },
          action: item.Actions.filter(
            (actionItem) => actionItem.ActionType == 5
          ).map((actionItem) => ({
            ...actionItem,
            originalValue: actionItem.HasAccess,
            RepoId: item.RepoId,
          })),
        })
      );
      setRoleAccessItems(sample2);
    }
  }, [data]);
  useEffect(() => {
    refetch();
  }, [resetData]);
  const changeChecker = (check: IChecker) => {
    setBody((prev) => {
      const existingActionIndex = prev.RoleActions.findIndex(
        (item) => item.ActionId === check.ActionId
      );
      if (existingActionIndex !== -1) {
        return {
          ...prev,
          RoleActions: prev.RoleActions.map((item) =>
            item.ActionId === check.ActionId ? check : item
          ),
        };
      } else {
        return {
          ...prev,
          RoleActions: [...prev.RoleActions, check],
        };
      }
    });
  };
  const handleAddPlaces = (e) => {
    const places = e.Places.map((item) => ({
      PlaceId: item.id,
      Mode: item.checked ? "emInsert" : "emDelete",
    }));
    const newRoleAction = {
      ActionId: e.ActionId,
      Mode: e.Mode ? "Add" : "Delete",
      Places: places,
    };
    setBody((prev) => {
      const existingActionIndex = prev.RoleActions.findIndex(
        (item) => item.ActionId === e.ActionId
      );
      if (existingActionIndex !== -1) {
        return {
          ...prev,
          RoleActions: prev.RoleActions.map((item) =>
            item.ActionId === e.ActionId ? { ...item, Places: places } : item
          ),
        };
      } else {
        return {
          ...prev,
          RoleActions: [...prev.RoleActions, newRoleAction],
        };
      }
    });
  };

  const changeAccessLevel = (accessLevel: number, item: IRepos) => {
    const temp = {
      ActionId: item.Actions.find((item) => item.ActionType === 1).ActionId,
      AccessLevel: accessLevel,
      originalValue: item.originalValue,
      Places: [],
      Mode: item.Actions.find((item) => item.ActionType === 1)?.AccessLevel
        ? "Update"
        : "Add",
    };
    setBody((prev) => {
      const existingActionIndex = prev.RoleActions.findIndex(
        (item) => item.ActionId === temp.ActionId
      );
      if (existingActionIndex !== -1) {
        return {
          ...prev,
          RoleActions: prev.RoleActions.map((item) =>
            item.ActionId === temp.ActionId ? temp : item
          ),
        };
      } else {
        return {
          ...prev,
          RoleActions: [...prev.RoleActions, temp],
        };
      }
    });
  };
  const columns: TableColumnsType = [
    {
      title: "عنوان",
      dataIndex: "title",
      key: "title",
      //   render: (text) => <a>{text}</a>,
      width: 200,
    },
    {
      title: "نمایش",
      dataIndex: "showAccess",
      key: "showAccess",
      width: 120,
      align: "center",
      render: (item: IRepos) => (
        <CircularButton
          preState={
            item.Actions.find((item) => item.ActionType === 1)?.AccessLevel ?? 0
          }
          handleChange={(e) => changeAccessLevel(e, item)}
        />
      ),
    },
    {
      title: "درج",
      dataIndex: "insert",
      key: "insert",
      width: 120,
      align: "center",
      render: (cellData: Action) => (
        <>
          {cellData && (
            <AccessByAuthorizedList
              systemIds={systemIds}
              item={{
                Mode: cellData?.HasAccess,
                ActionId: cellData?.ActionId,
                RepoId: cellData.RepoId,
                id,
              }}
              handleChange={(check) => changeChecker(check)}
              handleSubmit={(e) => handleAddPlaces(e)}
              title={
                <span className="cursor-pointer">
                  <Dots config={{ height: 20, width: 16 }} />
                </span>
              }
              endPoint={"/api/auth/select/access"}
              ActionType={cellData.ActionType}
              actionTypeId={2}
            />
          )}
        </>
      ),
    },
    {
      title: "ویرایش",
      key: "edit",
      dataIndex: "edit",
      width: 120,
      align: "center",
      render: (cellData: Action) => (
        <>
          {cellData && (
            <AccessByAuthorizedList
              item={{
                Mode: cellData?.HasAccess,
                ActionId: cellData?.ActionId,
                id,
                RepoId: cellData.RepoId,
              }}
              systemIds={systemIds}
              handleChange={(check) => changeChecker(check)}
              handleSubmit={(e) => handleAddPlaces(e)}
              title={
                <span className="cursor-pointer">
                  <Dots config={{ height: 20, width: 16 }} />
                </span>
              }
              endPoint={"/api/auth/select/access"}
              ActionType={cellData.ActionType}
              actionTypeId={3}
            />
          )}
        </>
      ),
    },
    {
      title: "حذف",
      key: "delete",
      dataIndex: "delete",
      width: 120,
      align: "center",
      render: (cellData: Action) => (
        <>
          {cellData && (
            <AccessByAuthorizedList
              item={{
                Mode: cellData?.HasAccess,
                ActionId: cellData?.ActionId,
                RepoId: cellData.RepoId,
                id,
              }}
              systemIds={systemIds}
              handleChange={(check) => changeChecker(check)}
              handleSubmit={(e) => handleAddPlaces(e)}
              title={
                <span className="cursor-pointer">
                  <Dots config={{ height: 20, width: 16 }} />
                </span>
              }
              endPoint={"/api/auth/select/access"}
              ActionType={cellData.ActionType}
              actionTypeId={4}
            />
          )}
        </>
      ),
    },
    {
      title: "عملیات",
      key: "action",
      dataIndex: "action",
      align: "center",
      render: (item: Action[]) => {
        return (
          <>
            {item.length > 0 && (
              <MoreActionList
                actions={item}
                id={id}
                systemIds={systemIds}
                handleSubmit={(e) => handleAddPlaces(e)}
                handleChange={(check) => changeChecker(check)}
              />
            )}
          </>
        );
      },
    },
  ];

  return (
    <div className="hidden-show-scrollBar p-5 border rounded-lg w-full h-full overflow-y-auto">
      <Table
        className="access-table w-full"
        tableLayout="auto"
        columns={columns}
        dataSource={roleAccessItems}
        pagination={false}
        // virtual
        // scroll={{x: '100%',y: '100%' }}
        loading={{
          spinning: isLoading || isFetching,
          indicator: (
            <div className="flex justify-center items-center">
              <SpinIcon config={{ width: 40, height: 40 }} />{" "}
            </div>
          ),
        }}
        locale={{
          emptyText: (
            <div className="flex flex-col justify-center items-center gap-8 m-28">
              <NoData />
              <span className="text-[18px] text-gray-gray9">
                {t("general.noData")}
              </span>
            </div>
          ),
        }}
        // rowClassName={"!h-10"}
      />
    </div>
  );
}

export default AccessTable;
