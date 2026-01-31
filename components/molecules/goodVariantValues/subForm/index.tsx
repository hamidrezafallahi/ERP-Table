import {
  FC,
  useEffect,
} from 'react';

import {
  Checkbox,
  Form,
} from 'antd';

import { useGetData } from '@services/base';
import type {
  IDetailVariant,
  IRequest,
} from '@services/com/variant/type';

import type { IProps } from './type';

export const SubFormGoodVariantValues: FC<IProps> = ({
  getUrl,
  sourceKey,
  sourceId,
  form,
  fieldKey,
  fieldId,
  variantId,
  title,
  repoViewId,
  setDetailIsLoading,
}) => {
  const { data: detail, isLoading: detailIsLoading } = useGetData<
    IDetailVariant[],
    IRequest
  >({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      [fieldKey]: fieldId,
      [sourceKey]: sourceId,
    },
    id: fieldId,
  });

  const detailData: IDetailVariant[] = detail?.Data;

  useEffect(() => {
    if (detailData) {
      detailData.map((item: IDetailVariant) =>
        form.setFieldValue(`${variantId}-${item.CommonId}`, item.IsChecked)
      );
    }
  }, [detailData, form]);

  useEffect(() => {
    setDetailIsLoading(detailIsLoading);
  }, [detailIsLoading]);

  return (
    <div className="flex flex-col flex-shrink-0 gap-2 w-auto">
      <div className="text-start">_ {title}</div>
      <div className="h-[210px] overflow-y-auto">
        {detailData?.map((data) => {
          return (
            <div key={data.CommonId}>
              <Form.Item<any>
                name={`${variantId}-${data.CommonId}`}
                valuePropName="checked"
                className="m-0 p-0 text-xs"
              >
                <Checkbox defaultChecked={data.IsChecked}>
                  {data.CommonDesc}
                </Checkbox>
              </Form.Item>
            </div>
          );
        })}
      </div>
    </div>
  );
};
