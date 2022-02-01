import {createSlice, PayloadAction} from '@reduxjs/toolkit'

interface ProductInputState {
    id: string,
    rate: number,
    machines: {[recipe: string]: string}
}
const initialState: ProductInputState = {
    id: 't-matrix',
    rate: 1,
    machines: {},
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
        },
        setMachine: (state, action: PayloadAction<{recipe: string ;machine: string}>) => {
            state.machines[action.payload.recipe] = action.payload.machine;
        }
    }
})

export const {setId, setRate, setMachine} = productInputSlice.actions

export default productInputSlice.reducer