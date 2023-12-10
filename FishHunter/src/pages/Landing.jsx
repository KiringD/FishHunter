import React from "react"
import Header from "../components/Header"
import StartButton from "../components/StartButton"
import Footer from "../components/Footer"
import Virus from "../components/Virus"
import MainTitle from "../components/MainTitle"
import "../css/main.css"
import "../css/landing.css"

class Landing extends React.Component {
    render() {
        return (
            <div>
                <Header display="inline-block" title="FishHunter" />
                <Virus height="25rem" width="25rem" right="15rem" top="8rem" rotate_degree={0.5} fill="#ADE0DF"></Virus>
                <Virus height="15rem" width="14rem" left="15rem" bottom="8rem" rotate_degree={-1} fill="#3A506B"></Virus>
                <div className="buttonContainer">
                    <MainTitle></MainTitle>
                    <StartButton style={{ zIndex: 1 }}></StartButton>
                </div>
                <Footer></Footer>
            </div>
        )
    }

}

export default Landing