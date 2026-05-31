import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetConditionallyMutation } from '@services/base';
import { setPlaceConfigs } from '@slice/config';
import { IDefaultConfigs } from '@slice/config/type';

export const useGetPlaceConfigs = () => {
  const [get] = useGetConditionallyMutation();

  const dispatch = useDispatch();
  const { CashierId, CurrencyId, LanguageId, PlaceId, YearId, role } =
    useAppSelector((state) => {
      const CashierId = state.withPersist.config.defaultConfigs?.CashierId;
      const CurrencyId = state.withPersist.config.defaultConfigs?.CurrencyId;
      const LanguageId = state.withPersist.config.defaultConfigs?.LanguageId;
      const PlaceId = state.withPersist.config.defaultConfigs?.PlaceId;
      const YearId = state.withPersist.config.defaultConfigs?.YearId;
      const role = state.withPersist.config.userSession?.RoleDto?.find(
        (item) => item.isActiveRole,
      );

      return {
        CashierId,
        CurrencyId,
        LanguageId,
        PlaceId,
        YearId,
        role,
      };
    }, shallowEqual);
  const globals: IDefaultConfigs = {
    CurrencyId,
    CashierId,
    PlaceId,
    YearId,
    LanguageId,
  };
  const undefinedList = Object.values(globals).filter((item) => !item).length;
  const getPlaceConfigs = async () => {
     if (undefinedList == 0) {
      const placeConfigs = await get({
        url: "api/mng/select/placeConfigValue",
        body: {},
      }).unwrap();
      if (placeConfigs && placeConfigs.Result == "Success") {
        dispatch(setPlaceConfigs({ placeConfigs: placeConfigs.Data }));
      }

    }

  };


  return { getPlaceConfigs };
};
