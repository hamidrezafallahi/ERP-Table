import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { ScrollDownIcon } from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';
import { useGetConditionallyMutation } from '@services/base';
import { setPageData } from '@slice/pages';

import Categories from './categories';

export default function Container({ ...props }) {
  const [visible, setVisible] = useState(false);
  const { customer } = useAppSelector((state) => {
    const customer = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((i) => i.name === "customer")?.value;
    return { customer };
  }, shallowEqual);
  const containerRef = useRef(null);
  const dispatch = useDispatch();

  const [trigger] = useGetConditionallyMutation();

  const handleScroll = () => {
    if (containerRef) {
      const scrollTop = containerRef.current.scrollTop;
      const scrollHeight = containerRef.current.scrollHeight;
      const clientHeight = containerRef.current.clientHeight;
      const scrollPosition = scrollTop + clientHeight;
      if (scrollPosition == scrollHeight) {
        containerRef.current.scrollTop = 0;
        setVisible(false);
      } else {
        setVisible(true);
      }
    }
  };

  const handleVisibility = () => {
    if (containerRef) {
      const scrollTop = containerRef.current.scrollTop;
      const scrollHeight = containerRef.current.scrollHeight;
      const clientHeight = containerRef.current.clientHeight;
      const scrollPosition = scrollTop + clientHeight;
      // console.log(
      //   containerRef.current.scrollTop,
      //   containerRef.current.scrollHeight,
      //   containerRef.current.clientHeight
      // );
      if (scrollPosition == scrollHeight) {
        containerRef.current.scrollTop = scrollHeight;
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
  };
  const handleGoodsCategory = async () => {
    const result: any = await trigger({
      url: "api/com/select/goodsCategory",
      body: {},
    }).unwrap();
    if (result?.Result == "Success") {
      dispatch(setPageData({ name: "goodCategories", value: result.Data }));
    }
  };
  // const handleGoods = async ()=>{
  //   const result :any = await trigger({
  //  url: "api/com/select/goods",
  //     body: {},
  //   }).unwrap()
  //    if (result?.Result == "Success") {
  //       dispatch(setGoodsCategories({pageId:activePageId, goods: result.Data }));
  //     }
  // }

  useEffect(() => {
    if (customer) {
      handleGoodsCategory();
    }
  }, [customer]);

  return (
    <div
      ref={containerRef}
      className="hidden-show-scrollBar relative flex flex-col w-full h-full overflow-y-auto scroll-smooth"
      onScroll={handleVisibility}
    >
      <Categories {...props} />

      <CustomButton
        onClick={handleScroll}
        className={`w-9 h-10 p-0 hover:!border-main-black fixed bottom-72 right-80  z-10 ${
          !visible && "!hidden"
        }`}
      >
        <ScrollDownIcon />
      </CustomButton>
    </div>
  );
}
