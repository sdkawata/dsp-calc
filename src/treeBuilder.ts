import { Factories, Factory, TargetProducts } from "./types"
import { intersects } from "./util";


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
            if (
                subFactoriesIdx.length === 1
                && factories.factories[subFactoriesIdx[0]].products.length === 1
                && factories.factories.filter(factory => factory.ingredients.map(i => i.id).includes(factories.factories[subFactoriesIdx[0]].products[0].id)).length === 1
            ) {
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
    const relatives = Array.from(Array(factories.factories.length), (v,k) => new Set([k]))
    let changed = true
    while (changed) {
        changed = false
        for (let idx = 0; idx < factories.factories.length;idx++) {
            for (let idx2 = 0; idx2 < factories.factories.length;idx2++) {
                if (
                    intersects(
                        factories.factories[idx2].products.map(p => p.id),
                        factories.factories[idx].ingredients.map(i => i.id)
                    ).length > 0
                ) {
                    const before = relatives[idx2].size
                    relatives[idx2] = Array.from(relatives[idx].values()).reduce((set, value) => set.add(value), relatives[idx2])
                    if (relatives[idx2].size > before) {
                        changed = true;
                    }
                }
            }
        }
    }
    while (notParsed.size > 0) {
        const canditateKey = Array.from(notParsed.values())
        canditateKey.sort((a,b) => relatives[a].size - relatives[b].size)
        currentTrees.push(buildTree(canditateKey[0]))
    }
    return currentTrees;
}