import { useEffect } from 'react';

import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useDispatch } from 'react-redux';

import { useAppSelector } from '@redux/index';
import { setPageData } from '@slice/pages';

import { IProps } from './type';

const CustomCheckbox = ({ onChange, config, className, ...rest }: IProps) => {
  const defaultClass = ` min-w-5 ${className} `;
  const dispatch = useDispatch();
  const initElement = useAppSelector((state) => {
    if (config) {
      const { name } = config;
      return (
        state.withPersist.pages
          .find((item) => item.isActive)
          ?.pageData?.find((element) => element.name === name)?.value ?? null
      );
    }
    return null;
  });

  useEffect(() => {
    if (config) {
      const { name, setFieldValue } = config;
      if (setFieldValue) {
        setFieldValue(name, initElement);
      }
    }
  }, [initElement, config]);

  const handleChange = (e: CheckboxChangeEvent) => {
    if (config) {
      const {
        caption,
        help,
        name,
        order,
        placeHolder,
        rules,
        type,
        selectEndpoint,
      } = config;

      dispatch(
        setPageData({
          caption,
          help,
          name,
          order,
          placeHolder,
          rules,
          type,
          selectEndpoint,
          value: e.target.checked,
        })
      );
    }
    onChange?.(e);
  };

  return (<>{config?<Checkbox
      className={defaultClass}
      checked={initElement}
      onChange={handleChange}
      {...rest}
    ></Checkbox>:<Checkbox
      className={defaultClass}
      onChange={handleChange}
      {...rest}
    ></Checkbox>}
  </>
    
  );
};
export default CustomCheckbox;
