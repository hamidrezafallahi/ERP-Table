import React, {
  useMemo,
  useState,
} from 'react';

import { Skeleton } from 'antd';

import { useAppSelector } from '@redux/index';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { IRequest } from '@services/reportFile/type';

import SelectedUserModal from './selectedUserModal';
import TableHeader from './tableHeader';
import { User } from './type';
import UserRow from './userRow';

export default function UserList() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [triggerItem] = useCUDDataMutation();

  const { data, isLoading, refetch } = useGetData<User[], IRequest>({
    url: "/api/mng/select/users",
    body: {},
  });

  const list = useMemo(() => {
    return data?.Result ? data.Data : [];
  }, [data]);

  const { ManagementAccountId } = useAppSelector((state) => ({
    ManagementAccountId:
      state.withPersist.config.userSession?.ManagementAccounts?.[0]
        ?.ManagementAccountId,
  }));

  const handleConfirm = async (UserId: number, user: User) => {
    if (!ManagementAccountId) return;

    try {
      const url = user.IsAdmin
        ? "/api/mng/delete/accountAdmin"
        : "/api/mng/insert/accountAdmin";

      await triggerItem({
        url,
        body: { UserId, AccountId: ManagementAccountId },
      }).unwrap();

      setTimeout(() => setSuccessMessage(""), 5000);
      refetch();
    } catch (error) {
      ("");
    }
  };

  return (
    <div className="relative">
      <div className="top-0 right-0 left-0 z-20 sticky bg-white dark:bg-gray-gray12 w-full">
        <TableHeader />
      </div>

      <div className="lg:h-[calc(100dvh-200px)] lg:overflow-auto">
        {isLoading && <Skeleton active loading />}
        {successMessage && (
          <div className="bg-green-100 mb-2 p-2 rounded text-green-800">
            {successMessage}
          </div>
        )}

        {list?.map((user, index) => (
          <UserRow
            key={user.UserId}
            user={user}
            index={index}
            onSelect={(user) => setSelectedUser(user)}
          />
        ))}
      </div>

      <SelectedUserModal
        onClose={() => setSelectedUser(null)}
        onConfirm={handleConfirm}
        user={selectedUser}
        visible={Boolean(selectedUser)}
      />
    </div>
  );
}
