import {useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import type { TypedUseSelectorHook } from 'react-redux';

// Используем вместо обычных useDispatch и useSelector типизированные версии
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
