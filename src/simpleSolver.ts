import { Factories, Factory, Recipe, TargetProducts } from "./types";

export const simpleSolver = (target: TargetProducts, recipes: Recipe[]): Factories => {
    let unprocessed:{id: string; rate: number}[] = target;
    let factories: Factory[] = []
    while (unprocessed.length != 0) {
        const [first, ...rest] = unprocessed
        unprocessed = rest
        const recipe = recipes.find((recipe) => (
            recipe.id === first.id || (recipe.out && Object.keys(recipe.out).length === 1 && Object.keys(recipe.out)[0] === first.id)
        ))
        // cannot find recipe
        if (! recipe) {
            continue;
        }
        const outputUnit = recipe.out?.[first.id] ?? 1
        let ingredients:Factory["ingredients"] = []
        for (let input of Object.keys(recipe.in ?? {})) {
            let inputRate = (recipe.in![input] ?? 1) *first.rate / outputUnit
            ingredients.push({id: input, rate: inputRate})
            const sameInputFactory = factories.find(factory => factory.products[0].id === input)
            if (sameInputFactory) {
                // same product already in factory so merge
                // simple solver handle only single output recipe
                inputRate += sameInputFactory.products[0].rate
                factories = factories.filter((factory) => factory.products[0].id !== input)
            }
            if (unprocessed.find(u => u.id === input)) {
                // already have entry in unprocessed
                const index = unprocessed.findIndex(u => u.id === input)
                unprocessed[index].rate += inputRate
            } else {
                unprocessed.push({id: input, rate: inputRate})
            }
        }
        const machineCount = first.rate / outputUnit * recipe.time
        factories.push({products:[{id:first.id, rate: first.rate}], machine: recipe.producers[0], machineCount, ingredients})
    }
    return {factories}
}