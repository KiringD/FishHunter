import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Virus from "../components/Virus"
import styles from "../css/platform.module.css"
import "../css/main.css"
import EmptySiteElement from "../components/EmptySiteElement"
import SiteElement from "../components/SiteElement"

class EmptySite extends React.Component {
    render() {
        return(
            <div className={styles.EmptyPlaceholder}>
                <div>
                    Выберите сайт для работы или добавьте новый!
                </div>
            </div>
        )
    }
    
}

export default EmptySite