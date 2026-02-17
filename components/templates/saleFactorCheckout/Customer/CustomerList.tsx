import { useState } from 'react';

import { Image } from 'antd';
import { useDispatch } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { useGetData } from '@services/base';
import type {
  ICustomer,
  IRequest,
} from '@services/sale/customer/type';
import { setPageData } from '@slice/pages';

import DebouncedQuickSearch from '../debouncedQuickSearch';

export default function CustomerList({ ...props }) {
  const [FullSearchPhrase, setFullSearchPhrase] = useState("");
  const dispatch = useDispatch();

  const { setOpenModal } = props;
  const { data } = useGetData<ICustomer[], IRequest>({
    url: "api/sale/select/customer",
    body: {
      RepoViewId: 130006,
      FullSearchPhrase,
    },
  });
  const handleClick = async (item: ICustomer) => {
    dispatch(setPageData({name:"customer",value:item }));
    setOpenModal(false);
  };
  return (
    <div className="relative flex flex-col gap-3 p-3 border-t lg:w-[726px] h-[calc(100dvh-48px)] lg:!h-fit lg:!max-h-[500px]">
      <div className="-top-1 z-10 sticky bg-white pt-1 w-full">
        <DebouncedQuickSearch
          setSearch={(e) => {
            setFullSearchPhrase(e);
          }}
        />
      </div>
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-4 h-[calc(100dvh-48px)] lg:!h-fit">
        {data?.Data?.map((item, index) => (
          <CustomButton
            onClick={() => handleClick(item)}
            type="text"
            className={`flex flex-row-reverse lg:flex-col  items-center lg:justify-center justify-end gap-2 lg:col-span-1 !border border-gray-gray85 rounded-lg w-full h-12 lg:h-36 text-wrap`}
            key={index}
          >
            <div>{item?.FullName}</div>
            <div>{item?.CustomerDesc}</div>
            <Image
              width={40}
              height={40}
              src={"https://picsum.photos/200/300"}
              alt={"https://picsum.photos/200/300"}
              onError={() => {
                console.log("error");
              }}
            />
          </CustomButton>
        ))}
      </div>
    </div>
  );
}
