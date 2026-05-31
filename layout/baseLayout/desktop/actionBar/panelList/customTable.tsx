import {
  Key,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Input,
  Spin,
  Table,
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
  CheckOutlinedIcon,
  Close,
  EditPencil,
  SpinIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type { ITagInfo } from '@services/base/type';
import { setPageState } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { getSystemNameById } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

import { DataType } from './type';

export default function CustomTable({ defaultTagsRefetch }) {
  const [data, setData] = useState<DataType[]>([]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [focusedItem, setFocusedItem] = useState(null);
  const inputRef = useRef<any>(null);
  const t = useTranslations();
  const dispatch = useDispatch();
  const { RepoId, SystemId, activePage, similarPage } = useAppSelector(
    (state) => {
      const activePage = state.withPersist.pages?.find((page) => page.isActive);
      const similarPage = state.withPersist.pages?.filter(
        (page) => page.url === activePage?.url
      );

      return {
        RepoId: activePage?.RepoId, // Use optional chaining to avoid errors if activePage is undefined
        SystemId: activePage?.SystemId, // Same here
        activePage,
        similarPage,
      };
    },
    shallowEqual
  );
  const {
    data: personalTagsResponse,
    isSuccess: personalTagsGetIsSuccess,
    refetch,
  } = useGetData<ITagInfo[], null>({
    url: `/api/${getSystemNameById(SystemId)}/select/repoTag`,
    body: {},
  });

  const [trigger, { isLoading }] = useCUDDataMutation();
  const isEditing = useCallback(
    (record: DataType) => record.key === editingKey,
    [editingKey]
  );

  const edit = (record: DataType) => {
    setEditingKey(record.key);
  };

  const save = async (record: DataType) => {
    setFocusedItem(record);
    setData((prevData) => {
      const newData = [...prevData];
      const index = newData.findIndex((item) => record.key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item });
      }
      return newData;
    });
    try {
      const editTagNameResponse = await trigger({
        url: `/api/${getSystemNameById(SystemId)}/update/tag`,
        body: {
          TagId: record.key,
          title: record.name,
          ChangeFields: ["Title"],
        },
      }).unwrap();

      if (editTagNameResponse?.Result === "Success") {
        showSuccessToast(t("toast.updateTagSuccess"));
        refetch();
        defaultTagsRefetch();
      }
    } catch (err) {
      null;
    }
    setFocusedItem(null);
    setEditingKey(null);
  };
  const handleNameChange = useCallback((key: number, newName: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, name: newName } : item
      )
    );
  }, []);
  const handleCancelNameChange = useCallback((key: number) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, name: item.originalName } : item
      )
    );
    setEditingKey(null);
    setFocusedItem(null);
  }, []);
  useEffect(() => {
    if (editingKey !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingKey]);
  useEffect(() => {
    if (personalTagsGetIsSuccess && personalTagsResponse) {
      setData(
        personalTagsResponse.Data.map((tag) => ({
          key: tag.TagId,
          name: tag.Title,
          originalName: tag.Title,
          RepoTagId: tag.RepoTagId,
        }))
      );
    }
  }, [personalTagsResponse, personalTagsGetIsSuccess]);

  const columns = [
    {
      dataIndex: "name",
      key: "name",
      render: (text: string, record: DataType) => {
        const editable = isEditing(record);
        return editable ? (
          <div className="flex justify-between items-center py-[6px]">
            <Input
              disabled={focusedItem?.key == record.key}
              value={record.name}
              onChange={(e) => handleNameChange(record.key, e.target.value)}
              ref={inputRef}
              className="!p-0 focus:!border-none text-[13px]"
              size="small"
            />
            <div className="flex items-center gap-2">
              <CustomTooltip title={t("general.cancel")}>
                <div
                  className="cursor-pointer"
                  onClick={() => handleCancelNameChange(record.key)}
                >
                  <Close config={{ width: 16, height: 16 }} />
                </div>
              </CustomTooltip>
              {isLoading ? (
                <Spin
                  size="small"
                  indicator={<SpinIcon config={{ width: 16, height: 16 }} />}
                />
              ) : (
                <CustomTooltip title={t("general.save")}>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      save(record);
                    }}
                  >
                    <CheckOutlinedIcon config={{ width: 16, height: 16 }} />
                  </div>
                </CustomTooltip>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => edit(record)}
            className="flex justify-between items-center py-4 h-6 text-gray-gray9 dark:text-white text-sm cursor-pointer editable-cell-value-wrap"
          >
            <div>{text}</div>
            <div>
              <EditPencil />
            </div>
          </div>
        );
      },
    },
  ];

  const onSelectChange = (newSelectedRowKeys: Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const handleDeleteTags = async () => {
    try {
      const tagRemoveResponse = await trigger({
        url: `/api/${getSystemNameById(SystemId)}/delete/mainTag`,
        body: {
          Ids: selectedRowKeys,
        },
      }).unwrap();
      if (tagRemoveResponse?.Result === "Success") {
        similarPage.map((page) => {
          dispatch(
            setPageState({
              ...page,
              pageState: PageStateEnum.NeedReload,
            })
          );
        });
        refetch();
        defaultTagsRefetch();
        setSelectedRowKeys([]);
      }
    } catch (err) {
      null;
    }
  };

  return (
    <div className="relative flex flex-col gap-2 p-4 max-h-[500px]">
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={false}
        bordered={false}
        className="overflow-y-auto editTagModalHeader"
      />
      <CustomButton
        className="bottom-4 sticky self-end !bg-gray-gray3 p-4 hover:!border-black-black8 w-20 !text-gray-gray10 hover:!text-black-black8"
        onClick={handleDeleteTags}
        loading={isLoading && focusedItem == null}
      >
        {t("general.delete")}
        {selectedRowKeys.length > 0 && ` (${selectedRowKeys.length}) `}{" "}
      </CustomButton>
    </div>
  );
}
