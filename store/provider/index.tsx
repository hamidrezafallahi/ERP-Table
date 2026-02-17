import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { ArianLogo, SpinIcon } from "@components/atoms/iconComponents";
import AppReduxStore, { persistor } from "@store/index";

const ReduxProvider = (props: any) => {
  return (
    <Provider store={AppReduxStore}>
      <PersistGate
        loading={
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-3">
            <ArianLogo />
            <SpinIcon />
          </div>
        }
        persistor={persistor}
      >
        {props.children}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
