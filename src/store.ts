import {configureStore} from "@reduxjs/toolkit"
import productInputReducer from "./productInputSlice"

const store = configureStore({reducer:{
    productInput: productInputReducer,
}})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store;