import {
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';

import {
  Form,
  Spin,
} from 'antd';
import { FormInstance } from 'antd/lib';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  PlusOutline,
  SpinIcon,
} from '@components/atoms/iconComponents';
import {
  useFormChangeFields,
} from '@components/organisms/sideBarForm/hooks/useFormChangeFields';
import {
  IDynamicModalConfig,
  ReloadType,
} from '@components/organisms/sideBarForm/types';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useCUDDataMutation } from '@services/base';
import { setPageData } from '@slice/pages';
import { showSuccessToast } from '@utils/toast';

import { ISelectTafsili } from './types';

interface AddCategoryFormProps {
  config: IDynamicModalConfig;
  setOpenModal: Dispatch<SetStateAction<boolean>> | null;
  setTypeId?: (id: number) => void;
  isEdit?: boolean;
  setIsEdit?: Dispatch<SetStateAction<boolean>>;
  editingRecordSide?: ISelectTafsili;
  setEditingRecordSide?: Dispatch<SetStateAction<ISelectTafsili>>;
  form: FormInstance<any>;
  selectRefetch: ReloadType;
  openModal?: boolean;
}

export const AddCategoryForm = (props: AddCategoryFormProps) => {
  const {
    config,
    setOpenModal,
    setTypeId,
    isEdit,
    setIsEdit,
    editingRecordSide,
    setEditingRecordSide,
    form,
    selectRefetch,
    openModal,
  } = props;

  const t = useTranslations();
  const dispatch = useDispatch();
  const formValues = Form.useWatch([], form);
  const { match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const { setInitialValues, changeFields } = useFormChangeFields(
    form,
    formValues,
  );

  useEffect(() => {
    if (isEdit && editingRecordSide) {
      setInitialValues({
        TafsiliCategoryDesc: editingRecordSide.TafsiliCategoryDesc,
      });
    }
    if (!isEdit) {
      form.resetFields();
    }
  }, [isEdit, editingRecordSide]);

  const handleSubmit = async (values: any) => {
    const body = isEdit
      ? {
          TafsiliCategoryDesc: values.TafsiliCategoryDesc,
          [config.idFieldKeyUpdateSide]:
            editingRecordSide?.[config.idFieldKeyUpdateSide],
          ChangeFields: changeFields,
        }
      : {
          TafsiliCategoryDesc: values.TafsiliCategoryDesc,
        };
    const res = await mutateItem({
      url: isEdit ? config.updateUrlSide : config.createUrlSide,
      body,
    }).unwrap();

    if (res?.Result == "Success") {
      const newId = res?.Key;
      showSuccessToast(t("toast.successTitle"));
      form.resetFields();
      if (isEdit) {
        setTypeId(newId);
        setIsEdit(false);
        setEditingRecordSide(null);
      } else {
        setTypeId(newId);
        !match ? setOpenModal(false) : null;
        dispatch(
          setPageData({
            name: "selectedTafsiliId",
            value: newId,
          }),
        );
      }
      selectRefetch();
    }
  };

  const shouldShowSubmit = (openModal && !match) || match;
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="flex flex-col gap-3"
    >
      <Form.Item
        label=""
        name="TafsiliCategoryDesc"
        className="!mb-0"
        rules={[{ required: true, message: "مقدار را وارد کنید" }]}
      >
        <InputText />
      </Form.Item>
      <div className="flex justify-end items-center gap-2">
        {match && (
          <CustomTooltip title={t("general.addNew")}>
            <span
              className="bg-gray-gray3 px-2 py-[2.8px] rounded cursor-pointer"
              onClick={() => {
                form.resetFields();
              }}
            >
              <PlusOutline />
            </span>
          </CustomTooltip>
        )}
        {shouldShowSubmit && (
          <CustomButton
            type="text"
            htmlType="submit"
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            {mutateIsLoading ? (
              <Spin size="large" indicator={<SpinIcon />} />
            ) : isEdit ? (
              t("general.update")
            ) : (
              t("general.submit")
            )}
          </CustomButton>
        )}
      </div>
    </Form>
  );
};
