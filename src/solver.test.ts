import { lpSolver } from "./lpSolver"
import { Factories } from "./types"


describe("simpleSolver", () => {
    test("should solve mining", () => {
            expect(lpSolver({inputs: [{id: "A", rate: 1}], machines:{}}, [{id:"A", name: "A", time: 1, producers:["A-miner"]}], []))
                .toBeSameFactories({factories:[{
                    products:[{id: "A", rate:1}],
                    machine: "A-miner",
                    machineCount: 1,
                    ingredients:[],
                    recipe: "A",
                }]} as Factories)
    })
    test("should solve crafting and mining", () => {
        expect(lpSolver({inputs: [{id: "A", rate: 1}], machines:{}}, [
            {id:"A", name: "A", time: 1, producers:["A-crafter"], in:{B: 1}},
            {id:"B", name: "B", time: 1, producers:["B-miner"]},
        ], []))
            .toBeSameFactories({factories:[{
                products:[{id: "A", rate:1}],
                machine: "A-crafter",
                machineCount: 1,
                ingredients:[{id: "B", rate: 1}],
                recipe: "A",
            },{
                products:[{id: "B", rate:1}],
                machine: "B-miner",
                machineCount: 1,
                ingredients:[],
                recipe: "B",
            }]} as Factories)
    })
    
    test("should share ingredient factory", () => {
        expect(lpSolver({inputs: [{id: "A", rate: 1}], machines:{}}, [
            {id:"A", name: "A", time: 1, producers:["A-crafter"], in:{A1: 1, A2:1}},
            {id:"A1", name: "A1", time: 1, producers:["A-crafter"], in:{B:1}},
            {id:"A2", name: "A2", time: 1, producers:["A-crafter"], in:{B:1}},
            {id:"B", name: "B", time: 1, producers:["B-miner"]},
        ], []))
            .toBeSameFactories({factories:[{
                products:[{id: "A", rate:1}],
                machine: "A-crafter",
                machineCount: 1,
                ingredients:[{id: "A1", rate: 1},{id: "A2", rate: 1}],
                recipe: "A",
            },{
                products:[{id: "A1", rate:1}],
                machine: "A-crafter",
                machineCount: 1,
                ingredients:[{id: "B", rate: 1}],
                recipe: "A1",
            },{
                products:[{id: "A2", rate:1}],
                machine: "A-crafter",
                machineCount: 1,
                ingredients:[{id: "B", rate: 1}],
                recipe: "A2",
            },{
                products:[{id: "B", rate:2}],
                machine: "B-miner",
                machineCount: 2,
                ingredients:[],
                recipe: "B",
            }]} as Factories)
    })
    test("should consider factory.speed and time", () => {
        expect(lpSolver(
            {inputs: [{id: "A", rate: 1}], machines:{}},
            [{id:"A", name: "A", time: 10, producers:["A-miner"]}],
            [{id: "A-miner", factory:{speed: 0.5}}]
        ))
            .toBeSameFactories({factories:[{
                products:[{id: "A", rate:1}],
                machine: "A-miner",
                machineCount: 20,
                ingredients:[],
                recipe: "A",
            }]} as Factories)
        })
})