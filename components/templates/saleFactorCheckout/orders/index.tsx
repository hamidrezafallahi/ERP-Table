import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { shallowEqual } from 'react-redux';

import { CustomModal } from '@components/atoms/defaultElements';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import OrderCard from './orderCard';

export default function Orders() {
  const [editable, isEditable] = useState(null);
  const [modalContent, setModalContent] = useState(null);

  const ref = useRef(null);

  const { items } = useAppSelector((state) => {
    const items = state.withPersist.pages?.find(
      (item) => item.isActive === true
    )?.pageData?.find(i=>i.name === "items")?.value;
    return { items };
  }, shallowEqual);
  const handleClickOutside = () => {
    if (modalContent == null) {
      isEditable(null);
    }
  };
  useClickOutside(ref, handleClickOutside);

  return (
    <div
      className={`hidden-show-scrollBar relative flex flex-col gap-3  !min-h-[calc(100dvh-550px)] overflow-y-auto`} //
      ref={ref}
    >
      {items?.map((item, index) => (
        <OrderCard
          product={item}
          key={index}
          index={index}
          editable={index == editable}
          isEditable={isEditable}
          setModalContent={setModalContent}
        />
      ))}
      <CustomModal
        contentClassName={`p-4 pb-16 relative lg:min-w-[520px]  lg:h-[300px] `}
        headerName={modalContent?.label}
        headerIcon={modalContent?.icon}
        closeModal={() => setModalContent(null)}
        isModalOpen={modalContent ? true : false}
        content={modalContent?.content}
      />
    </div>
  );
}

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};
