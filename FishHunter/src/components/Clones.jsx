import React from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Virus from "../components/Virus"
import styles from "../css/platform.module.css"
import "../css/main.css"
import EmptySiteElement from "../components/EmptySiteElement"
import SiteElement from "../components/SiteElement"
import EmptySite from "./EmptySite"
import AddSite from "./AddSite"
import PlaceholderSiteElement from "./PlaceholderSiteElement"
import CloneElement from "./CloneElement"

class Clones extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        if (this.props.clones != null) {
            return (<div className={styles.CloneContainer}>
                {this.props.clones.map((clone) => (
                    <CloneElement clone={clone} key={clone.id} onCloneDelete={this.props.onCloneDelete} />
                ))}
            </div>)
        }
        else {
            return (<div className={styles.CloneContainer}></div>)
        }

    }



}

export default Clones