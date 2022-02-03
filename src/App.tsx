import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import data from "../data/data.json"
import icon from "../data/icons.png"
import styled from "styled-components"
import { Factory } from "./types"
import { buildTrees, ProductionTree } from "./treeBuilder"
import { lpSolver } from "./lpSolver"
import { useAppDispatch, useAppSelector } from "./hooks"
import { disableRecipes, enableRecipes, setId, setMachine, setRate } from "./productInputSlice"
import { intersects } from "./util"

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


const Recipe: React.FC<{id:string}> = ({id}) => {
    const recipe = data.recipes.find(r => r.id === id)!
    const out = recipe.out ?? {[recipe.id]:1}
    const ingredients = recipe.in ?? {}
    return <>
        <Icon id={recipe.id}/>
        {Object.keys(ingredients).map(ingredient => <React.Fragment key={ingredient}><Icon id={ingredient}/> x {ingredients[ingredient]}</React.Fragment>)}
        {"->"}
        {Object.keys(out).map(outId => <React.Fragment key={outId}><Icon id={outId}/> x {out[outId]}</React.Fragment>)}
        </>
}

const StyledProductSelectWrapper = styled.span`
position:relative;
`
const StyledModal = styled.div`
position: absolute;
width: 500px;
top: 0px;
left: 0px;
border: 1px solid black;
box-shadow: 1px;
background-color: white;
z-index: 99;
`

const isAncestor = (elem1: HTMLElement, elem2: HTMLElement) => {
    let current = elem1;
    while (true) {
        if (! current.parentElement) {
            return false;
        }
        current = current.parentElement;
        if (current === elem2) {
            return true;
        }
    }
}

const Modal: React.FC<{onClose: () => void}> = ({onClose, children}) => {
    const modalRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        const listner = (e:MouseEvent) => {
            const target = (e.target as HTMLElement)
            if (!modalRef.current || !isAncestor(target, modalRef.current)) {
                e.preventDefault()
                onClose()
            }
        }
        document.addEventListener('click', listner);
        return () => document.removeEventListener('click', listner)
    }, [onClose])
    return <StyledModal ref={modalRef}>{children}</StyledModal>
}

const ProductInput: React.FC = () => {
    const {id: product, rate} = useAppSelector(state => state.productInput)
    const [inputRate, setInputRate] = useState("1")
    const dispatch = useAppDispatch()
    const [showSelect, setShowSelect] = useState(false)
    const onClose = useCallback(() => setShowSelect(false), [])
    return <div>
            Produce<StyledProductSelectWrapper>
                <span onClick={() => setShowSelect(true)}><Icon id={product}/></span>
                {showSelect  &&
                <Modal onClose={onClose}>
                    <div style={{display: "flex",justifyContent: "space-between"}}>
                    <span>select product</span><span style={{cursor: "pointer"}} onClick={() => setShowSelect(false)}>x close</span>
                    </div>
                    {data.items.map(item => <span onClick={() => {
                        dispatch(setId(item.id))
                        setShowSelect(false)
                    }} 
                    style={{cursor: "pointer"}}
                    key={item.id}><Icon id={item.id}/></span>)}
                </Modal>
                }
                </StyledProductSelectWrapper>
            <input type="number"
            value={rate}
            onChange={(e) => setInputRate(e.target.value)}
            onBlur={() => dispatch(setRate(Number(inputRate)))}
            /> / sec
        </div>
}

const StyledTable = styled.table`
border-spacing: 0;
position: relative;
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

const StyledProductModalWrapper = styled.span`
display:inline-block;
position: relative
`

const StyledIconBorder = styled.span<{selected: boolean}>`
display: inline-block;
border: ${props => props.selected ? "1px solid red" : "1px solid #ccc"};
`
const ProductModal: React.FC<{machines:string[], recipeMachine: string, relevantRecipes: (typeof data)['recipes'], enabledRecipes: string[], onClose:(v: {machine: string, enabledRecipes:string[]}) => void}> = ({machines, recipeMachine, onClose, relevantRecipes, enabledRecipes}) => {
    const [selectedMachine, setSelectedMachine] = useState(recipeMachine)
    const [currentEnabledRecipes, setCurrentEnabledRecipes] = useState(enabledRecipes)
    const onCloseModal = () => {
        onClose({machine:selectedMachine, enabledRecipes:currentEnabledRecipes})
    }
    return <Modal onClose={onCloseModal}>
            <table><tbody><tr><td>machines: </td>
            <td>{machines.map((machine) => <StyledIconBorder key={machine} selected={machine === selectedMachine} onClick={() => setSelectedMachine(machine)}><Icon id={machine} key={machine}/></StyledIconBorder>)}
            </td></tr>
            <tr><td>recipes:</td><td>{relevantRecipes.map((recipe) => <div key={recipe.id}><label>
                <input type="checkbox" checked={currentEnabledRecipes.includes(recipe.id)}
                name={recipe.id}
                onChange={() => {!currentEnabledRecipes.includes(recipe.id)
                    ? setCurrentEnabledRecipes(r => Array.from(new Set([...r, recipe.id])))
                    : setCurrentEnabledRecipes(r => r.filter(r => r !== recipe.id))}}/>
                <Recipe id={recipe.id}/></label></div>)}
                </td></tr></tbody></table>
        </Modal>
}

const ProductionIcon: React.FC<{factory: Factory}> = ({factory}) => {
    const [showModal, setShowModal] = useState(false)
    const dispatch = useAppDispatch()
    const recipe = data.recipes.find((recipe) => recipe.id === factory.recipe)!
    const relevantRecipes = data.recipes.filter(
        (filteredRecipe) => intersects(recipe.out ? Object.keys(recipe.out) : [recipe.id], filteredRecipe.out ? Object.keys(filteredRecipe.out) : [filteredRecipe.id]).length > 0
        )
    const enabledRecipes = useAppSelector(state => state.productInput.enabledRecipes).filter(recipe => relevantRecipes.map(r => r.id).includes(recipe))
    return (
        <>
<StyledProductModalWrapper onClick={() => setShowModal(true)}>
    <Icon id={factory.machine}/>
    {showModal && <ProductModal machines={recipe.producers} recipeMachine={factory.machine} relevantRecipes={relevantRecipes} enabledRecipes={enabledRecipes}
    onClose={({machine, enabledRecipes}) => {
        if (factory.machine !== machine) {
            dispatch(setMachine({recipe: recipe.id, machine}))
        }
        dispatch(enableRecipes(enabledRecipes))
        dispatch(disableRecipes(relevantRecipes.map(r => r.id).filter(r => !enabledRecipes.includes(r))))
        setShowModal(false)
    }}/>}
</StyledProductModalWrapper>x {formatNumber(factory.machineCount)}
</>
    )
}

const ProductTreeDisplay: React.FC<{tree: ProductionTree, indents: boolean[]}> = ({tree, indents}) => {
    if (tree.type === "external") {
        return <StyledTR><StyledTD><StyledConnectWrapper><Indent indents={indents}/><div><Icon id={tree.id}/>{formatNumber(tree.rate)} / sec </div></StyledConnectWrapper></StyledTD><StyledTD></StyledTD></StyledTR>
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
                <StyledTD><ProductionIcon factory={tree.factory}/></StyledTD>
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

const StyledError = styled.div`
font-size: 1.5rem;
color: red;
`

const App: React.FC = () => {
    const {id, rate, machines, enabledRecipes} = useAppSelector(state => state.productInput)
    const target = useMemo(
        () => ({inputs:[{id,rate}], machines, enabledRecipes}), [id, rate, machines, enabledRecipes])
    const [error, setError] = useState<string | undefined>(undefined)
    const factories = useMemo(() => {
        try {
            setError(undefined);
            return lpSolver(target, data.recipes, data.items)
        } catch(e) {
            setError(e.message)
            return {factories:[]};
        }
    }, [target])
    const trees = useMemo(() => buildTrees(factories, [{id,rate}]), [factories, target])
    return <>
        <ProductInput/>
        {error === undefined ? 
        <ProductTreesDisplay trees={trees}/>: <StyledError>{error}</StyledError>}
    </>
}

export default App;