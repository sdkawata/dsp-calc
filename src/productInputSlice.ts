import {createSlice, PayloadAction} from '@reduxjs/toolkit'

interface ProductInputState {
    id: string,
    rate: number,
}
const initialState: ProductInputState = {
    id: 't-matrix',
    rate: 1,
}

export const productInputSlice = createSlice({
    name: 'productInput',
    initialState,
    reducers: {
        setId: (state, action: PayloadAction<string>) => {
            state.id = action.payload
        },
        setRate: (state, action: PayloadAction<number>) => {
            state.rate = action.payload
        }
    }
})

export const {setId, setRate} = productInputSlice.actions

export default productInputSlice.reducer