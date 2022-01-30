import { Factories, Factory, TargetProducts } from "./types"

const intersects = <T>(array1: T[], array2: T[]): T[] => {
    return array1.filter(value => array2.includes(value));
}

const filterIdx = <T>(array: T[], pred: (t:T) => boolean): number[] => {
    const result: number[] = []
    for (let idx = 0; idx < array.length;idx++) {
        if (pred(array[idx])) {
            result.push(idx)
        }
    }
    return result;
}

export type ProductionTree = {
    type: "factory"
    factory: Factory;
    children: ProductionTree[];
} | {
    type: "external";
    id: string;
    rate: number;
}

export const buildTrees = (factories: Factories, target: TargetProducts): ProductionTree[] => {
    console.log(factories.factories)
    const notParsed = new Set(Array.from(Array(factories.factories.length), (v,k) => k));
    const currentTrees: ProductionTree[] = []
    const buildTree = (factoryIdx: number): ProductionTree => {
        console.log("build Tree" + factoryIdx)
        notParsed.delete(factoryIdx)
        const factory = factories.factories[factoryIdx]
        const children: ProductionTree[] = factory.ingredients.map((ingredient) => {
            const subFactoriesIdx = filterIdx(factories.factories,(factory) => factory.products.find(p => p.id === ingredient.id) !== undefined)
            if (subFactoriesIdx.length === 1 && factories.factories[subFactoriesIdx[0]].products.length === 1) {
                return buildTree(subFactoriesIdx[0])
            } else {
                return {
                    type: "external",
                    ...ingredient
                }
            }
        })
        return {
            type: "factory",
            factory,
            children,
        }
    }
    for (let idx = 0; idx < factories.factories.length;idx++) {
        if (intersects(factories.factories[idx].products.map(p => p.id), target.map(t =>t.id)).length > 0 ) {
            currentTrees.push(buildTree(idx));
        }
    }
    while (notParsed.size > 0) {
        currentTrees.push(buildTree(Array.from(notParsed.values())[0]))
    }
    return currentTrees;
}