import React, { useMemo, useState } from "react"
import data from "../data/data.json"
import icon from "../data/icons.png"
import styled from "styled-components"
import { simpleSolver } from "./simpleSolver"
import { TargetProducts } from "./types"
import { buildTrees, ProductionTree } from "./treeBuilder"

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
            <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}/> / sec
        </div>
}

const StyledTopLevelTreesDisplay = styled.ul``
const StyledTreesDisplay = styled.ul``
const StyledTreeDisplay = styled.ul``
const ProductTreeDisplay: React.FC<{tree: ProductionTree}> = ({tree}) => {
    if (tree.type === "external") {
        return <StyledTreeDisplay><Icon id={tree.id}/> {tree.rate} / sec</StyledTreeDisplay>
    } else if (tree.type === "factory") {
        return <StyledTreeDisplay>
        {
            tree.factory.products.map((product) => <div><Icon id={product.id}/> {product.rate} / sec</div>)
        }
        <StyledTreesDisplay>
            {
                tree.children.map(tree => <ProductTreeDisplay tree={tree}/>)
            }
        </StyledTreesDisplay>
    </StyledTreeDisplay>
    } else {
        return <></>
    }
}

const ProductTreesDisplay: React.FC<{trees: ProductionTree[]}> = ({trees}) => {
    return <StyledTopLevelTreesDisplay>{
        trees.map(tree => <ProductTreeDisplay tree={tree}/>)
    }</StyledTopLevelTreesDisplay>
}

const App: React.FC = () => {
    const [target, setTarget] = useState([{id: "iron-ore", rate: 1}])
    const factories = useMemo(() => simpleSolver(target, data.recipes), [target])
    const trees = useMemo(() => buildTrees(factories, target), [factories, target])
    return <>
        <ProductInput onChange={(target) => {setTarget(target)}}/>
        <ProductTreesDisplay trees={trees}/>
    </>
}

export default App;