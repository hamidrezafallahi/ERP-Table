"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Drawer,
  Form,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  MenuArrowBack,
  UploadMarker,
} from '@components/atoms/iconComponents';
import Title from '@components/atoms/Title';
import { useNavigatePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import {
  useCUDDataMutation,
  useCUDFormDataMutation,
  useGetConditionallyMutation,
} from '@services/base';
import { setUserSession } from '@slice/config';
import { addNewPage } from '@slice/pages';
import {
  PageTypeEnum,
  SystemEnum,
} from '@type/enum';
import { showSuccessToast } from '@utils/core';

import UserInfoToollbar from './userInfoToollbar';

function UserInfoTemplate() {
  const [form] = Form.useForm();
  const { userSession, initPage, match } = useAppSelector((state) => {
    const userSession = state.withPersist.config.userSession;
    const initPage = state.withPersist.init;
    const match = state.withPersist.config.initMatch;

    return { userSession, initPage, match };
  }, shallowEqual);

  const [getUserinformation] = useGetConditionallyMutation();
  const userId = useMemo(() => {
    return userSession?.UserInfo?.UserId;
  }, [userSession?.UserInfo?.UserId]);
  // const { data } = useGetData<IUserInfoResponse, IRequest>({

  // });

  const [submit] = useCUDDataMutation();
  const [submitImage] = useCUDFormDataMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const ImageInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();
  const dispatch = useDispatch();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAddClick = () => {
    ImageInputRef.current?.click();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setImageUrl("");
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedFile(null);
    setImageUrl("");
  };

  const handleSubmit = async () => {
    const values = form.getFieldsValue();
    const res: any = await submit({
      url: "/api/auth/update/userinformation",
      body: {
        FirstName: values.Person?.FirstName || "",
        LastName: values.Person?.LastName || "",
        UserId: userSession?.UserInfo.UserId,
      },
    });
    if (res.data?.Result == "Success") {
      showSuccessToast(t("toast.successTitle"));
      dispatch(
        setUserSession({
          userSession: {
            ...userSession,
            UserInfo: {
              ...userSession.UserInfo,
              UserName: `${values.Person?.FirstName} ${values.Person?.LastName}`,
            },
          },
        })
      );
    }

    if (selectedFile) {
      const formData = new FormData();
      formData.append("Defaults.CashierId", "1");
      formData.append("Defaults.LangId", "1");
      formData.append("Defaults.PlaceId", "1");
      formData.append("Defaults.CurrencyId", "1");
      formData.append("Defaults.YearId", "1403");
      formData.append("IsFromConsumer", "true");
      formData.append("ReturnInsertedRow", "true");
      formData.append("File", selectedFile);

      const resPic: any = await submitImage({
        url: "/api/auth/update/userpicture",
        body: formData,
      });

      if (resPic.data?.Result == "Success") {
        showSuccessToast(t("toast.successTitle"));
        dispatch(
          setUserSession({
            userSession: {
              ...userSession,
              UserInfo: {
                ...userSession.UserInfo,
                UserPic: resPic.AdditionalInfo,
              },
            },
          })
        );
      }
    }
  };

  const getUserInfo = async () => {
    const data: any = await getUserinformation({
      url: "/api/auth/select/userinformation",
      body: {
        RepoViewId: 20007,
        UserId: userId,
      },
    }).unwrap();
    if (
      data?.Result === "Success" &&
      Array.isArray(data.Data) &&
      data.Data.length > 0
    ) {
      const person = data.Data[0].Person;

      form.setFieldsValue({
        Person: {
          FirstName: person.FirstName,
          LastName: person.LastName,
        },
      });

      setImageUrl(userSession?.UserInfo.UserPic);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, [userId]);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (userSession?.UserInfo?.UserId) {
      dispatch(
        addNewPage({
          pageId: initPage.pageId,
          caption: "title.userProfile",
          icon: "",
          type: PageTypeEnum.Custom,
          RepoId: 2,
          SystemId: SystemEnum.inv,
          url: "",
        })
      );
    }
  }, [userSession?.UserInfo]);

  const Toolbar = () => {
    const { lang } = useAppSelector((state) => {
      const lang = state.withPersist.config.lang;
      return { lang };
    }, shallowEqual);
    const { navigateBack } = useNavigatePage();
    const t = useTranslations();
    return (
      <div
        className={` ${"justify-between gap-2"} top-0 right-0 left-0 flex items-center  w-full z-10 border-b-gray-gray6 border-b sticky  bg-white  h-14`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`${
              lang !== "fa" ? "rotate-180" : ""
            } z-10 flex bg-white dark:bg-gray-gray11 pt-1 rounded h-full`}
            onClick={navigateBack}
          >
            <MenuArrowBack
              config={{
                width: 24,
                height: 24,
              }}
            />
          </div>
          <div>{t("title.userProfile")}</div>
        </div>
      </div>
    );
  };
  return (
    <>
      <Title caption="title.userProfile" />
      {!match && <Toolbar />}
      <div
        className={` ${
          !match && "mt-4"
        }  flex flex-col justify-between w-full h-full *:dark:text-gray-gray1 relative `}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          className="relative flex flex-col gap-6 gap-y-7 p-3 pb-10 border-2 border-dashed rounded-md w-full h-fit"
        >
          <UserInfoToollbar handleReset={handleReset} />

          <Form.Item
            layout="vertical"
            name="Image"
            className={`h-36  w-full flex justify-center 
         relative "
        }`}
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              title="افزودن تصویر"
              onClick={handleAddClick}
              className={`group  z-20 flex justify-center items-center bg-gray-gray4 dark:bg-gray-gray8 w-[200px]  rounded-full aspect-square `}
              style={{
                backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <input
                type="file"
                ref={ImageInputRef}
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              {!imageUrl && <UploadMarker />}

              <div
                className={`
                     absolute top-[50%] left-[50%] gap-1 opacity-0 group-hover:opacity-100 
                     -translate-x-[50%] -translate-y-[50%] transition-all duration-500
                     flex
                   `}
              >
                <CustomButton
                  className="px-4 py-2 hover:!border-gray-gray5 text-3xs hover:!text-gray-gray85"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddClick();
                  }}
                >
                  افزودن تصویر
                </CustomButton>
                <CustomButton
                  className="px-4 py-2 hover:!border-gray-gray5 text-3xs hover:!text-gray-gray85"
                  onClick={handleRemoveClick}
                >
                  حذف تصویر
                </CustomButton>
              </div>
            </div>
          </Form.Item>
          <div className="relative flex flex-col justify-center items-center gap-6 w-full">
            <Form.Item
              layout="vertical"
              className="w-full sm:w-1/2"
              label={t("general.name")}
              name={["Person", "FirstName"]}
              rules={[{ required: true, message: " نام را وارد کنید" }]}
              style={{ minHeight: "50px", height: "50px" }}
            >
              <InputText />
            </Form.Item>
            <Form.Item
              className="w-full sm:w-1/2"
              layout="vertical"
              label={t("general.lastName")}
              name={["Person", "LastName"]}
              rules={[
                { required: true, message: " نام خانوادگی را وارد کنید" },
              ]}
              style={{ minHeight: "50px", height: "50px" }}
            >
              <InputText />
            </Form.Item>
          </div>
        </Form>

        {!match && (
          <Drawer
            placement="bottom"
            closable={false}
            open
            mask={false}
            height={88}
            zIndex={22}
            className="!p-0"
          >
            <div className="flex flex-col justify-between h-full">
              <div className="px-4 pb-4">
                <CustomButton
                  onClick={handleSubmit}
                  className="bg-main-black w-full h-11 font-medium text-main-white text-base"
                >
                  {t("general.save")}
                </CustomButton>
              </div>
            </div>
          </Drawer>
        )}
      </div>
    </>
  );
}

export default UserInfoTemplate;
