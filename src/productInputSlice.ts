import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import data from "../data/data.json"

interface ProductInputState {
    id: string,
    rate: number,
    machines: {[recipe: string]: string},
    enabledRecipes: string[],
}
const initialState: ProductInputState = {
    id: 't-matrix',
    rate: 1,
    machines: {},
    enabledRecipes: data.recipes.map(r => r.id),
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
        },
        enableRecipes: (state, action: PayloadAction<string[]>) => {
            action.payload.forEach((recipe) => {if(! state.enabledRecipes.includes(recipe)){state.enabledRecipes.push(recipe)}})
        },
        disableRecipes: (state, action: PayloadAction<string[]>) => {
            state.enabledRecipes = state.enabledRecipes.filter((recipe) => !action.payload.includes(recipe))
        }
    }
})

export const {setId, setRate, setMachine, enableRecipes, disableRecipes} = productInputSlice.actions

export default productInputSlice.reducer