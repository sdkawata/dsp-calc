import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import data from "../data/data.json"

interface ProductInputState {
    id: string,
    rate: number,
    machines: {[recipe: string]: string},
    enabledRecipe: string[],
}
const initialState: ProductInputState = {
    id: 't-matrix',
    rate: 1,
    machines: {},
    enabledRecipe: data.recipes.map(r => r.id),
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
            action.payload.forEach((recipe) => {if(state.enabledRecipe.includes(recipe)){state.enabledRecipe.push(recipe)}})
        },
        disableRecipes: (state, action: PayloadAction<string[]>) => {
            state.enabledRecipe = state.enabledRecipe.filter((recipe) => !action.payload.includes(recipe))
        }
    }
})

export const {setId, setRate, setMachine} = productInputSlice.actions

export default productInputSlice.reducer