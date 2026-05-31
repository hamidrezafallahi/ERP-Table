import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';

export const useGetConfigValueById = (cmd: { id: number }): { PlaceConfigValueId: number, PlaceConfigId: number, Value: string } => {
    const { id } = cmd
    const { placeConfigs } = useAppSelector(
        (state) => ({
            placeConfigs: state.withPersist.config.placeConfigs,
        }),
        shallowEqual,
    );
    if (!placeConfigs) return null
    const  val = placeConfigs.find(c => c.PlaceConfigId === id) 
    return val
}