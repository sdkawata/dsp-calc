import React, { useEffect, useMemo, useState } from "react"
import data from "../data/data.json"
import icon from "../data/icons.png"
import styled from "styled-components"
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

const Modal: React.FC<{onClose: () => void}> = ({onClose, children}) => {
    useEffect(() => {
        const listner = (e) => {e.preventDefault(); onClose()}
        document.addEventListener('click',listner);
        return () => document.removeEventListener('click', listner)
    }, [onClose])
    return <>{children}</>
}

const ProductInput: React.FC<{onChange: (target: TargetProducts) => void}> = ({onChange}) => {
    const [product, setProduct] = useState("iron-ore")
    const [showSelect, setShowSelect] = useState(false)
    const [rate, setRate] = useState("1")
    return <div>
            Produce<StyledProductSelectWrapper>
                <span onClick={() => setShowSelect(true)}><Icon id={product}/></span>
                {showSelect  &&
                <Modal onClose={() => setShowSelect(false)}>
                    <StyledProductSelect>
                        <div style={{display: "flex",justifyContent: "space-between"}}>
                        <span>select product</span><span style={{cursor: "pointer"}} onClick={() => setShowSelect(false)}>x close</span>
                        </div>
                        {data.items.map(item => <span onClick={() => {
                            setProduct(item.id)
                            setShowSelect(false)
                            onChange([{id:item.id, rate: Number(rate)}])
                        }} 
                        style={{cursor: "pointer"}}
                        key={item.id}><Icon id={item.id}/></span>)}
                    </StyledProductSelect>
                    </Modal>
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
const StyledTD = styled.td`
border: #ccc solid 1px;
padding-left: 3px;
padding-right: 3px;
`
const StyledConnectWrapper = styled.div`
display: flex;
`
const StyledVerticalLine = styled.span<{hasLine: boolean; half: boolean;lastOfLine: boolean;}>`
width: ${props => props.lastOfLine ? "0px" : "16px"};
border-left: ${props => props.hasLine ? "#000 1px solid" : ""};
height: ${props => props.half ? "20px" : "auto"};
margin-left: 16px;
`
const StyledConnectLine = styled.span`
width: 16px;
border-bottom: #000 1px solid;
height: 20px;
`

const Indent: React.FC<{indents: boolean[]}> = ({indents}) => {
    return <>
        {indents.map((b, idx) => {
            const isLast = indents.length -1 === idx;
            return <React.Fragment key={idx}>
                <StyledVerticalLine hasLine={!b || isLast} lastOfLine={isLast} half={b && isLast}/>
                {isLast && <StyledConnectLine/>}
            </React.Fragment>
        })}
    </>
}
const formatNumber = (n:number):string => n.toFixed(1).replace(/\.0$/, "")
const ProductTreeDisplay: React.FC<{tree: ProductionTree, indents: boolean[]}> = ({tree, indents}) => {
    if (tree.type === "external") {
        return <StyledTR><StyledTD><StyledConnectWrapper><Indent indents={indents}/><div><Icon id={tree.id}/>{tree.rate} / sec </div></StyledConnectWrapper></StyledTD><StyledTD></StyledTD></StyledTR>
    } else if (tree.type === "factory") {
        return <>
            <StyledTR>
                <StyledTD>
                    <StyledConnectWrapper>
                    <Indent indents={indents}/>
                    <div>
                    {
                    tree.factory.products.map((product) => <div key={product.id}>
                        <Icon id={product.id}/> {formatNumber(product.rate)} / sec
                    </div>)}
                    </div>
                    </StyledConnectWrapper>
                </StyledTD>
                <StyledTD><Icon id={tree.factory.machine}/>x {formatNumber(tree.factory.machineCount)}</StyledTD>
            </StyledTR>
            {
                tree.children.map((child, idx) => {
                    const isLast = tree.children.length -1 === idx;
                    return <ProductTreeDisplay tree={child} indents={[...indents,isLast]} key={idx}/>
                })
            }
    </>
    } else {
        return <></>
    }
}

const ProductTreesDisplay: React.FC<{trees: ProductionTree[]}> = ({trees}) => {
    return <StyledTable><tbody>{
        trees.map((tree,idx) => <ProductTreeDisplay tree={tree} indents={[]} key={idx}/>)
    }</tbody></StyledTable>
}

const App: React.FC = () => {
    const [target, setTarget] = useState([{id: "t-matrix", rate: 1}])
    const factories = useMemo(() => lpSolver(target, data.recipes, data.items), [target])
    const trees = useMemo(() => buildTrees(factories, target), [factories, target])
    return <>
        <ProductInput onChange={(target) => {setTarget(target)}}/>
        <ProductTreesDisplay trees={trees}/>
    </>
}

export default App;