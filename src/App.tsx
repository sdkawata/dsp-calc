import React, { useMemo, useState } from "react"
import data from "../data/data.json"
import icon from "../data/icons.png"
import styled from "styled-components"
import { simpleSolver } from "./simpleSolver"
import { TargetProducts } from "./types"
import { buildTrees, ProductionTree } from "./treeBuilder"
import { lpSolver } from "./lpSolver"

const StyledIcon = styled.span<{position: string}>`
display: inline-block;
width: 32px;
height: 32px;
background-image: url(${icon});
background-reapet: no-repeat;
background-position: ${props => props.position};
background-size: ${832 / 2}px ${832 / 2}px;
`

const Icon: React.FC<{id:string}> = ({id}) => {
    const target = data.icons.find((icon) => icon.id === id)!
    const positionMatch = target.position.match(/(-?\d+)px (-?\d+)px/)!
    const x = Number(positionMatch[1]);
    const y = Number(positionMatch[2]);
    const position = `${x / 2}px ${y / 2}px`
    return <StyledIcon  position={position} title={target.id}/>
}

const StyledProductSelectWrapper = styled.span`
position:relative;
`
const StyledProductSelect = styled.div`
position: absolute;
width: 500px;
top: 0px;
left: 0px;
border: 1px solid black;
box-shadow: 1px;
background-color: white;
`

const ProductInput: React.FC<{onChange: (target: TargetProducts) => void}> = ({onChange}) => {
    const [product, setProduct] = useState("iron-ore")
    const [showSelect, setShowSelect] = useState(false)
    const [rate, setRate] = useState("1")
    return <div>
            Produce<StyledProductSelectWrapper>
                <span onClick={() => setShowSelect(true)}><Icon id={product}/></span>
                {showSelect  &&
                    <StyledProductSelect>
                        select product <span onClick={() => setShowSelect(false)}>x close</span><br/>
                        {data.items.map(item => <span onClick={() => {
                            setProduct(item.id)
                            setShowSelect(false)
                            onChange([{id:item.id, rate: Number(rate)}])
                        }} key={item.id}><Icon id={item.id}/></span>)}
                    </StyledProductSelect>
                }
                </StyledProductSelectWrapper>
            <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} onBlur={() => onChange([{id:product, rate: Number(rate)}])}/> / sec
        </div>
}

const StyledTable = styled.table`
border-spacing: 0;
`

const StyledTR = styled.tr`
`
const StyledTD = styled.td<{indent?: number}>`
padding-left: ${props => (props.indent ?? 0) * 50}px;
border: #ccc solid 1px;
`
const ProductTreeDisplay: React.FC<{tree: ProductionTree, indent: number}> = ({tree, indent}) => {
    if (tree.type === "external") {
        return <StyledTR><StyledTD indent={indent}><Icon id={tree.id}/>{tree.rate} / sec </StyledTD><StyledTD></StyledTD></StyledTR>
    } else if (tree.type === "factory") {
        return <>
            <StyledTR>
                <StyledTD indent={indent}>
                {
                tree.factory.products.map((product) => <div>
                    <Icon id={product.id}/> {product.rate} / sec
                </div>)}
                </StyledTD>
                <StyledTD><Icon id={tree.factory.machine}/>x {tree.factory.machineCount}</StyledTD>
            </StyledTR>
            {
                tree.children.map(tree => <ProductTreeDisplay tree={tree} indent={indent+1}/>)
            }
    </>
    } else {
        return <></>
    }
}

const ProductTreesDisplay: React.FC<{trees: ProductionTree[]}> = ({trees}) => {
    return <StyledTable><tbody>{
        trees.map(tree => <ProductTreeDisplay tree={tree} indent={0}/>)
    }</tbody></StyledTable>
}

const App: React.FC = () => {
    const [target, setTarget] = useState([{id: "t-matrix", rate: 1}])
    const factories = useMemo(() => lpSolver(target, data.recipes), [target])
    const trees = useMemo(() => buildTrees(factories, target), [factories, target])
    return <>
        <ProductInput onChange={(target) => {setTarget(target)}}/>
        <ProductTreesDisplay trees={trees}/>
    </>
}

export default App;