"use client";

import React, {
  useEffect,
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
  Eye,
  EyeClose,
  FillLeftChevron,
  MenuArrowBack,
} from '@components/atoms/iconComponents';
import Title from '@components/atoms/Title';
import {
  useFormHandlers,
  useNavigatePage,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { useCUDDataMutation } from '@services/base';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

import UserPassWordToolbar from './UserPassWordToolbar';

function ChangePassWord() {
  const [form] = Form.useForm();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const t = useTranslations();

  const { initPage, match, lang, pages } = useAppSelector((state) => {
    const initPage = state.withPersist.init;
    const match = state.withPersist.config.initMatch;
    const lang = state.withPersist.config.lang;
    const pages = state.withPersist.pages;
    return { initPage, match, lang, pages };
  }, shallowEqual);

  const { handleReset } = useFormHandlers({
    activePage: pages.find((item) => item.isActive),
    pages,
    form,
  });

  const validatePasswordRules = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-\\[\]=+؛،<>~]/.test(password),
    };
  };

  const handleSubmitAndSave = async () => {
    const values = form.getFieldsValue();

    const res: any = await submit({
      url: "/api/auth/update/password",
      body: {
        CurrentPassword: values?.CurrentPassword || "",
        PassWord: values?.Password || "",
        ConfirmPassword: values?.ConfirmPassword || "",
      },
    });

    if (res) {
      // console.log("User info updated:", res);
    }
  };

  const [submit] = useCUDDataMutation();

  const Toolbar = () => {
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
            } z-10 flex bg-white dark:bg-gray-gray11  rounded h-full`}
            onClick={navigateBack}
          >
            <MenuArrowBack
              config={{
                width: 24,
                height: 24,
              }}
            />
          </div>
          <div>{t("title.changePassword")}</div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: `title.changePassword`,
        icon: "",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
      })
    );
  }, [match]);

  return (
    <>
      <Title caption="title.changePassword" />
      {!match && <Toolbar />}
      <div
        className={`${
          !match && "mt-4 "
        }flex flex-col justify-between w-full h-full`}
      >
        <Form
          form={form}
          className="relative flex flex-col gap-6 p-3 sm:pr-8 border-2 border-dashed rounded-md w-full h-fit"
        >
          <UserPassWordToolbar
            handleReset={handleReset}
            handleSubmitAndSave={handleSubmitAndSave}
          />

          <section className="text-gray-gray9">
            <div className="flex items-center gap-2 pb-2 w-full">
              <FillLeftChevron />
              <h2 className="flex items-center font-bold !text-gray-gray135 text-sm">
                {t("general.changePassWord")}
              </h2>
            </div>
            <p className="gap-y-2">
              برای حفظ امنیت حساب کاربری‌تان، لطفاً رمز عبور جدیدی تعیین کنید.
            </p>
            <p className="leading-normal">
              رمز عبور باید یکتا، منحصر به‌فرد و متفاوت از رمز قبلی باشد. پس از
              تغییر رمز، از رمز جدید برای ورود به حساب استفاده خواهید کرد.
            </p>

            <h3>نکات پیشنهادی برای رمز عبور قوی:</h3>
            <ul className="flex flex-col gap-y pr-6 list-disc">
              <li>حداقل ۸ کاراکتر</li>
              <li>ترکیبی از حروف بزرگ و کوچک</li>
              <li>شامل اعداد و نمادها (مثل @، #، $)</li>
            </ul>
          </section>

          <Form.Item
            layout="vertical"
            className="w-full sm:w-1/2"
            label={t("general.currentPassWord")}
            name="CurrentPassword"
            rules={[{ required: true, message: "رمز عبور فعلی را وارد کنید" }]}
            style={{ minHeight: "43px", height: "43px" }}
          >
            <div className="relative">
              <InputText type={showCurrent ? "text" : "password"} />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                className="top-1/2 left-3 absolute -translate-y-1/2 transform"
              >
                {showCurrent ? <Eye /> : <EyeClose />}
              </button>
            </div>
          </Form.Item>

          <Form.Item
            layout="vertical"
            className="w-full sm:w-1/2"
            label={t("general.newPassWord")}
            name="Password"
            // rules={[
            //   { required: true, message: "رمز عبور جدید را وارد کنید" },
            //   () => ({
            //     validator(_, value) {
            //       if (!value) return Promise.resolve();
            //       const rules = validatePasswordRules(value);
            //       if (!rules.minLength) {
            //         return Promise.reject("رمز عبور باید حداقل ۸ کاراکتر باشد");
            //       }
            //       if (!rules.hasNumber) {
            //         return Promise.reject("رمز عبور باید شامل عدد باشد");
            //       }
            //       if (!rules.hasSpecialChar) {
            //         return Promise.reject(
            //           "رمز عبور باید شامل حداقل یک کاراکتر خاص باشد"
            //         );
            //       }
            //       return Promise.resolve();
            //     },
            //   }),
            // ]}
            style={{ minHeight: "43px", height: "43px" }}
          >
            <div className="relative">
              <InputText type={showNew ? "text" : "password"} />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="top-1/2 left-3 absolute -translate-y-1/2 transform"
              >
                {showNew ? <Eye /> : <EyeClose />}
              </button>
            </div>
          </Form.Item>

          <Form.Item
            layout="vertical"
            className="pb-12 w-full sm:w-1/2"
            label={t("general.repeatPassWord")}
            name="ConfirmPassword"
            dependencies={["Password"]}
            rules={[
              { required: true, message: "تکرار رمز عبور را وارد کنید" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("Password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("رمزها با هم تطابق ندارند");
                },
              }),
            ]}
            style={{ minHeight: "43px", height: "43px", marginBottom: "48px" }}
          >
            <InputText type={showConfirm ? "text" : "password"} />
          </Form.Item>
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
                  onClick={handleSubmitAndSave}
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

export default ChangePassWord;
