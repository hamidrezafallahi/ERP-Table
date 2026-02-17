"use client";
import { useEffect } from 'react';

import { ToastContainer } from 'react-toastify';
import { getLangDir } from 'rtl-detect';

import Theme from '@components/templates/Theme';
import AppReduxStore from '@redux/index';
import ReduxProvider from '@redux/provider';
import { setGlobalAndView } from '@slice/config';
import { loadTheme } from '@utils/themeUtils';

import { Container } from './container';
import type { IProps } from './type';

export default function Providers({ children, local }: IProps) {
  const direction = getLangDir(local);
  
    

  useEffect(() => {
    AppReduxStore.dispatch(setGlobalAndView({ direction, lang: local }));
    document.getElementsByTagName("body")[0].setAttribute("dir", direction);
  }, [direction, local]);

// const seqLogger = async()=>{
//     const logger = await LoggerService.getInstance();
//  window.onerror = (message, source, lineno, colno, error) => {
//       logger.log("Error","new front webApplication error", {"window Error":{ message, source, lineno, colno, error} });
//     };
//     window.onunhandledrejection = (event) => {
//       logger.log("Error", "new front webApplication Unhandled Promise", { reason: event.reason });
//     };
// }



  useEffect(() => {
    loadTheme();
    // seqLogger()
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
