import { simpleSolver } from "./simpleSolver"
import { Factories } from "./types"

describe("simpleSolver", () => {
    test("should solve mining", () => {
        expect(simpleSolver([{id: "A", rate: 1}], [{id:"A", name: "A", time: 1, producers:["A-miner"]}]))
            .toBeSameFactories({factories:[{
                products:[{id: "A", rate:1}],
                machine: "A-miner",
                machineCount: 1,
                ingredients:[]
            }]} as Factories)
    })
    test("should solve crafting and mining", () => {
        expect(simpleSolver([{id: "A", rate: 1}], [
            {id:"A", name: "A", time: 1, producers:["A-crafter"], in:{B: 1}},
            {id:"B", name: "B", time: 1, producers:["B-miner"]},
        ]))
            .toBeSameFactories({factories:[{
                products:[{id: "A", rate:1}],
                machine: "A-crafter",
                machineCount: 1,
                ingredients:[{id: "B", rate: 1}]
            },{
                products:[{id: "B", rate:1}],
                machine: "B-miner",
                machineCount: 1,
                ingredients:[]
            }]} as Factories)
    })
    
    test("should share ingredient factory", () => {
        expect(simpleSolver([{id: "A", rate: 1}], [
            {id:"A", name: "A", time: 1, producers:["A-crafter"], in:{A1: 1, A2:1}},
            {id:"A1", name: "A1", time: 1, producers:["A-crafter"], in:{B:1}},
            {id:"A2", name: "A2", time: 1, producers:["A-crafter"], in:{B:1}},
            {id:"B", name: "B", time: 1, producers:["B-miner"]},
        ]))
            .toBeSameFactories({factories:[{
                products:[{id: "A", rate:1}],
                machine: "A-crafter",
                machineCount: 1,
                ingredients:[{id: "A1", rate: 1},{id: "A2", rate: 1}]
            },{
                products:[{id: "A1", rate:1}],
                machine: "A-crafter",
                machineCount: 1,
                ingredients:[{id: "B", rate: 1}]
            },{
                products:[{id: "A2", rate:1}],
                machine: "A-crafter",
                machineCount: 1,
                ingredients:[{id: "B", rate: 1}]
            },{
                products:[{id: "B", rate:2}],
                machine: "B-miner",
                machineCount: 2,
                ingredients:[]
            }]} as Factories)
    })
})