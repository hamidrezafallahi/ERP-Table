"use client";
import { useEffect } from 'react';

import { ToastContainer } from 'react-toastify';
import { getLangDir } from 'rtl-detect';

import Theme from '@components/templates/Theme';
import ReduxProvider from '@redux/provider';
import { loadTheme } from '@utils/themeUtils';

import { Container } from './container';
import type { IProps } from './type';

export default function Providers({ children, local }: IProps) {
  const direction = getLangDir(local);

 

  useEffect(() => {
    loadTheme();
   }, []);

  useEffect(() => {
    if (local === "fa") {
      document.body.classList.add("font-fa");
      document.body.classList.remove("font-en");
    } else {
      document.body.classList.add("font-en");
      document.body.classList.remove("font-fa");
    }
  }, [local]);

  return (
    <>
      <div lang={local} id="docBody" className="relative"></div>
      <ReduxProvider>
        <Theme>
          <ToastContainer
            toastStyle={{ padding: 0 }}
            position="top-center"
            autoClose={100000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          <Container direction={direction} local={local}>
            {children}
          </Container>
        </Theme>
      </ReduxProvider>
    </>
  );
}
