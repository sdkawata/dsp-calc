import React, { useState } from "react"
import data from "../data/data.json"
import icon from "../data/icons.png"
import styled from "styled-components"
import { simpleSolver } from "./simpleSolver"
import { TargetProducts } from "./types"

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
                        }}><Icon id={item.id}/></span>)}
                    </StyledProductSelect>
                }
                </StyledProductSelectWrapper>
            <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}/> / sec
        </div>
}


const App: React.FC = () => {
    return <>
        <ProductInput onChange={(target) => {console.log(simpleSolver(target, data.recipes))}}/>
    </>
}

export default App;