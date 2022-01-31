import solver from "javascript-lp-solver"
import { Factories, Factory, Item, Recipe, TargetProducts } from "./types";

const objectTransform = <T,T2>(o:{[k:string]:T}, f:(t:T, k:string)=>T2): {[k:string]:T2} => {
    const result: {[k:string]:T2} = {}
    for (const key in Object.keys(o)) {
        result[key] = f(o[key], key)
    }
    return result 
}

export const lpSolver = (target: TargetProducts, recipes: Recipe[], items: Item[]): Factories => {
    const constraintsSet: Set<string> = new Set();
    const variables: {[k:string]: {[k:string]: number}} = {}
    for (const recipe of recipes) {
        const variable = "recipe_" + recipe.id
        const v = {}
        if (recipe.out) {
            for (const out of Object.keys(recipe.out)) {
                v[out] = recipe.out[out] ?? 0;
            }
        } else {
            v[recipe.id] = 1
        }
        if (recipe.in) {
            for (const inV of Object.keys(recipe.in)) {
                v[inV] = (v[inV] ?? 0) - (recipe.in[inV] ?? 0);
            }
        }
        v["cost"] = 1
        Object.keys(v).forEach((key) => constraintsSet.add(key))
        variables[variable] = v
    }

    const constraints: {[k:string] : {min: number}} = {}
    for (const constraint of constraintsSet) {
        const targetRate = target.find((t) => t.id === constraint)?.rate
        constraints[constraint] = {min: targetRate ?? 0}
    }
    constraints["cost"] = {min: 0}
    const results: {[k:string]: number} & {feasible: boolean} = solver.Solve({
        optimize: "cost",
        opType: "min",
        constraints,
        variables,
    })
    if (! results.feasible) {
        throw new Error("not feasible!!!")
    }
    const factories: Factory[] = []
    for (const key of Object.keys(results)) {
        if (! key.startsWith("recipe_")) {
            continue;
        }
        if (results[key] === 0) {
            continue;
        }
        const recipe = recipes.find((recipe) => recipe.id === key.replace("recipe_", ""))
        if (! recipe) {
            throw new Error("err")
        }
        const out = recipe.out ?? {[recipe.id]: 1}
        const products = Object.keys(out).map(k => ({id: k, rate: results[key] * (out[k] ?? 0)}))
        const inV = recipe.in ?? {}
        const ingredients = Object.keys(inV).map(k => ({id: k, rate: results[key] * (inV[k] ?? 0)}))
        const machine = recipe.producers[0]
        const speed = items.find((item) => item.id === machine)?.factory?.speed ?? 1;
        factories.push({
            machine: recipe.producers[0],
            machineCount: results[key] / speed * recipe.time,
            products,
            ingredients,
            recipe: recipe.id,
        })
    }
    return {factories}
}