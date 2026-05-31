import {
  useEffect,
  useState,
} from 'react';

import {
  Checkbox,
  Form,
  Spin,
} from 'antd';
import type { Rule } from 'antd/es/form';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import {
  CustomButton,
  CustomTooltip,
  DynamicSelect,
} from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import MapComponent from '@components/atoms/defaultElements/map';
import {
  PlusOutline,
  SpinIcon,
} from '@components/atoms/iconComponents';
import {
  apiService,
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { IContactInfo } from '@services/com/contactInfo/type';
import type { IRequest } from '@services/com/goodExtraInfo/type';
import type { IRequestConfig } from '@type/elementType';
import { transformDotNotationToNested } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

enum fieldType {
  email = 989,
  address,
  phoneNumber,
  mobile,
  socialMedia,
}

const extraInfoDynamicValueProvince: IRequestConfig = {
  endpoint: "api/com/select/location4selectOption",
  LocationTypeId: 1479,
};

const extraInfoDynamicValueCity: IRequestConfig = {
  endpoint: "api/com/select/location4selectOption",
};

export const FormContactInfo = ({
  createUrl,
  updateUrl,
  id,
  locale,
  sourceKey,
  fieldKey,
  sourceId,
  clearId,
  getUrl,
  repoViewId,
}) => {
  const dispatch = useDispatch();

  const { data: defaultValue } = useGetData<IContactInfo[], IRequest>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      [sourceKey]: sourceId,
      Id: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const [selectedProvince, setSelectedProvince] = useState<IRequestConfig>(
    extraInfoDynamicValueCity,
  );
  const [changeFields, setChangeFields] = useState([]);
  const [originalValues, setOriginalValues] = useState(null);
  const t = useTranslations();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);
  const independentKey = Form.useWatch("ContactTypeId", form);
  const isIranLocale = locale === "fa";
  const [dependentLabel, setDependentLabel] = useState<string>("");
  const filteredChangeFields = changeFields?.filter(
    (field) => field !== "LocationDesc",
  );
  const getValidationRule = (fieldTypeId): Rule[] => {
    switch (fieldTypeId) {
      case fieldType.email:
        return [
          {
            type: "email",
            message: t("general.theEmailEnteredIsNotValid"),
            required: true,
          },
        ];
      case fieldType.mobile:
        return [
          {
            validator: (_, value) => {
              if (!value)
                return Promise.reject(t("general.thisFieldIsRequired"));
              const iranMobile = /^09\d{9}$/;
              const intlMobile = /^\+?[1-9]\d{10,14}$/; // E.164
              if (
                (isIranLocale && iranMobile.test(value)) ||
                (!isIranLocale && intlMobile.test(value))
              ) {
                return Promise.resolve();
              }
              return Promise.reject(
                t("general.theMobileNumberEnteredIsNotValid"),
              );
            },
            required: true,
          },
        ];
      case fieldType.address:
        return [
          {
            type: "string",
            min: 5,
            message: t("general.theAddressMustBeAtLeast5Characters"),
            required: true,
          },
        ];
      case fieldType.socialMedia:
        return [
          {
            type: "string",
            required: true,
            message: t("general.enterTheSocialMediaLinkOrID"),
          },
        ];
      default:
        return [
          {
            required: true,
            message: t("general.thisFieldIsRequired"),
          },
        ];
    }
  };

  const renderField = (value) => {
    if (!value) return null;
    else if (value === fieldType.address) {
      return;
    } else if (value === fieldType.email) {
      return (
        <Form.Item
          label={dependentLabel}
          name="ContactInfo"
          rules={getValidationRule(independentKey)}
          className="flex flex-col lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
        >
          <InputText />
        </Form.Item>
      );
    } else if (value === fieldType.mobile) {
      return (
        <Form.Item
          label={dependentLabel}
          name="ContactInfo"
          rules={getValidationRule(independentKey)}
          className="flex flex-col lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
        >
          <InputText
            autoComplete="off"
            maxLength={isIranLocale ? 11 : 15}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "");
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("Text");
              if (!/^\d+$/.test(pasted)) {
                e.preventDefault();
              }
            }}
          />
        </Form.Item>
      );
    } else if (value === fieldType.phoneNumber) {
      return (
        <Form.Item
          label={dependentLabel}
          name="ContactInfo"
          rules={getValidationRule(independentKey)}
          className="flex flex-col lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
        >
          <InputText
            autoComplete="off"
            maxLength={isIranLocale ? 12 : 15}
            onKeyPress={(e) => {
              if (!/[0-9-]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("Text");
              if (!/^[0-9-]+$/.test(pasted)) {
                e.preventDefault();
              }
            }}
          />
        </Form.Item>
      );
    } else if (value === fieldType.socialMedia) {
      return (
        <Form.Item
          label={dependentLabel}
          name="ContactInfo"
          rules={getValidationRule(independentKey)}
          className="flex flex-col lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
        >
          <InputText />
        </Form.Item>
      );
    } else return;
  };

  const handleSubmit = async (values) => {
    const cleanValues = transformDotNotationToNested(values);
    const dependentValue = cleanValues?.ContactInfo;
    if ("LocationDesc" in cleanValues) {
      delete cleanValues.LocationDesc;
    }
    try {
      let mutateResult;

      if (id) {
        mutateResult = await mutateItem({
          url: updateUrl,
          body: {
            ...cleanValues,
            ContactTypeId: cleanValues?.ContactTypeId,
            ContactInfo: dependentValue,
            [sourceKey]: sourceId,
            [fieldKey]: id,
            ChangeFields: filteredChangeFields,
          },
        }).unwrap();
      } else {
        mutateResult = await mutateItem({
          url: createUrl,
          body: {
            ...cleanValues,
            ContactTypeId: cleanValues?.ContactTypeId,
            ContactInfo: dependentValue,
            [sourceKey]: sourceId,
          },

          [fieldKey]: id,
        }).unwrap();
      }
      if (mutateResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        form.resetFields();
        (dispatch as any)(
          apiService.util.updateQueryData(
            "getInfinite",
            {
              url: getUrl,
              body: { RepoViewId: repoViewId, [sourceKey]: id },
              id: "All",
            },
            (draft) => {
              if (draft?.Data) draft.Data = [];
            },
            false,
          ),
        );
      }
    } catch (error) {
      null;
    }
  };

  useEffect(() => {
    if (originalValues) {
      for (const key in formValues) {
        if (originalValues[key] !== formValues[key]) {
          const exist = changeFields.find((item) => item === key);

          if (!exist) {
            setChangeFields((prevState) => [...prevState, key]);
          }
        }
      }
    }

    if (formValues?.LocationDesc) {
      setSelectedProvince((prev) => ({
        ...prev,
        FatherId: formValues?.LocationDesc,
      }));
    }
  }, [formValues, originalValues]);

  useEffect(() => {
    form.resetFields();
    setChangeFields([]);
    setOriginalValues(null);
    if (id && defaultValue?.Data) {
      form.setFieldValue("ContactTypeId", defaultValue?.Data[0]?.ContactTypeId);
      form.setFieldValue("ContactDesc", defaultValue?.Data[0]?.ContactDesc);
      form.setFieldValue("IsDefault", defaultValue?.Data[0]?.IsDefault);
      form.setFieldValue("ContactInfo", defaultValue?.Data[0]?.ContactInfo);

      form.setFieldValue(
        "LocationId",
        defaultValue?.Data[0]?.Location.LocationId,
      );
      form.setFieldValue(
        "FatherLocationId",
        defaultValue?.Data[0]?.Location.FatherLocationId,
      );
      form.setFieldValue(
        "LocationDesc",
        defaultValue?.Data[0]?.Location.FatherLocationId,
      );
      form.setFieldValue("PostalCode", defaultValue?.Data[0]?.PostalCode);
      form.setFieldValue("Lat", defaultValue?.Data[0]?.Lat);
      form.setFieldValue("Lon", defaultValue?.Data[0]?.Lon);
      const temp = {
        ContactTypeId: defaultValue?.Data[0]?.ContactTypeId,
        ContactDesc: defaultValue?.Data[0]?.ContactDesc,
        IsDefault: defaultValue?.Data[0]?.IsDefault,
        ContactInfo: defaultValue?.Data[0]?.ContactInfo,
        FatherLocationId: defaultValue?.Data[0]?.FatherLocationId,
        LocationDesc: defaultValue?.Data[0]?.LocationDesc,
        LocationId: defaultValue?.Data[0]?.LocationId,
        PostalCode: defaultValue?.Data[0]?.PostalCode,
        Lat: defaultValue?.Data[0]?.Lat,
        Lon: defaultValue?.Data[0]?.Lon,
      };
      setOriginalValues(temp);
    }
  }, [defaultValue?.Data, form, id]);

  useEffect(() => {
    if (independentKey === fieldType.address) {
      setDependentLabel("آدرس");
    } else if (independentKey === fieldType.email) {
      setDependentLabel("ایمیل");
    } else if (independentKey === fieldType.mobile) {
      setDependentLabel("موبایل");
    } else if (independentKey === fieldType.phoneNumber) {
      setDependentLabel("تلفن");
    } else if (independentKey === fieldType.socialMedia) {
      setDependentLabel("رسانه اجتماعی");
    } else setDependentLabel("");
  }, [independentKey]);

  return (
    <Form
      autoComplete="off"
      form={form}
      initialValues={{
        IsDefault: false,
      }}
      name="personContact"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-12 w-full gap-4`}
    >
      <Form.Item
        label={t("general.title")}
        name="ContactDesc"
        rules={[
          {
            required: true,
            message: t("general.thisFieldIsRequired"),
            type: "string",
          },
        ]}
        className="flex flex-col lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
      >
        <InputText />
      </Form.Item>
      <Form.Item
        label={t("general.type")}
        rules={[
          {
            required: true,
            message: t("general.thisFieldIsRequired"),
            type: "number",
          },
        ]}
        name="ContactTypeId"
        className="flex flex-col lg:col-span-6 !mb-0 !pb-0 w-full text-xs"
      >
        <DynamicSelect
          showSearch
          dynamicValue={{
            endpoint: "api/com/Select/CommonInfo4ContactType",
            repoViewId: 30066,
            addAppUrl: "string",
            addWebUrl: "string",
          }}
          config={{
            name: "ContactTypeId",
            caption: t("general.type"),
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      {renderField(independentKey)}
      <Form.Item
        name="IsDefault"
        rules={[{ type: "boolean" }]}
        valuePropName="checked"
        className={`${independentKey === fieldType.address ? "lg:col-span-12" : "lg:col-span-6"} flex items-center w-full !mb-0 text-xs`}
      >
        <Checkbox> {t("general.imposingDutie")}</Checkbox>
      </Form.Item>
      {independentKey === fieldType.address && (
        <div className="contents">
          <Form.Item
            label={t("general.province")}
            name="LocationDesc"
            className="lg:col-span-6 !mb-0 w-full text-xs"
          >
            <DynamicSelect
              dynamicValue={extraInfoDynamicValueProvince}
              showId
              showSearch
              allowClear
              infinite
              onChange={(value) => {
                form.setFieldValue("LocationId", null);

                setSelectedProvince((prev) => ({
                  ...prev,
                  FatherId: value,
                }));

                form.setFieldValue("LocationDesc", value);
              }}
              config={{
                name: "LocationDesc",
                caption: "نوع",
                setFieldValue: form.setFieldValue,
              }}
            />
          </Form.Item>
          <Form.Item
            label={t("general.city")}
            name="LocationId"
            className="lg:col-span-6 !mb-0 w-full text-xs"
          >
            <DynamicSelect
              dynamicValue={selectedProvince}
              showId
              showSearch
              allowClear
              infinite
              disabled={!selectedProvince.FatherId}
              // onChange={(value) => {
              //   form.setFieldValue("LocationId", value);
              // }}
            />
          </Form.Item>
          <Form.Item
            label={t("general.address")}
            name="ContactInfo"
            className="lg:col-span-6 !mb-0 w-full text-xs"
            rules={[
              {
                required: true,
                message: t("general.thisFieldIsRequired"),
                type: "string",
              },
            ]}
          >
            <InputText autoComplete="off" required />
          </Form.Item>
          <Form.Item
            label={t("general.postalCode")}
            name="PostalCode"
            className="lg:col-span-6 !mb-0 w-full text-xs"
            rules={[
              {
                validator: (_, value) => {
                  if (!value || value === "") {
                    return Promise.resolve();
                  }
                  const iranPostal = /^\d{10}$/;
                  const intlPostal = /^[A-Za-z0-9\- ]{4,12}$/;
                  if (
                    (isIranLocale && iranPostal.test(value)) ||
                    (!isIranLocale && intlPostal.test(value))
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    t("general.theEnteredPostalCodeIsNotValid"),
                  );
                },
              },
            ]}
          >
            <InputText
              maxLength={10}
              autoComplete="off"
              onKeyPress={(e) => {
                const allowedChars = isIranLocale ? /[0-9]/ : /[A-Za-z0-9\- ]/;
                if (!allowedChars.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
          <Form.Item
            name="Lat"
            className="col-span-12 mx-auto !mb-0 w-full text-xs"
          >
            <MapComponent
              key="map-component"
              height={250}
              onChange={(Location) => {
                if (Location && Location.length === 2) {
                  const Lat = Location[0];
                  const Lon = Location[1];
                  form.setFieldValue("Lat", Lat);
                  form.setFieldValue("Lon", Lon);
                }
              }}
              defaultCenter={
                form.getFieldValue("Lat") && form.getFieldValue("Lon")
                  ? [form.getFieldValue("Lat"), form.getFieldValue("Lon")]
                  : undefined
              }
            />
          </Form.Item>
        </div>
      )}
      <Form.Item className="col-span-12 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2 w-full">
          <CustomTooltip title={t("general.addNew")}>
            <span
              className="bg-gray-gray3 px-2 py-[2.8px] rounded cursor-pointer"
              onClick={() => {
                clearId();
                form.resetFields();
              }}
            >
              <PlusOutline />
            </span>
          </CustomTooltip>
          <CustomButton
            type="text"
            htmlType="submit"
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            {mutateIsLoading ? (
              <Spin size="large" indicator={<SpinIcon />} />
            ) : (
              t("general.submit")
            )}
          </CustomButton>
        </div>
      </Form.Item>
    </Form>
  );
};
